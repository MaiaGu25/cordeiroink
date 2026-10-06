import { NextResponse } from "next/server";
import { resetDatabaseToZero } from "@/actions/inventory";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await resetDatabaseToZero();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await resetDatabaseToZero();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
