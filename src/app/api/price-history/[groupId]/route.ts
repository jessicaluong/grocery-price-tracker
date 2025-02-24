import { getPriceHistoryByGroupId } from "@/data-access/item-repository";
import { NextResponse } from "next/server";

// TODO: add cache (Next.js side or Prisma side?)
export async function GET(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const history = await getPriceHistoryByGroupId(params.groupId);
    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching price history:", error);
    return NextResponse.json(
      { error: "Failed to fetch price history" },
      { status: 500 }
    );
  }
}
