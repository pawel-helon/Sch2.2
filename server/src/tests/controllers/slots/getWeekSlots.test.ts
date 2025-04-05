import { Request, Response } from "express";
import { pool } from "../../../index";
import { getWeekSlots } from "../../../controllers/slots/getWeekSlots";
import { SlotsAccumulator } from "../../../lib/types";

// Mock the pool.query method
jest.mock("../../../index", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("getWeekSlots", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockRequest = { body: {} };
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    mockResponse = { format: jest.fn(), status, send: jest.fn() };
    (pool.query as jest.Mock).mockClear();
  });

  // Helper to simulate response formatting
  const setupResponseFormat = () => {
    (mockResponse.format as jest.Mock).mockImplementation((formatObj) => {
      formatObj["application/json"]();
    });
  };

  test("returns error if required fields are missing", async () => {
    mockRequest.body = { employeeId: "550e8400-e29b-41d4-a716-446655440000", start: "2025-04-06" }; // Missing "end"
    setupResponseFormat();

    await getWeekSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Start and end dates are required",
      data: null,
    });
  });

  test("returns error if employeeId is not a valid UUID", async () => {
    mockRequest.body = {
      employeeId: "invalid-uuid",
      start: "2025-04-06",
      end: "2025-04-12",
    };
    setupResponseFormat();

    await getWeekSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid UUID format",
      data: null,
    });
  });

  test("returns error if dates are in invalid format", async () => {
    mockRequest.body = {
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      start: "invalid-date",
      end: "2025-04-12",
    };
    setupResponseFormat();

    await getWeekSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid date format",
      data: null,
    });
  });

  test("returns error if dates are in the past", async () => {
    mockRequest.body = {
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      start: "2024-03-01",
      end: "2024-03-07",
    };
    setupResponseFormat();

    await getWeekSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid start and/or end dates",
      data: null,
    });
  });

  test("returns normalized slots on successful fetch", async () => {
    mockRequest.body = {
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      start: "2025-04-06",
      end: "2025-04-12",
    };
    const mockRows = [
      { id: "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f", employeeId: "c4c52f7b-7fdb-4ada-bf4e-7c4fa386052e", type: "AVAILABLE" as "AVAILABLE", startTime: new Date("2025-04-06"), duration: "00:30:00", recurring: false, createdAt: new Date("2025-04-06"), updatedAt: new Date("2025-04-06") },
      { id: "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c", employeeId: "c4c52f7b-7fdb-4ada-bf4e-7c4fa386052e", type: "AVAILABLE" as "AVAILABLE", startTime: new Date("2025-04-12"), duration: "00:30:00", recurring: false, createdAt: new Date("2025-04-12"), updatedAt: new Date("2025-04-12") },
    ];
    (pool.query as jest.Mock).mockResolvedValue({ rows: mockRows });
    setupResponseFormat();

    await getWeekSlots(mockRequest as Request, mockResponse as Response);

    const expectedData: SlotsAccumulator = {
      byId: {
        ["c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f"]: mockRows[0],
        ["9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c"]: mockRows[1],
      },
      allIds: ["c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f", "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c"],
    };
    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      [mockRequest.body.employeeId, mockRequest.body.start, mockRequest.body.end]
    );
    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Slots have been fetched",
      data: expectedData,
    });
  });

  test("returns failure message if no slots are found", async () => {
    mockRequest.body = {
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      start: "2025-04-06",
      end: "2025-04-12",
    };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
    setupResponseFormat();

    await getWeekSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Failed to fetch slots",
      data: null,
    });
  });

  test("returns 500 on database error", async () => {
    mockRequest.body = {
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      start: "2025-04-06",
      end: "2025-04-12",
    };
    (pool.query as jest.Mock).mockRejectedValue(new Error("DB error"));

    await getWeekSlots(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});