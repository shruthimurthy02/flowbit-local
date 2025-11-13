import { PrismaClient } from "@prisma/client";
import statsRouter from "../stats";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      invoice: {
        count: jest.fn(),
        aggregate: jest.fn(),
      },
    })),
  };
});

describe("Stats Router", () => {
  let mockPrisma: jest.Mocked<PrismaClient>;
  let router: ReturnType<typeof statsRouter>;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    router = statsRouter(mockPrisma);
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it("should return stats successfully", async () => {
    (mockPrisma.invoice.count as jest.Mock).mockResolvedValue(10);
    (mockPrisma.invoice.aggregate as jest.Mock).mockResolvedValue({
      _sum: { amount: 50000 },
      _avg: { amount: 5000 },
    });

    const handler = router.stack.find((layer: any) => layer.route?.path === "/")?.route
      ?.stack[0]?.handle;

    if (handler) {
      await handler(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalInvoicesProcessed: 10,
          totalSpend: 50000,
          averageInvoiceValue: 5000,
        })
      );
    }
  });
});
