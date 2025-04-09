import { Request, Response } from "express";
import { pool } from "../../../index";
import { getTestDates } from "../../../lib/helpers";
import { setSlotRecurrence } from "../../../controllers/slots/setSlotRecurrence";

jest.mock("../../../index", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("setSlotRecurrence", () => {
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

  test("Returns error if any field is missing.", async () => {
    mockRequest.body = { employeeId: "123e4567-e89b-12d3-a456-426614174000" };
    setupResponseFormat();

    await setSlotRecurrence(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "All fields are required: employeeId, slotId.",
      data: null,
    });
  });

  test("Returns error if employeeId is in invalid format.", async () => {
    mockRequest.body = { employeeId: "invalid-uuid", slotId: "123e4567-e89b-12d3-a456-426614174000" };
    setupResponseFormat();

    await setSlotRecurrence(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid employeeId format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error if slotId is in invalid format.", async () => {
    mockRequest.body = { employeeId: "123e4567-e89b-12d3-a456-426614174000", slotId: "invalid-uuid" };
    setupResponseFormat();

    await setSlotRecurrence(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid slotId format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error on failed database mutation.", async () => {
    mockRequest.body = { employeeId: "123e4567-e89b-12d3-a456-426614174000", slotId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f" };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
    setupResponseFormat();

    await setSlotRecurrence(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Failed to set recurring slot.",
      data: null,
    });
  });

  test("Returns updated inital slot on successful database mutation.", async () => {
    mockRequest.body = { employeeId: "123e4567-e89b-12d3-a456-426614174000", slotId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f" };
    const slot = [
      {
        id: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
        employeeId: "123e4567-e89b-12d3-a456-426614174000",
        type: "AVAILABLE" as "AVAILABLE",
        startTime: new Date(futureDate),
        duration: "00:30:00",
        recurring: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    (pool.query as jest.Mock).mockResolvedValue({ rows: slot });
    setupResponseFormat();

    await setSlotRecurrence(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Recurring slot has been set.",
      data: slot[0],
    });
  });

  test("Returns 500 on database error.", async () => {
    mockRequest.body = { employeeId: "123e4567-e89b-12d3-a456-426614174000", slotId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f" };
    (pool.query as jest.Mock).mockRejectedValue(new Error("DB error"));

    await setSlotRecurrence(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error." });
  });
})