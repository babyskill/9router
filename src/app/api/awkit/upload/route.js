import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { DATA_DIR } from "@/lib/dataDir";

const VALID_PACKAGES = ["core", "skills", "workflows"];

export async function POST(request) {
  try {
    const formData = await request.formData();
    const packageName = formData.get("package");
    const file = formData.get("file");

    if (typeof packageName !== "string" || !VALID_PACKAGES.includes(packageName)) {
      return NextResponse.json(
        { error: "Invalid package parameter" },
        { status: 400 }
      );
    }

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const storageDirectory = path.join(DATA_DIR, "storage", "awkit");
    const filePath = path.join(storageDirectory, `${packageName}.zip`);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await mkdir(storageDirectory, { recursive: true });
    await writeFile(filePath, fileBuffer);

    return NextResponse.json({
      success: true,
      message: `Package ${packageName} uploaded successfully`,
    });
  } catch (error) {
    console.error("Failed to upload AWKit package:", error);
    return NextResponse.json(
      { error: "Failed to upload package" },
      { status: 500 }
    );
  }
}
