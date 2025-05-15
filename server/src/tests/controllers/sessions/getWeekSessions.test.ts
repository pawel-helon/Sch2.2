import { Request, Response } from "express";
import { pool } from "../../../index";
import { getTestDates } from "../../../lib/helpers";
import { getWeekSessions } from "../../../controllers/sessions/getWeekSessions";
import { NormalizedSessions } from "../../../lib/types";

jest.mock("../../../index", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("getWeekSessions", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;
  const { pastDate, futureStartDate: firstFutureDate, futureEndDate: secondFutureDate } = getTestDates();

  beforeEach(() => {
    mockRequest = { body: {} };
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    mockResponse = { format: jest.fn(), status, send: jest.fn() };
    (pool.query as jest.Mock).mockClear();
  });

  const setupResponseFormat = () => {
    (mockResponse.format as jest.Mock).mockImplementation((formatObj) => {
      formatObj["application/json"]();
    });
  };

  test("Returns error if any of the fields is missing.", async () => {
    mockRequest.body = {
      employeeId: "550e8400-e29b-41d4-a716-446655440000",
      start: firstFutureDate
    };
    setupResponseFormat();

    await getWeekSessions(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "All fields are required: employeeId, start, and end dates.",
      data: null,
    });
  });

  test("Returns error if employeeId is in invalid format.", async () => {
    mockRequest.body = {
      employeeId: "invalid-uuid",
      start: firstFutureDate,
      end: secondFutureDate
    };
    setupResponseFormat();

    await getWeekSessions(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid employeeId format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error if start date is in invalid format.", async () => {
    mockRequest.body = {
      employeeId: "550e8400-e29b-41d4-a716-446655440000",
      start: "invalid-date",
      end: secondFutureDate
    };
    setupResponseFormat();

    await getWeekSessions(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid date format in start date. Expected YYYY-MM-DD.",
      data: null,
    });
  });

  test("Returns error if end date is in invalid format.", async () => {
    mockRequest.body = {
      employeeId: "550e8400-e29b-41d4-a716-446655440000",
      start: firstFutureDate,
      end: "invalid-date"
    };
    setupResponseFormat();

    await getWeekSessions(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid date format in end date. Expected YYYY-MM-DD.",
      data: null,
    });
  });

  test("Returns error on failed database query.", async () => {
      mockRequest.body = {
        employeeId: "123e4567-e89b-12d3-a456-426614174000",
        start: firstFutureDate,
        end: secondFutureDate,
      };
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
      setupResponseFormat();
  
      await getWeekSessions(mockRequest as Request, mockResponse as Response);
  
      expect(mockResponse.send).toHaveBeenCalledWith({
        message: "Failed to fetch sessions.",
        data: null,
      });
  });

  test("Returns normalized sessions on successful database query.", async () => {
    mockRequest.body = {
      employeeId: "f9c3e7b2-8d5a-4f1e-9a6d-2c7f3b8e5d1a",
      start: firstFutureDate,
      end: secondFutureDate,
    };
    const expectedData = [
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        slotId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
        employeeId: "f9c3e7b2-8d5a-4f1e-9a6d-2c7f3b8e5d1a",
        customerId: "1e6d9a3f-7c2b-4f8e-b5a9-d3c7e1f2a8b6",
        startTime: new Date(firstFutureDate),
        message: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];
    (pool.query as jest.Mock).mockResolvedValue({ rows: expectedData });
    setupResponseFormat();

    await getWeekSessions(mockRequest as Request, mockResponse as Response);

    const normalizedData: NormalizedSessions = {
      byId: {
        ["123e4567-e89b-12d3-a456-426614174000"]: expectedData[0],
      },
      allIds: ["123e4567-e89b-12d3-a456-426614174000"],
    };
    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      [mockRequest.body.employeeId, mockRequest.body.start, mockRequest.body.end]
    );
    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Sessions have been fetched.",
      data: normalizedData,
    });
  });

  test("Returns 500 on database error.", async () => {
    mockRequest.body = {
      employeeId: "f9c3e7b2-8d5a-4f1e-9a6d-2c7f3b8e5d1a",
      start: firstFutureDate,
      end: secondFutureDate,
    };
    (pool.query as jest.Mock).mockRejectedValue(new Error("DB error"));

    await getWeekSessions(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error." });
  });
});