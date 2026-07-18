import { NextResponse } from "next/server";
import {
  getSkillPackages,
  createSkillPackage,
  updateSkillPackage,
  deleteSkillPackage,
} from "@/lib/localDb";

export async function GET() {
  try {
    const pkgs = await getSkillPackages();
    return NextResponse.json(pkgs);
  } catch (e) {
    console.error("Failed to retrieve skill packages:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name || !data.name.trim()) {
      return NextResponse.json({ error: "Package name is required" }, { status: 400 });
    }
    const pkg = await createSkillPackage({
      name: data.name.trim(),
      description: data.description || "",
      skills: data.skills || [],
      workflows: data.workflows || [],
    });
    return NextResponse.json(pkg);
  } catch (e) {
    console.error("Failed to create skill package:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    const data = await request.json();
    if (!id && data.id) id = data.id;

    if (!id) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 });
    }
    const updated = await updateSkillPackage(id, {
      name: data.name?.trim(),
      description: data.description,
      skills: data.skills,
      workflows: data.workflows,
    });
    if (!updated) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Failed to update skill package:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 });
    }
    const success = await deleteSkillPackage(id);
    if (!success) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, id });
  } catch (e) {
    console.error("Failed to delete skill package:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
