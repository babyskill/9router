import { NextResponse } from "next/server";
import { listWorkflowsFromZip } from "@/lib/customSkills";

export async function GET() {
  try {
    const workflows = listWorkflowsFromZip();
    return NextResponse.json(workflows);
  } catch (error) {
    console.error("Failed to list workflows:", error);
    return NextResponse.json({ error: "Failed to list workflows" }, { status: 500 });
  }
}
