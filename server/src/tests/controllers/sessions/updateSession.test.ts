import { Request, Response } from "express";
import { pool } from "../../../index";
import { getTestDates } from "../../../lib/helpers";
import { updateSession } from "../../../controllers/sessions/updateSession";

jest.mock("../../../index", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("updateSession", () => {
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
    mockRequest.body = {
      sessionId: "123e4567-e89b-12d3-a456-426614174000",
    }
    setupResponseFormat();

    await updateSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "All fields are required: sessionId, slotId.",
      data: null,
    });
  });

  test("Returns error if sessionId is in invalid format.", async () => {
    mockRequest.body = {
      sessionId: "invalid-uuid",
      slotId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
    };
    setupResponseFormat();

    await updateSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid sessionId format. Expected UUID.",
      data: null,
    });
  });
  
  test("Returns error if slotId is in invalid format.", async () => {
    mockRequest.body = {
      sessionId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
      slotId: "invalid-uuid",
    };
    setupResponseFormat();

    await updateSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid slotId format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error on failed database mutation.", async () => {
    mockRequest.body = {
      sessionId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
      slotId: "123e4567-e89b-12d3-a456-426614174000",
    };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
    setupResponseFormat();

    await updateSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Failed to update session.",
      data: null,
    });
  });

  test("Returns updated slot on successful database mutation.", async () => {
    mockRequest.body = {
      sessionId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
      slotId: "123e4567-e89b-12d3-a456-426614174000",
    };
    const expectedData = {
      id: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
      slotId: "123e4567-e89b-12d3-a456-426614174000",
      employeeId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
      customerId: "1e6d9a3f-7c2b-4f8e-b5a9-d3c7e1f2a8b6",
      startTime: new Date(futureDate),
      message: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [expectedData] });
    setupResponseFormat();

    await updateSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Session has been updated.",
      data: expectedData,
    });
  });

  test("Returns 500 on database error.", async () => {
    mockRequest.body = {
      sessionId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
      slotId: "123e4567-e89b-12d3-a456-426614174000",
    };
    (pool.query as jest.Mock).mockRejectedValue(new Error("DB error"));

    await updateSession(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error." });
  });
});