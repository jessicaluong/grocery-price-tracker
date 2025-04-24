import { getScanUsage } from "@/lib/scan-rate-limit";
import { verifySession } from "@/lib/auth";
import { GET } from "@/app/api/scan-quota/route";

jest.mock("next/server", () => {
  return {
    NextResponse: {
      json: jest.fn((data, options) => {
        return {
          status: options?.status || 200,
          json: async () => data,
        };
      }),
    },
  };
});

jest.mock("@/lib/auth", () => ({
  verifySession: jest.fn(),
}));

jest.mock("@/lib/scan-rate-limit", () => ({
  getScanUsage: jest.fn(),
}));

describe("Scan Usage API Route", () => {
  it("should return 401 if user is not authenticated", async () => {
    (verifySession as jest.Mock).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: "Authentication required" });
    expect(getScanUsage).not.toHaveBeenCalled();
  });

  it("should return scan usage data for authenticated user", async () => {
    (verifySession as jest.Mock).mockResolvedValue({ userId: "test-user-id" });
    (getScanUsage as jest.Mock).mockResolvedValue({
      dailyRemaining: 3,
      monthlyRemaining: 15,
    });

    const response = await GET();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      dailyRemaining: 3,
      monthlyRemaining: 15,
    });
    expect(getScanUsage).toHaveBeenCalledWith("test-user-id");
  });

  it("should handle errors from getScanUsage", async () => {
    (verifySession as jest.Mock).mockResolvedValue({ userId: "test-user-id" });
    (getScanUsage as jest.Mock).mockRejectedValue(new Error("Database error"));

    const response = await GET();

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: "Failed to retrieve scan usage" });
  });
});
