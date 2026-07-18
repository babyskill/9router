import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  BUILT_IN_ICONS,
  builtInSkillsDirectory,
  customSkillsDirectory,
  isBuiltInSkill,
  readSkillMetadata,
  sanitizeSkillId,
  zipContainsTraversal,
} from "@/lib/customSkills";

function listSkills(directory, isBuiltIn) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      id: entry.name,
      ...readSkillMetadata(path.join(directory, entry.name), entry.name),
      isBuiltIn,
      icon: isBuiltIn ? BUILT_IN_ICONS[entry.name] || "extension" : "extension",
    }));
}

export async function GET() {
  try {
    const mergedSkills = new Map();

    for (const skill of listSkills(builtInSkillsDirectory, true)) {
      mergedSkills.set(skill.id, skill);
    }

    for (const skill of listSkills(customSkillsDirectory, false)) {
      mergedSkills.set(skill.id, skill);
    }

    return NextResponse.json(
      Array.from(mergedSkills.values()).sort((left, right) =>
        left.name.localeCompare(right.name)
      )
    );
  } catch (error) {
    console.error("Failed to list custom skills:", error);
    return NextResponse.json({ error: "Failed to list skills" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const originalName = path.basename(file.name || "", path.extname(file.name || ""));
    const skillId = sanitizeSkillId(originalName);

    if (!skillId || skillId !== originalName) {
      return NextResponse.json({ error: "Invalid skill filename" }, { status: 400 });
    }

    const zip = new AdmZip(Buffer.from(await file.arrayBuffer()));

    if (zipContainsTraversal(zip)) {
      return NextResponse.json({ error: "Invalid ZIP entry path" }, { status: 400 });
    }

    const skillDirectory = path.join(customSkillsDirectory, skillId);
    fs.mkdirSync(customSkillsDirectory, { recursive: true });
    fs.rmSync(skillDirectory, { recursive: true, force: true });
    fs.mkdirSync(skillDirectory, { recursive: true });
    zip.extractAllTo(skillDirectory, true);

    return NextResponse.json({
      id: skillId,
      ...readSkillMetadata(skillDirectory, skillId),
      isBuiltIn: false,
      overridesBuiltIn: isBuiltInSkill(skillId),
      icon: "extension",
    });
  } catch (error) {
    console.error("Failed to upload custom skill:", error);
    return NextResponse.json(
      { error: "Failed to upload custom skill" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const requestedId = new URL(request.url).searchParams.get("id") || "";
    const skillId = sanitizeSkillId(requestedId);

    if (!skillId || skillId !== requestedId) {
      return NextResponse.json({ error: "Invalid skill id" }, { status: 400 });
    }

    const skillDirectory = path.join(customSkillsDirectory, skillId);

    if (!fs.existsSync(skillDirectory)) {
      return NextResponse.json({ error: "Custom skill not found" }, { status: 404 });
    }

    fs.rmSync(skillDirectory, { recursive: true, force: true });
    return NextResponse.json({ success: true, id: skillId });
  } catch (error) {
    console.error("Failed to delete custom skill:", error);
    return NextResponse.json(
      { error: "Failed to delete custom skill" },
      { status: 500 }
    );
  }
}
