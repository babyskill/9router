import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  copyBuiltInSkillToCustom,
  customSkillsDirectory,
  listSkillFiles,
  resolveSkillDirectory,
  resolveWithinDirectory,
  sanitizeSkillId,
} from "@/lib/customSkills";

function readParameters(request) {
  const searchParams = new URL(request.url).searchParams;
  return {
    skillId: searchParams.get("id") || searchParams.get("skillId") || "",
    filePath: searchParams.get("path") || "",
  };
}

export async function GET(request) {
  try {
    const { skillId: requestedId } = readParameters(request);
    const skillId = sanitizeSkillId(requestedId);

    if (!skillId || skillId !== requestedId) {
      return NextResponse.json({ error: "Invalid skill id" }, { status: 400 });
    }

    const resolved = resolveSkillDirectory(skillId);

    if (!resolved) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json({ files: listSkillFiles(resolved.directory) });
  } catch (error) {
    console.error("Failed to list skill files:", error);
    return NextResponse.json({ error: "Failed to list skill files" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const requestedId = body.id || body.skillId || "";
    const skillId = sanitizeSkillId(requestedId);

    if (!skillId || skillId !== requestedId) {
      return NextResponse.json({ error: "Invalid skill id" }, { status: 400 });
    }

    const customDirectory = copyBuiltInSkillToCustom(skillId);
    const resolvedPath = resolveWithinDirectory(customDirectory, body.path);

    if (!resolvedPath) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    fs.mkdirSync(path.dirname(resolvedPath.absolutePath), { recursive: true });
    fs.writeFileSync(resolvedPath.absolutePath, "", { flag: "wx" });
    return NextResponse.json({ success: true, path: resolvedPath.relativePath });
  } catch (error) {
    if (error?.code === "EEXIST") {
      return NextResponse.json({ error: "File already exists" }, { status: 409 });
    }

    console.error("Failed to create skill file:", error);
    return NextResponse.json({ error: "Failed to create skill file" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { skillId: requestedId, filePath } = readParameters(request);
    const skillId = sanitizeSkillId(requestedId);

    if (!skillId || skillId !== requestedId) {
      return NextResponse.json({ error: "Invalid skill id" }, { status: 400 });
    }

    const resolvedPath = resolveWithinDirectory(
      path.join(customSkillsDirectory, skillId),
      filePath
    );

    if (!resolvedPath) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    if (resolvedPath.relativePath.toLowerCase() === "skill.md") {
      return NextResponse.json({ error: "Cannot delete SKILL.md" }, { status: 400 });
    }

    if (!fs.existsSync(resolvedPath.absolutePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const stats = fs.statSync(resolvedPath.absolutePath);

    if (!stats.isFile()) {
      return NextResponse.json({ error: "Path is not a file" }, { status: 400 });
    }

    fs.unlinkSync(resolvedPath.absolutePath);
    return NextResponse.json({ success: true, path: resolvedPath.relativePath });
  } catch (error) {
    console.error("Failed to delete skill file:", error);
    return NextResponse.json({ error: "Failed to delete skill file" }, { status: 500 });
  }
}
