import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  bundleTempDirectory,
  customSkillsDirectory,
  readSkillMetadata,
  sanitizeSkillId,
  zipContainsTraversal,
} from "@/lib/customSkills";

function findSkillEntryPrefix(zip, skillId) {
  let bestPrefix = null;

  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) {
      continue;
    }

    const segments = entry.entryName.replace(/\\/g, "/").split("/").filter(Boolean);

    if (
      segments.length < 2 ||
      segments[segments.length - 1] !== "SKILL.md" ||
      segments[segments.length - 2] !== skillId
    ) {
      continue;
    }

    const prefix = segments.slice(0, -1).join("/") + "/";

    if (!bestPrefix || prefix.length < bestPrefix.length) {
      bestPrefix = prefix;
    }
  }

  return bestPrefix;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const tempFileId = String(body.tempFileId || "");
    const selectedSkills = Array.isArray(body.selectedSkills) ? body.selectedSkills : [];

    if (!/^[0-9a-fA-F-]{36}$/.test(tempFileId)) {
      return NextResponse.json({ error: "Invalid tempFileId" }, { status: 400 });
    }

    if (selectedSkills.length === 0) {
      return NextResponse.json({ error: "No skills selected" }, { status: 400 });
    }

    const tempFilePath = path.join(bundleTempDirectory, `temp-bundle-${tempFileId}.zip`);

    if (!fs.existsSync(tempFilePath)) {
      return NextResponse.json(
        { error: "Bundle expired or not found. Please upload again." },
        { status: 404 }
      );
    }

    const zip = new AdmZip(tempFilePath);

    if (zipContainsTraversal(zip)) {
      fs.rmSync(tempFilePath, { force: true });
      return NextResponse.json({ error: "Invalid ZIP entry path" }, { status: 400 });
    }

    const extracted = [];
    const skipped = [];

    for (const requestedId of selectedSkills) {
      const skillId = sanitizeSkillId(requestedId);

      if (!skillId || skillId !== requestedId) {
        skipped.push({ id: String(requestedId), reason: "Invalid skill id" });
        continue;
      }

      const entryPrefix = findSkillEntryPrefix(zip, skillId);

      if (!entryPrefix) {
        skipped.push({ id: skillId, reason: "Skill not found in bundle" });
        continue;
      }

      const skillDirectory = path.join(customSkillsDirectory, skillId);
      fs.rmSync(skillDirectory, { recursive: true, force: true });
      fs.mkdirSync(skillDirectory, { recursive: true });

      for (const entry of zip.getEntries()) {
        const entryName = entry.entryName.replace(/\\/g, "/");

        if (entry.isDirectory || !entryName.startsWith(entryPrefix)) {
          continue;
        }

        const relativePath = entryName.slice(entryPrefix.length);

        if (!relativePath) {
          continue;
        }

        const targetPath = path.resolve(skillDirectory, relativePath);

        if (!targetPath.startsWith(path.resolve(skillDirectory) + path.sep)) {
          continue;
        }

        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, entry.getData());
      }

      extracted.push({
        id: skillId,
        ...readSkillMetadata(skillDirectory, skillId),
        isBuiltIn: false,
        icon: "extension",
      });
    }

    fs.rmSync(tempFilePath, { force: true });
    return NextResponse.json({ success: true, extracted, skipped });
  } catch (error) {
    console.error("Failed to extract skill bundle:", error);
    return NextResponse.json(
      { error: "Failed to extract skill bundle" },
      { status: 500 }
    );
  }
}
