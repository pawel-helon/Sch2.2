import { Request, Response } from "express";
import { pool } from "../../../index";
import { addSlot } from "../../../controllers/slots/addSlot";
import { getTestDates } from "../../../utils/getTestDates";

jest.mock("../../../index", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("addSlot", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;
  const { pastDate, futureStartDate: futureDate } = getTestDates();

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

  test("Returns error if required fields are missing.", async () => {
    mockRequest.body = { day: futureDate };
    setupResponseFormat();

    await addSlot(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "All fields are required: employeeId, day.",
      data: null,
    });
  });

  test("Returns error if employeeId is in invalid UUID.", async () => {
    mockRequest.body = { employeeId: "invalid-uuid", day: futureDate };
    setupResponseFormat();

    await addSlot(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid employeeId format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error if date is in in invalid format.", async () => {
    mockRequest.body = { employeeId: "123e4567-e89b-12d3-a456-426614174000", day: "invalid-date" };
    setupResponseFormat();

    await addSlot(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid day format. Expected YYYY-MM-DD.",
      data: null,
    });
  });

  test("Returns error if date is in the past.", async () => {
    mockRequest.body = { employeeId: "123e4567-e89b-12d3-a456-426614174000", day: pastDate };
    setupResponseFormat();

    await addSlot(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid date. Expected non-past date.",
      data: null,
    });
  });

  test("Returns error on failed database mutation.", async () => {
    mockRequest.body = { employeeId: "123e4567-e89b-12d3-a456-426614174000", day: futureDate };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
    setupResponseFormat();

    await addSlot(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Failed to add slot.",
      data: null,
    });
  });

  test("Returns slot on successful database mutation.", async () => {
    mockRequest.body = { employeeId: "123e4567-e89b-12d3-a456-426614174000", day: futureDate };
    const expectedData = {
      id: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      type: "AVAILABLE" as "AVAILABLE",
      startTime: new Date(futureDate),
      duration: "00:30:00",
      recurring: false,
      createdAt: new Date(futureDate),
      updatedAt: new Date(futureDate),
    };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [expectedData] });
    setupResponseFormat();

    await addSlot(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "New slot has been added.",
      data: expectedData,
    });
  });

  test("Returns 500 on database error.", async () => {
    mockRequest.body = {
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      day: futureDate,
    };
    (pool.query as jest.Mock).mockRejectedValue(new Error("DB error"));

    await addSlot(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error." });
  });
});
