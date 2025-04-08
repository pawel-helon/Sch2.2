import { Request, Response } from "express";
import { pool } from "../../../index";
import { getWeekSlots } from "../../../controllers/slots/getWeekSlots";
import { SlotsAccumulator } from "../../../lib/types";
import { getTestDates } from "../../../lib/helpers";

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
  const { pastDate, futureStartDate, futureEndDate } = getTestDates();
  
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

  test("Returns error if required fields are missing.", async () => {
    mockRequest.body = { employeeId: "550e8400-e29b-41d4-a716-446655440000", start: "2025-04-06" }; // Missing "end"
    setupResponseFormat();

    await getWeekSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "All fields are required: employeeId, start, and end dates.",
      data: null,
    });
  });

  test("Returns error if employeeId is an invalid UUID.", async () => {
    mockRequest.body = {
      employeeId: "invalid-uuid",
      start: futureStartDate,
      end: futureEndDate,
    };
    setupResponseFormat();

    await getWeekSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid employeeId format in slots. Expected UUID.",
      data: null,
    });
  });

  test("Returns error if dates are in invalid format.", async () => {
    mockRequest.body = {
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      start: "invalid-date",
      end: futureEndDate,
    };
    setupResponseFormat();

    await getWeekSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid date format in start and end dates. Expected YYYY-MM-DD.",
      data: null,
    });
  });

  test("Returns error if end date is in the past.", async () => {
    mockRequest.body = {
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      start: futureStartDate,
      end: pastDate,
    };
    setupResponseFormat();

    await getWeekSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid end date. Expected non-past date.",
      data: null,
    });
  });

  test("Returns error if date range is not exactly 6 days.", async () => {
    mockRequest.body = {
      employeeId: "c4c52f7b-7fdb-4ada-bf4e-7c4fa386052e",
      start: futureStartDate,
      end: futureStartDate,
    };
    setupResponseFormat();

    await getWeekSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid start and end dates. Expected dates 6 days apart.",
      data: null,
    });
  });
  
  test("Returns error on failed database query.", async () => {
    mockRequest.body = {
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      start: futureStartDate,
      end: futureEndDate,
    };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
    setupResponseFormat();

    await getWeekSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Failed to fetch slots.",
      data: null,
    });
  });

  test("Returns normalized slots on successful database query.", async () => {
    mockRequest.body = {
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      start: futureStartDate,
      end: futureEndDate,
    };
    const mockRows = [
      { id: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f", employeeId: "c4c52f7b-7fdb-4ada-bf4e-7c4fa386052e", type: "AVAILABLE" as "AVAILABLE", startTime: new Date(futureStartDate), duration: "00:30:00", recurring: false, createdAt: new Date(futureStartDate), updatedAt: new Date(futureStartDate) },
      { id: "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c", employeeId: "c4c52f7b-7fdb-4ada-bf4e-7c4fa386052e", type: "AVAILABLE" as "AVAILABLE", startTime: new Date(futureEndDate), duration: "00:30:00", recurring: false, createdAt: new Date(futureEndDate), updatedAt: new Date(futureEndDate) },
    ];
    (pool.query as jest.Mock).mockResolvedValue({ rows: mockRows });
    setupResponseFormat();

    await getWeekSlots(mockRequest as Request, mockResponse as Response);

    const expectedData: SlotsAccumulator = {
      byId: {
        ["b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f"]: mockRows[0],
        ["9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c"]: mockRows[1],
      },
      allIds: ["b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f", "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c"],
    };
    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      [mockRequest.body.employeeId, mockRequest.body.start, mockRequest.body.end]
    );
    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Slots have been fetched.",
      data: expectedData,
    });
  });

  test("Returns 500 on database error.", async () => {
    mockRequest.body = {
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      start: futureStartDate,
      end: futureEndDate,
    };
    (pool.query as jest.Mock).mockRejectedValue(new Error("DB error"));

    await getWeekSlots(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error." });
  });
});