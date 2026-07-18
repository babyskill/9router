import AdmZip from "adm-zip";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { NextResponse } from "next/server";
import {
  bundleTempDirectory,
  capitalizeFolderName,
  parseSkillMarkdown,
  sanitizeSkillId,
  skillExists,
} from "@/lib/customSkills";

function findSkillsInDirectory(dir, baseDir = dir) {
  const skills = [];
  if (!fs.existsSync(dir)) return skills;

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      skills.push(...findSkillsInDirectory(fullPath, baseDir));
    } else if (item.name === "SKILL.md") {
      try {
        const relativeDir = path.relative(baseDir, dir);
        const folderName = path.basename(dir);
        const skillId = sanitizeSkillId(folderName);

        if (skillId && skillId === folderName) {
          const content = fs.readFileSync(fullPath, "utf8");
          const metadata = parseSkillMarkdown(content, capitalizeFolderName(skillId));
          skills.push({
            id: skillId,
            name: metadata.name,
            description: metadata.description,
            exists: skillExists(skillId),
            entryPrefix: relativeDir ? relativeDir.replace(/\\/g, "/") + "/" : "",
          });
        }
      } catch (e) {
        console.error("Failed to parse skill metadata in directory:", e);
      }
    }
  }

  const uniqueSkills = new Map();
  for (const skill of skills) {
    const existing = uniqueSkills.get(skill.id);
    if (!existing || skill.entryPrefix.length < existing.entryPrefix.length) {
      uniqueSkills.set(skill.id, skill);
    }
  }

  return Array.from(uniqueSkills.values()).sort((left, right) =>
    left.id.localeCompare(right.id)
  );
}

export async function POST(request) {
  const tempFileId = crypto.randomUUID();
  fs.mkdirSync(bundleTempDirectory, { recursive: true });
  const tempFilePath = path.join(bundleTempDirectory, `temp-bundle-${tempFileId}.zip`);
  const extractedDirPath = path.join(bundleTempDirectory, `temp-bundle-${tempFileId}`);

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(tempFilePath, buffer);

    // Try extracting using system unzip first (highly optimized, supports ZIP64 and all metadata signatures)
    try {
      fs.mkdirSync(extractedDirPath, { recursive: true });
      execSync(`unzip -q -o "${tempFilePath}" -d "${extractedDirPath}"`);
    } catch (cliError) {
      console.warn("System unzip CLI failed, attempting adm-zip fallback:", cliError);
      try {
        const zip = new AdmZip(tempFilePath);
        zip.extractAllTo(extractedDirPath, true);
      } catch (zipError) {
        throw new Error(`Failed to extract zip file: ${zipError.message}`);
      }
    }

    const skills = findSkillsInDirectory(extractedDirPath);

    if (skills.length === 0) {
      // Cleanup
      try {
        fs.rmSync(tempFilePath, { force: true });
        fs.rmSync(extractedDirPath, { recursive: true, force: true });
      } catch {}
      return NextResponse.json(
        { error: "No skills found in bundle (missing SKILL.md files)" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      tempFileId,
      skills,
    });
  } catch (error) {
    console.error("Failed to upload skill bundle:", error);
    // Cleanup on error
    try {
      fs.rmSync(tempFilePath, { force: true });
      if (fs.existsSync(extractedDirPath)) {
        fs.rmSync(extractedDirPath, { recursive: true, force: true });
      }
    } catch {}

    return NextResponse.json(
      { error: `Failed to upload skill bundle: ${error.message}` },
      { status: 500 }
    );
  }
}
