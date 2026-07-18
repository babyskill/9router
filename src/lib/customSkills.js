import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { DATA_DIR } from "@/lib/dataDir";

export const BUILT_IN_ICONS = {
  "9router": "hub",
  "9router-chat": "chat",
  "9router-embeddings": "fingerprint",
  "9router-image": "image",
  "9router-stt": "mic",
  "9router-tts": "volume_up",
  "9router-web-fetch": "download",
  "9router-web-search": "search",
};

export const builtInSkillsDirectory = path.join(process.cwd(), "skills");
export const customSkillsDirectory = path.join(DATA_DIR, "skills");
export const bundleTempDirectory = path.join(DATA_DIR, "storage", "awkit", "temp");

export function capitalizeFolderName(folderName) {
  return folderName
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function sanitizeSkillId(value) {
  return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "");
}

function parseFrontmatterValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}\\s*:\\s*(.*)$`, "m"));

  if (!match) {
    return null;
  }

  return match[1].trim().replace(/^(["'])(.*)\1$/, "$2");
}

export function parseSkillMarkdown(contents, fallbackName) {
  const fallback = {
    name: fallbackName,
    description: "No description provided.",
  };

  const frontmatterMatch = String(contents || "").match(
    /^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/
  );

  if (!frontmatterMatch) {
    return fallback;
  }

  return {
    name: parseFrontmatterValue(frontmatterMatch[1], "name") || fallback.name,
    description:
      parseFrontmatterValue(frontmatterMatch[1], "description") ||
      fallback.description,
  };
}

export function parseSKILLmd(filePath) {
  const fallbackName = capitalizeFolderName(path.basename(path.dirname(filePath)));

  try {
    return parseSkillMarkdown(fs.readFileSync(filePath, "utf8"), fallbackName);
  } catch {
    return {
      name: fallbackName,
      description: "No description provided.",
    };
  }
}

export function readSkillMetadata(skillDirectory, skillId) {
  const skillFilePath = path.join(skillDirectory, "SKILL.md");

  if (fs.existsSync(skillFilePath)) {
    return parseSKILLmd(skillFilePath);
  }

  return {
    name: capitalizeFolderName(skillId),
    description: "No description provided.",
  };
}

export function isBuiltInSkill(skillId) {
  return fs.existsSync(path.join(builtInSkillsDirectory, skillId, "SKILL.md"));
}

export function isCustomSkill(skillId) {
  return fs.existsSync(path.join(customSkillsDirectory, skillId));
}

export function skillExists(skillId) {
  return isCustomSkill(skillId) || isBuiltInSkill(skillId);
}

export function resolveSkillDirectory(skillId) {
  const customDirectory = path.join(customSkillsDirectory, skillId);

  if (fs.existsSync(customDirectory)) {
    return { directory: customDirectory, isCustom: true };
  }

  const builtInDirectory = path.join(builtInSkillsDirectory, skillId);

  if (fs.existsSync(builtInDirectory)) {
    return { directory: builtInDirectory, isCustom: false };
  }

  return null;
}

export function sanitizeRelativePath(value) {
  const normalized = String(value || "").replace(/\\/g, "/");

  if (
    !normalized ||
    normalized.startsWith("/") ||
    /^[a-zA-Z]:\//.test(normalized) ||
    normalized.includes("\0")
  ) {
    return null;
  }

  const segments = normalized.split("/").filter((segment) => segment.length > 0);

  if (segments.length === 0 || segments.some((segment) => segment === "." || segment === "..")) {
    return null;
  }

  return segments.join("/");
}

export function resolveWithinDirectory(baseDirectory, relativePath) {
  const sanitized = sanitizeRelativePath(relativePath);

  if (!sanitized) {
    return null;
  }

  const absolutePath = path.resolve(baseDirectory, sanitized);
  const boundary = path.resolve(baseDirectory) + path.sep;

  if (!absolutePath.startsWith(boundary)) {
    return null;
  }

  return { absolutePath, relativePath: sanitized };
}

export function zipContainsTraversal(zip) {
  return zip.getEntries().some((entry) => {
    const entryName = entry.entryName.replace(/\\/g, "/");
    return (
      entryName.startsWith("/") ||
      /^[a-zA-Z]:\//.test(entryName) ||
      entryName.split("/").includes("..")
    );
  });
}

export function listSkillFiles(skillDirectory) {
  const files = [];

  const walk = (directory, prefix) => {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        walk(path.join(directory, entry.name), relativePath);
      } else if (entry.isFile()) {
        files.push(relativePath);
      }
    }
  };

  walk(skillDirectory, "");
  return files.sort();
}

export function copyBuiltInSkillToCustom(skillId) {
  const builtInDirectory = path.join(builtInSkillsDirectory, skillId);
  const customDirectory = path.join(customSkillsDirectory, skillId);

  if (fs.existsSync(customDirectory) || !fs.existsSync(builtInDirectory)) {
    return customDirectory;
  }

  fs.mkdirSync(customSkillsDirectory, { recursive: true });
  fs.cpSync(builtInDirectory, customDirectory, { recursive: true });
  return customDirectory;
}

export function listWorkflowsFromZip() {
  const zipPath = path.join(DATA_DIR, "storage", "awkit", "workflows.zip");
  if (!fs.existsSync(zipPath)) return [];

  try {
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();
    const workflows = [];

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      if (!entry.entryName.endsWith(".md")) continue;
      if (!entry.entryName.startsWith("workflows/")) continue;

      let id = entry.entryName.slice("workflows/".length);
      if (id.endsWith(".md")) {
        id = id.slice(0, -3);
      }

      const contents = entry.getData().toString("utf8");
      
      // Parse metadata
      let name = id.split("/").pop(); // default to filename
      name = name.split(/[-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      let description = "No description provided.";

      // Check frontmatter first
      const frontmatterMatch = contents.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/);
      if (frontmatterMatch) {
        const fm = frontmatterMatch[1];
        const matchName = fm.match(/^name\s*:\s*(.*)$/m);
        const matchDesc = fm.match(/^description\s*:\s*(.*)$/m);
        if (matchName) name = matchName[1].trim().replace(/^(["'])(.*)\1$/, "$2");
        if (matchDesc) description = matchDesc[1].trim().replace(/^(["'])(.*)\1$/, "$2");
      } else {
        // Fallback to H1 and first paragraph
        const lines = contents.split("\n");
        for (const line of lines) {
          if (line.trim().startsWith("# ")) {
            name = line.trim().slice(2).trim();
            break;
          }
        }
        let foundH1 = false;
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("# ")) {
            foundH1 = true;
            continue;
          }
          if (foundH1 && trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("-") && !trimmed.startsWith(">")) {
            description = trimmed;
            if (description.length > 150) {
              description = description.slice(0, 150) + "...";
            }
            break;
          }
        }
      }

      workflows.push({
        id,
        name,
        description,
      });
    }

    return workflows.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Failed to list workflows from zip:", error);
    return [];
  }
}
