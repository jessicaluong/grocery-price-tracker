import { getPriceHistory } from "@/data-access/grocery-data";
import { verifySession } from "@/lib/auth";
import { AuthorizationError } from "@/lib/customErrors";
import { GET } from "@/app/api/price-history/[groupId]/route";

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

jest.mock("@/data-access/grocery-data", () => ({
  getPriceHistory: jest.fn(),
}));

jest.mock("@/lib/customErrors", () => ({
  AuthorizationError: class AuthorizationError extends Error {
    constructor() {
      super("Unauthorized access");
      this.name = "AuthorizationError";
    }
  },
}));

describe("Price History API Route", () => {
  const mockRequest = {} as Request;
  const mockParams = { groupId: "test-group-id" };

  it("should return 401 if user is not authenticated", async () => {
    (verifySession as jest.Mock).mockResolvedValue(null);

    const response = await GET(mockRequest, { params: mockParams });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: "Authentication required" });
    expect(getPriceHistory).not.toHaveBeenCalled();
  });

  it("should return 400 if groupId is missing", async () => {
    (verifySession as jest.Mock).mockResolvedValue({ userId: "test-user-id" });

    const response = await GET(mockRequest, { params: { groupId: "" } });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: "Group ID is required" });
    expect(getPriceHistory).not.toHaveBeenCalled();
  });

  it("should return 403 if user is not authorized to access the group", async () => {
    (verifySession as jest.Mock).mockResolvedValue({ userId: "test-user-id" });
    (getPriceHistory as jest.Mock).mockRejectedValue(new AuthorizationError());

    const response = await GET(mockRequest, { params: mockParams });

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data).toEqual({ error: "Unauthorized access" });
    expect(getPriceHistory).toHaveBeenCalledWith("test-group-id");
  });

  it("should return price history data for authorized user", async () => {
    (verifySession as jest.Mock).mockResolvedValue({ userId: "test-user-id" });

    const mockPriceHistory = [
      { id: "item1", date: new Date("2023-01-01"), price: 4.99, isSale: false },
      { id: "item2", date: new Date("2023-01-15"), price: 3.99, isSale: true },
    ];

    (getPriceHistory as jest.Mock).mockResolvedValue(mockPriceHistory);

    const response = await GET(mockRequest, { params: mockParams });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockPriceHistory);
    expect(getPriceHistory).toHaveBeenCalledWith("test-group-id");
  });

  it("should return empty array when no price history data exists", async () => {
    (verifySession as jest.Mock).mockResolvedValue({ userId: "test-user-id" });
    (getPriceHistory as jest.Mock).mockResolvedValue(null);

    const response = await GET(mockRequest, { params: mockParams });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
    expect(getPriceHistory).toHaveBeenCalledWith("test-group-id");
  });

  it("should return 500 for unexpected errors", async () => {
    (verifySession as jest.Mock).mockResolvedValue({ userId: "test-user-id" });
    (getPriceHistory as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const response = await GET(mockRequest, { params: mockParams });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: "Failed to fetch price history" });
    expect(getPriceHistory).toHaveBeenCalledWith("test-group-id");
  });
});
