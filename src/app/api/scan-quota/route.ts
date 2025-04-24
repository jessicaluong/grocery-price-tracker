import { verifySession } from "@/lib/auth";
import { getScanUsage } from "@/lib/scan-rate-limit";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await verifySession({ redirect: false });
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const scanUsage = await getScanUsage(session.userId);
    return NextResponse.json(scanUsage);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve scan usage" },
      { status: 500 }
    );
  }
}
