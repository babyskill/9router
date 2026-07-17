import { NextResponse } from "next/server";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { DATA_DIR } from "@/lib/dataDir";

const sanitizeSkillId = (skillId) =>
  (skillId || "").trim().replace(/[^a-zA-Z0-9_-]/g, "");

const skillDirExists = (projectRoot, skillId) => {
  if (!skillId) return false;
  const skillDir = path.join(projectRoot, "skills", skillId);
  return fs.existsSync(skillDir) && fs.statSync(skillDir).isDirectory();
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pkg = searchParams.get("package") || searchParams.get("skill");
  const requestedSkills = searchParams.get("skills");
  const groupPackages = ["core", "skills", "workflows"];
  const isCustomBundle = pkg === "custom" || requestedSkills !== null;
  const projectRoot = process.cwd();
  const sanitizedPkg = sanitizeSkillId(pkg);

  if (
    !isCustomBundle &&
    !groupPackages.includes(pkg) &&
    !skillDirExists(projectRoot, sanitizedPkg)
  ) {
    return NextResponse.json(
      { error: "Invalid package parameter" },
      { status: 400 }
    );
  }

  try {
    let zipBuffer;
    let filename = `awkit-${pkg}.zip`;

    if (isCustomBundle) {
      const selectedSkillIds = (requestedSkills || "")
        .split(",")
        .map((skillId) => sanitizeSkillId(skillId))
        .filter((skillId) => skillDirExists(projectRoot, skillId));

      if (selectedSkillIds.length === 0) {
        return NextResponse.json(
          { error: "No valid skills selected" },
          { status: 400 }
        );
      }

      const zip = new AdmZip();

      for (const skillId of selectedSkillIds) {
        const skillDir = path.join(projectRoot, "skills", skillId);
        zip.addLocalFolder(skillDir, `skills/${skillId}`);
      }

      zipBuffer = zip.toBuffer();
      filename = "awkit-custom-skills.zip";
    } else if (pkg === "skills") {
      const skillsDir = path.join(projectRoot, "skills");

      if (fs.existsSync(skillsDir)) {
        const zip = new AdmZip();
        zip.addLocalFolder(skillsDir, "skills");
        zipBuffer = zip.toBuffer();
      }
    } else if (!groupPackages.includes(pkg) && skillDirExists(projectRoot, sanitizedPkg)) {
      const skillDir = path.join(projectRoot, "skills", sanitizedPkg);
      const zip = new AdmZip();
      zip.addLocalFolder(skillDir);
      zipBuffer = zip.toBuffer();
      filename = `awkit-${sanitizedPkg}.zip`;
    }

    if (!zipBuffer) {
      const filePath = path.join(DATA_DIR, "storage", "awkit", `${pkg}.zip`);

      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: `Package '${pkg}' not found on server` },
          { status: 404 }
        );
      }

      zipBuffer = fs.readFileSync(filePath);
    }

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to stream file: ${e.message}` },
      { status: 500 }
    );
  }
}
