import { NextResponse } from "next/server";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { DATA_DIR } from "@/lib/dataDir";
import { getApiKeyByKey, getSkillPackageById } from "@/lib/localDb";
import {
  resolveSkillDirectory,
  builtInSkillsDirectory,
  customSkillsDirectory,
} from "@/lib/customSkills";

const sanitizeSkillId = (skillId) =>
  (skillId || "").trim().replace(/[^a-zA-Z0-9_-]/g, "");

const skillDirExists = (projectRoot, skillId) => {
  if (!skillId) return false;
  const skillDir = resolveSkillDirectory(skillId)?.directory;
  return skillDir && fs.existsSync(skillDir) && fs.statSync(skillDir).isDirectory();
};

const extractApiKey = (req) => {
  const auth = req.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const keyHeader = req.headers.get("x-api-key");
  if (keyHeader) return keyHeader;
  const googHeader = req.headers.get("x-goog-api-key");
  if (googHeader) return googHeader;
  const { searchParams } = new URL(req.url);
  return searchParams.get("key") || null;
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

  // 1. Resolve API key and linked package
  const apiKey = extractApiKey(request);
  let skillPackage = null;
  if (apiKey) {
    try {
      const keyDetails = await getApiKeyByKey(apiKey);
      if (keyDetails?.skillPackageId) {
        skillPackage = await getSkillPackageById(keyDetails.skillPackageId);
      }
    } catch (e) {
      console.error("Failed to retrieve key/package details:", e);
    }
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
        const skillDir = resolveSkillDirectory(skillId)?.directory;
        if (skillDir) {
          zip.addLocalFolder(skillDir, `skills/${skillId}`);
        }
      }

      zipBuffer = zip.toBuffer();
      filename = "awkit-custom-skills.zip";
    } else if (pkg === "skills") {
      // If a package is bound to this key, package only those skills
      if (skillPackage) {
        const selectedSkillIds = skillPackage.skills || [];
        if (selectedSkillIds.length === 0) {
          return NextResponse.json(
            { error: "No skills configured in the assigned package" },
            { status: 400 }
          );
        }

        const zip = new AdmZip();
        let addedCount = 0;
        for (const skillId of selectedSkillIds) {
          const res = resolveSkillDirectory(skillId);
          if (res && fs.existsSync(res.directory)) {
            zip.addLocalFolder(res.directory, `skills/${skillId}`);
            addedCount++;
          }
        }
        if (addedCount === 0) {
          return NextResponse.json(
            { error: "No valid skills from the package found on the server" },
            { status: 404 }
          );
        }
        zipBuffer = zip.toBuffer();
      } else {
        // Default behavior: zip all skills (both built-in and custom)
        const zip = new AdmZip();
        let addedAny = false;

        if (fs.existsSync(builtInSkillsDirectory)) {
          const entries = fs.readdirSync(builtInSkillsDirectory, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isDirectory()) {
              zip.addLocalFolder(path.join(builtInSkillsDirectory, entry.name), `skills/${entry.name}`);
              addedAny = true;
            }
          }
        }

        if (fs.existsSync(customSkillsDirectory)) {
          const entries = fs.readdirSync(customSkillsDirectory, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isDirectory()) {
              zip.addLocalFolder(path.join(customSkillsDirectory, entry.name), `skills/${entry.name}`);
              addedAny = true;
            }
          }
        }

        if (addedAny) {
          zipBuffer = zip.toBuffer();
        }
      }
    } else if (!groupPackages.includes(pkg) && skillDirExists(projectRoot, sanitizedPkg)) {
      const skillDir = resolveSkillDirectory(sanitizedPkg)?.directory;
      if (skillDir) {
        const zip = new AdmZip();
        zip.addLocalFolder(skillDir);
        zipBuffer = zip.toBuffer();
        filename = `awkit-${sanitizedPkg}.zip`;
      }
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
