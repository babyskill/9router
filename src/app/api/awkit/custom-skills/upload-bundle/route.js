import AdmZip from "adm-zip";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  bundleTempDirectory,
  capitalizeFolderName,
  parseSkillMarkdown,
  sanitizeSkillId,
  skillExists,
  zipContainsTraversal,
} from "@/lib/customSkills";

function findBundleSkills(zip) {
  const skills = [];

  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) {
      continue;
    }

    const entryName = entry.entryName.replace(/\\/g, "/");
    const segments = entryName.split("/").filter(Boolean);

    if (segments[segments.length - 1] !== "SKILL.md") {
      continue;
    }

    const folderSegments = segments.slice(0, -1);

    if (folderSegments.length === 0) {
      continue;
    }

    const folderName = folderSegments[folderSegments.length - 1];
    const skillId = sanitizeSkillId(folderName);

    if (!skillId || skillId !== folderName) {
      continue;
    }

    const metadata = parseSkillMarkdown(
      entry.getData().toString("utf8"),
      capitalizeFolderName(skillId)
    );

    skills.push({
      id: skillId,
      name: metadata.name,
      description: metadata.description,
      exists: skillExists(skillId),
      entryPrefix: folderSegments.join("/") + "/",
    });
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
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempFileId = crypto.randomUUID();
    
    // Save to temp folder first so we can analyze the uploaded payload if parsing fails
    fs.mkdirSync(bundleTempDirectory, { recursive: true });
    const tempFilePath = path.join(bundleTempDirectory, `temp-bundle-${tempFileId}.zip`);
    fs.writeFileSync(tempFilePath, buffer);

    let zip;
    let skills = [];

    try {
      zip = new AdmZip(tempFilePath); // Use file path instead of buffer, sometimes adm-zip handles file paths better
      
      // Force lazy parse
      zip.getEntries();

      if (zipContainsTraversal(zip)) {
        // Clean up on error
        try { fs.unlinkSync(tempFilePath); } catch {}
        return NextResponse.json({ error: "Invalid ZIP entry path" }, { status: 400 });
      }

      skills = findBundleSkills(zip);
    } catch (zipError) {
      console.error("Failed to parse ZIP archive with adm-zip:", zipError);
      return NextResponse.json({
        error: `Invalid ZIP file structure: ${zipError.message}`,
        details: "The uploaded file may be corrupted, uses an unsupported format (like ZIP64), or is too large for the parser.",
        tempFileId // Keep ID so we can inspect the file on disk
      }, { status: 400 });
    }

    if (skills.length === 0) {
      try { fs.unlinkSync(tempFilePath); } catch {}
      return NextResponse.json(
        { error: "No skills found in bundle (missing SKILL.md files)" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      tempFileId,
      skills: skills.map(({ id, name, description, exists }) => ({
        id,
        name,
        description,
        exists,
      })),
    });
  } catch (error) {
    console.error("Failed to upload skill bundle:", error);
    return NextResponse.json(
      { error: `Failed to upload skill bundle: ${error.message}`, stack: error.stack },
      { status: 500 }
    );
  }
}
