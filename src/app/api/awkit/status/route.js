import { stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { DATA_DIR } from "@/lib/dataDir";

const PACKAGES = ["core", "skills", "workflows"];

async function getPackageStatus(packageName) {
  const filePath = path.join(
    DATA_DIR,
    "storage",
    "awkit",
    `${packageName}.zip`
  );

  try {
    const fileStats = await stat(filePath);

    return {
      exists: true,
      size: fileStats.size,
      mtime: fileStats.mtime.toISOString(),
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { exists: false, size: 0, mtime: null };
    }

    throw error;
  }
}

export async function GET() {
  try {
    const packageStatuses = await Promise.all(
      PACKAGES.map(async (packageName) => [
        packageName,
        await getPackageStatus(packageName),
      ])
    );

    return NextResponse.json({ status: Object.fromEntries(packageStatuses) });
  } catch (error) {
    console.error("Failed to retrieve AWKit package status:", error);
    return NextResponse.json(
      { error: "Failed to retrieve package status" },
      { status: 500 }
    );
  }
}
