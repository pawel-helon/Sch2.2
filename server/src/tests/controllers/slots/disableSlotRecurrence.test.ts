import { Request, Response } from "express";
import { pool } from "../../../index";
import { disableSlotRecurrence } from "../../../controllers/slots/disableSlotRecurrence";
import { getTestDates } from "../../../lib/helpers";

jest.mock("../../../index", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("disableSlotRecurrence", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;
  const { futureStartDate: futureDate } = getTestDates();

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
    mockRequest.body = { employeeId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a"};
    setupResponseFormat();

    await disableSlotRecurrence(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "All fields are required: employeeId, slotId.",
      data: null,
    });
  });

  test("Returns error if employeeId is in invalid format.", async () => {
    mockRequest.body = { employeeId: "invalid-uuid", slotId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a"};
    setupResponseFormat();

    await disableSlotRecurrence(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid employeeId format. Expected UUID.",
      data: null,
    });
  });
  
  test("Returns error if slotId is in invalid format.", async () => {
    mockRequest.body = { employeeId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a", slotId: "invalid-uuid"};
    setupResponseFormat();

    await disableSlotRecurrence(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid slotId format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error on failed database mutation.", async () => {
    mockRequest.body = { employeeId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a", slotId: "123e4567-e89b-12d3-a456-426614174000" };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
    setupResponseFormat();

    await disableSlotRecurrence(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Failed to disable recurring slots.",
      data: null,
    });
  }); 

  test("Returns slots on successful database mutation.", async () => {
    mockRequest.body = { employeeId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a", slotId: "123e4567-e89b-12d3-a456-426614174000" };
    const expectedData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      employeeId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      type: "AVAILABLE" as "AVAILABLE",
      startTime: new Date(futureDate),
      duration: "00:30:00",
      recurring: false,
      createdAt: new Date(futureDate),
      updatedAt: new Date(futureDate),
    };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [expectedData] });
    setupResponseFormat();

    await disableSlotRecurrence(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Recurring slots have been disabled.",
      data: expectedData,
    });
  });

  test("Returns 500 on database error.", async () => {
    mockRequest.body = { employeeId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a", slotId: "123e4567-e89b-12d3-a456-426614174000" };
    (pool.query as jest.Mock).mockRejectedValue(new Error("DB error"));

    await disableSlotRecurrence(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error." });
  });
});