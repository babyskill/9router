import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getApiKeyByKey, getSkillPackageById } from "@/lib/localDb";
import {
  builtInSkillsDirectory,
  customSkillsDirectory,
  resolveSkillDirectory,
  listWorkflowsFromZip,
  getSkillFolderHash,
} from "@/lib/customSkills";

export const dynamic = "force-dynamic";

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

function getSkillFolderUpdatedAt(skillId) {
  const res = resolveSkillDirectory(skillId);
  if (!res || !fs.existsSync(res.directory)) return new Date().toISOString();
  try {
    const stats = fs.statSync(res.directory);
    return stats.mtime.toISOString();
  } catch (_) {
    return new Date().toISOString();
  }
}

export async function GET(request) {
  const apiKey = extractApiKey(request);
  if (!apiKey) {
    return NextResponse.json({ error: "API Key is required" }, { status: 401 });
  }

  console.log("=== MANIFEST API DEBUG ===");
  console.log("builtInSkillsDirectory:", builtInSkillsDirectory);
  console.log("customSkillsDirectory:", customSkillsDirectory);
  console.log("Test resolution quality/plan-eng-review:", resolveSkillDirectory("quality/plan-eng-review"));

  try {
    const keyDetails = await getApiKeyByKey(apiKey);
    if (!keyDetails || !keyDetails.isActive) {
      return NextResponse.json({ error: "Invalid or inactive API Key" }, { status: 401 });
    }

    let skillPackage = null;
    if (keyDetails.skillPackageId) {
      skillPackage = await getSkillPackageById(keyDetails.skillPackageId);
    }

    const allSystemWorkflows = listWorkflowsFromZip();
    let selectedSkills = [];
    let selectedWorkflows = [];

    if (skillPackage) {
      // Package bound to this API Key
      selectedSkills = skillPackage.skills || [];
      selectedWorkflows = skillPackage.workflows || [];
    } else {
      // Default: Allow all skills & workflows
      // 1. Gather all skills from server directories
      const skillsSet = new Set();
      if (fs.existsSync(builtInSkillsDirectory)) {
        fs.readdirSync(builtInSkillsDirectory, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .forEach((entry) => skillsSet.add(entry.name));
      }
      if (fs.existsSync(customSkillsDirectory)) {
        fs.readdirSync(customSkillsDirectory, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .forEach((entry) => skillsSet.add(entry.name));
      }
      selectedSkills = Array.from(skillsSet);

      // 2. Gather all workflows from system zip
      selectedWorkflows = allSystemWorkflows.map((w) => w.id);
    }

    // Map skills to manifest metadata, keeping only those that actually exist on the server
    const skillsManifest = selectedSkills
      .filter((skillId) => {
        const res = resolveSkillDirectory(skillId);
        return res && fs.existsSync(res.directory);
      })
      .map((skillId) => {
        return {
          id: skillId,
          hash: getSkillFolderHash(skillId),
          updatedAt: getSkillFolderUpdatedAt(skillId),
        };
      });

    // Map workflows to manifest metadata, keeping only those that actually exist in the workflows zip
    const workflowsManifest = selectedWorkflows
      .filter((wfId) => allSystemWorkflows.some((w) => w.id === wfId))
      .map((wfId) => {
        const match = allSystemWorkflows.find((w) => w.id === wfId);
        return {
          id: wfId,
          hash: match ? match.hash : "",
          updatedAt: match ? match.updatedAt : new Date().toISOString(),
        };
      });

    return NextResponse.json({
      packageName: skillPackage ? skillPackage.name : "All Skills & Workflows (Default)",
      skills: skillsManifest,
      workflows: workflowsManifest,
    });
  } catch (error) {
    console.error("Failed to generate package manifest:", error);
    return NextResponse.json(
      { error: `Failed to generate manifest: ${error.message}` },
      { status: 500 }
    );
  }
}
