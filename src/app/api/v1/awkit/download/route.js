import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pkg = searchParams.get("package"); // "core" hoặc "skills"

  if (pkg !== "core" && pkg !== "skills") {
    return NextResponse.json(
      { error: "Invalid package parameter. Use 'core' or 'skills'" },
      { status: 400 }
    );
  }

  const storageDir = path.join(process.cwd(), "storage", "awkit");
  const filePath = path.join(storageDir, `${pkg}.zip`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: `Package '${pkg}' not found on server` },
      { status: 404 }
    );
  }

  try {
    // Đọc file thành buffer để stream
    const fileBuffer = fs.readFileSync(filePath);
    
    return new NextResponse(fileBuffer, {
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
