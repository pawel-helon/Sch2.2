import { Request, Response } from "express";
import { pool } from "../../../index";
import { updateRecurringSlotMinutes } from "../../../controllers/slots/updateRecurringSlotMinutes";
import { getTestDates } from "../../../utils/getTestDates";

jest.mock("../../../index", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("updateRecurringSlotMinutes", () => {
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
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      slotId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
    }
    setupResponseFormat();

    await updateRecurringSlotMinutes(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "All fields are required: employeeId, slotId and minutes.",
      data: null,
    });
  });

  test("Returns error if employeeId is in invalid format.", async () => {
    mockRequest.body = {
      employeeId: "invalid-uuid",
      slotId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
      minutes: 30
    };
    setupResponseFormat();

    await updateRecurringSlotMinutes(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid employeeId format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error if slotId is in invalid format.", async () => {
    mockRequest.body = {
      employeeId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
      slotId: "invalid-uuid",
      minutes: 30
    };
    setupResponseFormat();

    await updateRecurringSlotMinutes(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid slotId format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error if hour is not a number between 0 and 23.", async () => {
    mockRequest.body = {
      employeeId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
      slotId: "123e4567-e89b-12d3-a456-426614174000",
      minutes: "invalid-minutes"
    };
    setupResponseFormat();

    await updateRecurringSlotMinutes(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid minnutes. Expected number between 0 and 59.",
      data: null,
    });
  });

  test("Returns error on failed database mutation.", async () => {
    mockRequest.body = {
      employeeId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
      slotId: "123e4567-e89b-12d3-a456-426614174000",
      minutes: 30
    };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
    setupResponseFormat();

    await updateRecurringSlotMinutes(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Failed to update slot.",
      data: null,
    });
  });

  test("Returns updated slot on successful database mutation.", async () => {
    mockRequest.body = {
      employeeId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
      slotId: "123e4567-e89b-12d3-a456-426614174000",
      minutes: 30
    };
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

    await updateRecurringSlotMinutes(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Slot time has been updated.",
      data: expectedData,
    });
  });

  test("Returns 500 on database error.", async () => {
    mockRequest.body = {
      employeeId: "b4f8e3c7-1a9d-4e5b-8f2c-6d9a7e3b5c1f",
      slotId: "123e4567-e89b-12d3-a456-426614174000",
      minutes: 30
    };
    (pool.query as jest.Mock).mockRejectedValue(new Error("DB error"));

    await updateRecurringSlotMinutes(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error." });
  });
});