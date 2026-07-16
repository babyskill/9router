import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const BUILT_IN_SKILL_IDS = [
  "9router",
  "9router-chat",
  "9router-embeddings",
  "9router-image",
  "9router-stt",
  "9router-tts",
  "9router-web-fetch",
  "9router-web-search",
];

const BUILT_IN_ICONS = {
  "9router": "hub",
  "9router-chat": "chat",
  "9router-embeddings": "fingerprint",
  "9router-image": "image",
  "9router-stt": "mic",
  "9router-tts": "volume_up",
  "9router-web-fetch": "download",
  "9router-web-search": "search",
};

const skillsDirectory = path.join(process.cwd(), "skills");

function capitalizeFolderName(folderName) {
  return folderName
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function sanitizeSkillId(value) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "");
}

function parseFrontmatterValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}\\s*:\\s*(.*)$`, "m"));

  if (!match) {
    return null;
  }

  return match[1].trim().replace(/^(["'])(.*)\1$/, "$2");
}

function parseSKILLmd(filePath) {
  const fallbackName = capitalizeFolderName(path.basename(path.dirname(filePath)));
  const fallback = {
    name: fallbackName,
    description: "No description provided.",
  };

  try {
    const contents = fs.readFileSync(filePath, "utf8");
    const frontmatterMatch = contents.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/);

    if (!frontmatterMatch) {
      return fallback;
    }

    return {
      name: parseFrontmatterValue(frontmatterMatch[1], "name") || fallback.name,
      description:
        parseFrontmatterValue(frontmatterMatch[1], "description") ||
        fallback.description,
    };
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const entries = fs.existsSync(skillsDirectory)
      ? fs.readdirSync(skillsDirectory, { withFileTypes: true })
      : [];

    const skills = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const skillId = entry.name;
        const skillFilePath = path.join(skillsDirectory, skillId, "SKILL.md");
        const metadata = fs.existsSync(skillFilePath)
          ? parseSKILLmd(skillFilePath)
          : {
              name: capitalizeFolderName(skillId),
              description: "No description provided.",
            };
        const isBuiltIn = BUILT_IN_SKILL_IDS.includes(skillId);

        return {
          id: skillId,
          ...metadata,
          isBuiltIn,
          icon: isBuiltIn ? BUILT_IN_ICONS[skillId] : "extension",
        };
      });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Failed to list custom skills:", error);
    return NextResponse.json(
      { error: "Failed to list skills" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const originalName = path.basename(file.name || "", ".zip");
    const skillId = sanitizeSkillId(originalName);

    if (!skillId) {
      return NextResponse.json(
        { error: "Invalid skill filename" },
        { status: 400 }
      );
    }

    if (BUILT_IN_SKILL_IDS.includes(skillId)) {
      return NextResponse.json(
        { error: "Cannot overwrite built-in skills" },
        { status: 400 }
      );
    }

    const zip = new AdmZip(Buffer.from(await file.arrayBuffer()));
    const containsTraversal = zip.getEntries().some((entry) => {
      const entryName = entry.entryName.replace(/\\/g, "/");
      return (
        entryName.startsWith("/") ||
        /^[a-zA-Z]:\//.test(entryName) ||
        entryName.split("/").includes("..")
      );
    });

    if (containsTraversal) {
      return NextResponse.json(
        { error: "Invalid ZIP entry path" },
        { status: 400 }
      );
    }

    const skillDirectory = path.join(skillsDirectory, skillId);
    fs.mkdirSync(skillDirectory, { recursive: true });
    zip.extractAllTo(skillDirectory, true);

    const skillFilePath = path.join(skillDirectory, "SKILL.md");
    const metadata = fs.existsSync(skillFilePath)
      ? parseSKILLmd(skillFilePath)
      : {
          name: capitalizeFolderName(skillId),
          description: "No description provided.",
        };

    return NextResponse.json({
      id: skillId,
      ...metadata,
      isBuiltIn: false,
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

    if (!skillId) {
      return NextResponse.json({ error: "Invalid skill id" }, { status: 400 });
    }

    if (BUILT_IN_SKILL_IDS.includes(requestedId) || BUILT_IN_SKILL_IDS.includes(skillId)) {
      return NextResponse.json(
        { error: "Cannot delete built-in skills" },
        { status: 400 }
      );
    }

    const skillDirectory = path.join(skillsDirectory, skillId);

    if (fs.existsSync(skillDirectory)) {
      fs.rmSync(skillDirectory, { recursive: true, force: true });
    }

    return NextResponse.json({ success: true, id: skillId });
  } catch (error) {
    console.error("Failed to delete custom skill:", error);
    return NextResponse.json(
      { error: "Failed to delete custom skill" },
      { status: 500 }
    );
  }
}
