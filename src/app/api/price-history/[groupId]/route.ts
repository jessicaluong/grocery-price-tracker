import { getPriceHistory } from "@/data-access/grocery-data";
import { verifySession } from "@/lib/auth";
import { AuthorizationError } from "@/lib/customErrors";
import { NextResponse } from "next/server";

// TODO: add cache (Next.js side or Prisma side?)
export async function GET(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  const session = await verifySession({ redirect: false });
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { groupId } = params;
    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    const priceHistory = await getPriceHistory(groupId);
    return NextResponse.json(priceHistory);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch price history" },
      { status: 500 }
    );
  }
}
