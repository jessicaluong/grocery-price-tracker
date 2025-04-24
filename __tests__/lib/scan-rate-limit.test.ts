import { checkAndUpdateScanUsage, getScanUsage } from "@/lib/scan-rate-limit";
import { prismaMock } from "../../test/prisma-mock";
import { DAILY_SCAN_LIMIT, MONTHLY_SCAN_LIMIT } from "@/lib/constants";

const mockTxClient = {
  scanUsage: {
    findUnique: jest.fn(),
    aggregate: jest.fn(),
    upsert: jest.fn(),
  },
};

describe("scan-rate-limit", () => {
  const userId = "test-user-id";
  const today = new Date();

  beforeEach(() => {
    prismaMock.$transaction.mockImplementation((callback: any) =>
      callback(mockTxClient)
    );
  });

  describe("checkAndUpdateScanUsage", () => {
    it("should allow scan and increment count when daily and monthly limits not reached", async () => {
      // Mock user has 2 scans today, 10 this month
      (mockTxClient.scanUsage.findUnique as jest.Mock).mockResolvedValue({
        count: 2,
      });
      (mockTxClient.scanUsage.aggregate as jest.Mock).mockResolvedValue({
        _sum: { count: 10 },
      });

      const result = await checkAndUpdateScanUsage(userId);

      expect(mockTxClient.scanUsage.findUnique).toHaveBeenCalledWith({
        where: { userId_date: { userId, date: expect.any(Date) } },
      });

      expect(mockTxClient.scanUsage.aggregate).toHaveBeenCalledWith({
        _sum: { count: true },
        where: { date: { gte: expect.any(Date) } },
      });

      expect(mockTxClient.scanUsage.upsert).toHaveBeenCalledWith({
        where: { userId_date: { userId, date: expect.any(Date) } },
        update: { count: { increment: 1 } },
        create: { userId, date: expect.any(Date), count: 1 },
      });

      expect(result).toEqual({ success: true });
    });

    it("should reject scan when daily limit reached", async () => {
      // Mock user has reached daily limit
      (mockTxClient.scanUsage.findUnique as jest.Mock).mockResolvedValue({
        count: DAILY_SCAN_LIMIT,
      });

      const result = await checkAndUpdateScanUsage(userId);

      expect(mockTxClient.scanUsage.findUnique).toHaveBeenCalled();
      expect(mockTxClient.scanUsage.aggregate).not.toHaveBeenCalled();
      expect(mockTxClient.scanUsage.upsert).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: false,
        message: "Daily scan limit reached",
      });
    });

    it("should reject scan when monthly limit reached", async () => {
      // Mock user hasn't reached daily limit but reached monthly limit
      (mockTxClient.scanUsage.findUnique as jest.Mock).mockResolvedValue({
        count: 2,
      });
      (mockTxClient.scanUsage.aggregate as jest.Mock).mockResolvedValue({
        _sum: { count: MONTHLY_SCAN_LIMIT },
      });

      const result = await checkAndUpdateScanUsage(userId);

      expect(mockTxClient.scanUsage.findUnique).toHaveBeenCalled();
      expect(mockTxClient.scanUsage.aggregate).toHaveBeenCalled();
      expect(mockTxClient.scanUsage.upsert).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: false,
        message: "Monthly scan limit reached",
      });
    });

    it("should create new record if user has no scans today", async () => {
      // Mock user has no scans today
      (mockTxClient.scanUsage.findUnique as jest.Mock).mockResolvedValue(null);
      (mockTxClient.scanUsage.aggregate as jest.Mock).mockResolvedValue({
        _sum: { count: 10 },
      });

      const result = await checkAndUpdateScanUsage(userId);

      expect(mockTxClient.scanUsage.upsert).toHaveBeenCalledWith({
        where: { userId_date: { userId, date: expect.any(Date) } },
        update: { count: { increment: 1 } },
        create: { userId, date: expect.any(Date), count: 1 },
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("getScanUsage", () => {
    it("should return remaining scan limits", async () => {
      // Mock user has 2 scans today, 10 this month
      (prismaMock.scanUsage.findUnique as jest.Mock).mockResolvedValue({
        count: 2,
      });
      (prismaMock.scanUsage.aggregate as jest.Mock).mockResolvedValue({
        _sum: { count: 10 },
      });

      const result = await getScanUsage(userId);

      expect(prismaMock.scanUsage.findUnique).toHaveBeenCalledWith({
        where: { userId_date: { userId, date: expect.any(Date) } },
      });

      expect(prismaMock.scanUsage.aggregate).toHaveBeenCalledWith({
        _sum: { count: true },
        where: { date: { gte: expect.any(Date) } },
      });

      expect(result).toEqual({
        dailyRemaining: DAILY_SCAN_LIMIT - 2,
        monthlyRemaining: MONTHLY_SCAN_LIMIT - 10,
      });
    });

    it("should handle user with no usage", async () => {
      // Mock user has no usage
      (prismaMock.scanUsage.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaMock.scanUsage.aggregate as jest.Mock).mockResolvedValue({
        _sum: { count: null },
      });

      const result = await getScanUsage(userId);

      expect(result).toEqual({
        dailyRemaining: DAILY_SCAN_LIMIT,
        monthlyRemaining: MONTHLY_SCAN_LIMIT,
      });
    });

    it("should cap remaining at zero if limits exceeded", async () => {
      // Mock user has exceeded limits
      (prismaMock.scanUsage.findUnique as jest.Mock).mockResolvedValue({
        count: DAILY_SCAN_LIMIT + 2,
      });
      (prismaMock.scanUsage.aggregate as jest.Mock).mockResolvedValue({
        _sum: { count: MONTHLY_SCAN_LIMIT + 5 },
      });

      const result = await getScanUsage(userId);

      expect(result).toEqual({
        dailyRemaining: 0,
        monthlyRemaining: 0,
      });
    });
  });
});
