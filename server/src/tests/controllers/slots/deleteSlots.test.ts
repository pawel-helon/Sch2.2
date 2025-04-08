import { Request, Response } from "express";
import { pool } from "../../../index";
import { deleteSlots } from "../../../controllers/slots/deleteSlots";

jest.mock("../../../index", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("deleteSlots", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

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

  test("Returns error if employeeId or slotIds are missing.", async () => {
    mockRequest.body = { employeeId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f" };
    setupResponseFormat();

    await deleteSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "All fields are required: employeeId, slotIds.",
      data: null,
    });
  });

  test("Returns error if employeeId is in invalid format.", async () => {
    mockRequest.body = {
      employeeId: "invalid-uuid",
      slotIds: [
        "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
        "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      ]
    };
    setupResponseFormat();

    await deleteSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid employeeId format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error if slotIds is not a non-empty array.", async () => {
    mockRequest.body = {
      employeeId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      slotIds: []
    };
    setupResponseFormat();

    await deleteSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Slot ids must be a non-empty array.",
      data: null,
    });
  });

  test("Returns error if slotId is in invalid format.", async () => {
    mockRequest.body = {
      employeeId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      slotIds: [
        "invalid-uuid",
        "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      ]
    };
    setupResponseFormat();

    await deleteSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid slotId format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error on failed database mutation.", async () => {
    mockRequest.body = {
      employeeId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      slotIds: [
        "123e4567-e89b-12d3-a456-426614174000",
        "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      ]
    };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
    setupResponseFormat();

    await deleteSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Failed to delete slots.",
      data: null,
    });
  });

  test("Returns an array of deleted slot ids on successful database mutation.", async () => {
    mockRequest.body = {
      employeeId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      slotIds: [
        "123e4567-e89b-12d3-a456-426614174000",
        "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      ]
    };
    const expectedData = [
      "123e4567-e89b-12d3-a456-426614174000",
      "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f"
    ];

    (pool.query as jest.Mock).mockResolvedValue({ rows: expectedData })
    setupResponseFormat();

    await deleteSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Slots have been deleted.",
      data: expectedData,
    });
  });

  test("Returns 500 on database error.", async () => {
    mockRequest.body = {
      employeeId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      slotIds: [
        "123e4567-e89b-12d3-a456-426614174000",
        "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      ]
    };
    (pool.query as jest.Mock).mockRejectedValue(new Error("DB error"));

    await deleteSlots(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error." });
  });
});