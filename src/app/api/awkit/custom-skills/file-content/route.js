import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  copyBuiltInSkillToCustom,
  resolveSkillDirectory,
  resolveWithinDirectory,
  sanitizeSkillId,
} from "@/lib/customSkills";

export async function GET(request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const requestedId = searchParams.get("id") || searchParams.get("skillId") || "";
    const skillId = sanitizeSkillId(requestedId);
    const resolvedSkill = resolveSkillDirectory(skillId);

    if (!skillId || skillId !== requestedId) {
      return NextResponse.json({ error: "Invalid skill id" }, { status: 400 });
    }

    if (!resolvedSkill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const resolvedPath = resolveWithinDirectory(
      resolvedSkill.directory,
      searchParams.get("path") || ""
    );

    if (!resolvedPath) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    if (!fs.existsSync(resolvedPath.absolutePath) || !fs.statSync(resolvedPath.absolutePath).isFile()) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({
      path: resolvedPath.relativePath,
      content: fs.readFileSync(resolvedPath.absolutePath, "utf8"),
      readOnly: !resolvedSkill.isCustom,
    });
  } catch (error) {
    console.error("Failed to read skill file:", error);
    return NextResponse.json({ error: "Failed to read skill file" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const requestedId = body.id || body.skillId || "";
    const skillId = sanitizeSkillId(requestedId);

    if (!skillId || skillId !== requestedId || typeof body.content !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const customDirectory = copyBuiltInSkillToCustom(skillId);
    const resolvedPath = resolveWithinDirectory(customDirectory, body.path);

    if (!resolvedPath) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    fs.mkdirSync(path.dirname(resolvedPath.absolutePath), { recursive: true });
    fs.writeFileSync(resolvedPath.absolutePath, body.content, "utf8");
    return NextResponse.json({ success: true, path: resolvedPath.relativePath });
  } catch (error) {
    console.error("Failed to write skill file:", error);
    return NextResponse.json({ error: "Failed to write skill file" }, { status: 500 });
  }
}
