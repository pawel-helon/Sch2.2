import { Request, Response } from "express";
import { getTestDates } from "../../../lib/helpers";
import { pool } from "../../..";
import { addRecurringSlot } from "../../../controllers/slots/addRecurringSlot";

jest.mock("../../../index", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("addRecurringSlot", () => {
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
    })
  }

  test("returns error if required fields are missing", async () => {
    mockRequest.body = { day: firstFutureDate };
    setupResponseFormat();

    await addRecurringSlot(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "All fields are required: employeeId, day.",
      data: null,
    });
  });

  test("returns error if employeeId is an invalid UUID", async () => {
    mockRequest.body = { employeeId: "invalid-uuid", day: firstFutureDate };
    setupResponseFormat();

    await addRecurringSlot(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid employeeId format. Expected UUID.",
      data: null,
    })
  });

  test("returns error if date is in invalid date format", async () => {
    mockRequest.body = { employeeId: "123e4567-e89b-12d3-a456-426614174000", day: "invalid-date" };
    setupResponseFormat();

    await addRecurringSlot(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid day format. Expected YYYY-MM-DD.",
      data: null,
    });
  });

  test("returns error if date is in the past", async () => {
    mockRequest.body = { employeeId: "123e4567-e89b-12d3-a456-426614174000", day: pastDate };
    setupResponseFormat();

    await addRecurringSlot(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid date. Expected non-past date.",
      data: null,
    });
  });

  test("returns error if slots have not been added", async () => {
    mockRequest.body = { employeeId: "123e4567-e89b-12d3-a456-426614174000", day: firstFutureDate };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
    setupResponseFormat();

    await addRecurringSlot(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Failed to add slots",
      data: null,
    })
  });

  test("returns slots on successful addition", async () => {
    mockRequest.body = { employeeId: "123e4567-e89b-12d3-a456-426614174000", day: firstFutureDate };
    const expectedData = [
      {
        id: "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
        employeeId: "123e4567-e89b-12d3-a456-426614174000",
        type: "AVAILABLE" as "AVAILABLE",
        startTime: new Date(firstFutureDate),
        duration: "00:30:00",
        recurring: false,
        createdAt: new Date(firstFutureDate),
        updatedAt: new Date(firstFutureDate),
      },
      {
        id: "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
        employeeId: "123e4567-e89b-12d3-a456-426614174000",
        type: "AVAILABLE" as "AVAILABLE",
        startTime: new Date(secondFutureDate),
        duration: "00:30:00",
        recurring: false,
        createdAt: new Date(secondFutureDate),
        updatedAt: new Date(secondFutureDate),
      },
    ];
    (pool.query as jest.Mock).mockResolvedValue({ rows: [expectedData] });
    setupResponseFormat();

    await addRecurringSlot(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "New recurring slots have been added",
      data: expectedData
    });
  });
  
  test("returns 500 on database error", async () => {
    mockRequest.body = {
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      day: firstFutureDate,
    };
    (pool.query as jest.Mock).mockRejectedValue(new Error("DB error"));

    await addRecurringSlot(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});