import { NextResponse } from "next/server";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { SKILLS } from "@/shared/constants/skills";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pkg = searchParams.get("package") || searchParams.get("skill");
  const groupPackages = ["core", "skills", "workflows"];
  const skillIds = SKILLS.map((skill) => skill.id);

  if (!groupPackages.includes(pkg) && !skillIds.includes(pkg)) {
    return NextResponse.json(
      { error: "Invalid package parameter" },
      { status: 400 }
    );
  }

  try {
    const projectRoot = process.cwd();
    let zipBuffer;

    if (pkg === "skills") {
      const skillsDir = path.join(projectRoot, "skills");

      if (fs.existsSync(skillsDir)) {
        const zip = new AdmZip();
        zip.addLocalFolder(skillsDir, "skills");
        zipBuffer = zip.toBuffer();
      }
    } else if (skillIds.includes(pkg)) {
      const skillDir = path.join(projectRoot, "skills", pkg);

      if (fs.existsSync(skillDir)) {
        const zip = new AdmZip();
        zip.addLocalFolder(skillDir);
        zipBuffer = zip.toBuffer();
      }
    }

    if (!zipBuffer) {
      const filePath = path.join(projectRoot, "storage", "awkit", `${pkg}.zip`);

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
        "Content-Disposition": `attachment; filename="awkit-${pkg}.zip"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to stream file: ${e.message}` },
      { status: 500 }
    );
  }
}
