import { Request, Response } from "express";
import { pool } from "../../../index";
import { getTestDates } from "../../../utils/getTestDates";
import { NormalizedSlots } from "../../../types";
import { duplicateDay } from "../../../controllers/slots/duplicateDay";

jest.mock("../../../index", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("addSlots", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;
  const { futureStartDate: firstFutureDate, futureEndDate: secondFutureDate } = getTestDates();

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

  test("Returns error if there are missing fields.", async () => {
    mockRequest.body = {
      day: firstFutureDate,
      selectedDays: [
        secondFutureDate
      ]
    };
    setupResponseFormat();

    await duplicateDay(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "All fields are required: employeeId, day, selectedDays.",
      data: null,
    });
  });

  test("Returns error if employeeId is in invalid format.", async () => {
    mockRequest.body = {
      employeeId: "invalid-uuid",
      day: firstFutureDate,
      selectedDays: [
        secondFutureDate
      ]
    };
    setupResponseFormat();

    await duplicateDay(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid employeeId format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error if day is in invalid format.", async () => {
    mockRequest.body = {
      employeeId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      day: "invalid-day",
      selectedDays: [
        secondFutureDate
      ]
    };
    setupResponseFormat();

    await duplicateDay(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid day format. Expected YYYY-MM-DD.",
      data: null,
    });
  });

  test("Returns error if selectedDays is not a non-empty array.", async () => {
    mockRequest.body = {
      employeeId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      day: firstFutureDate,
      selectedDays: [],
    };
    setupResponseFormat();

    await duplicateDay(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "selectedDays must be a non-empty array.",
      data: null,
    });
  });

  test("Returns error if any day in selectedDays is in invalid format.", async () => {
    mockRequest.body = {
      employeeId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      day: firstFutureDate,
      selectedDays: [
        "invalid-date",
        firstFutureDate
      ],
    };
    setupResponseFormat();

    await duplicateDay(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid day format in selectedDays array. Expected YYYY-MM-DD.",
      data: null,
    });
  });

  test("Returns error on failed database mutation.", async () => {
    mockRequest.body = {
      employeeId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      day: firstFutureDate,
      selectedDays: [
        secondFutureDate
      ],
    };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
    setupResponseFormat();

    await duplicateDay(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Failed to duplicate day.",
      data: null,
    });
  });

  test("Returns normalized slots on successful database mutation.", async () => {
    mockRequest.body = {
      employeeId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      day: firstFutureDate,
      selectedDays: [
        secondFutureDate
      ],
    };
    const expectedData = [
      {
        id: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
        employeeId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
        type: "AVAILABLE" as "AVAILABLE",
        startTime: new Date(secondFutureDate),
        duration: "00:30:00",
        recurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    (pool.query as jest.Mock).mockResolvedValue({ rows: expectedData });

    const normalizedData: NormalizedSlots = {
      byId: {
        ["6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a"]: expectedData[0]
      },
      allIds: ["6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a"],
    };
    
    setupResponseFormat();

    await duplicateDay(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Day has been duplicated.",
      data: normalizedData,
    });
  });

  test("Returns 500 on database error.", async () => {
    mockRequest.body = {
      employeeId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      day: firstFutureDate,
      selectedDays: [
        secondFutureDate
      ],
    };
    (pool.query as jest.Mock).mockRejectedValue(new Error("DB error"));

    await duplicateDay(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error." });
  });
});