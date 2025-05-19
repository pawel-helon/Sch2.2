import { Request, Response } from "express";
import { pool } from "../../../index";
import { getTestDates } from "../../../utils/getTestDates";
import { deleteSession } from "../../../controllers/sessions/deleteSession";

jest.mock("../../../index", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("deleteSession", () => {
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

  test("Returns error if id is missing.", async () => {
    mockRequest.body = {};
    setupResponseFormat();

    await deleteSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Id is required.",
      data: null,
    });
  });

  test("Returns error if id is in invalid format", async () => {
    mockRequest.body = {
      id: "invalid-uuid"
    };
    setupResponseFormat();

    await deleteSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid id format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error on failed database mutation.", async () => {
    mockRequest.body = { id: "123e4567-e89b-12d3-a456-426614174000" };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
    setupResponseFormat();

    await deleteSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Failed to delete session.",
      data: null,
    });
  });

  test("Returns slotId on successful database mutation.", async () => {
    mockRequest.body = { id: "123e4567-e89b-12d3-a456-426614174000" };
    const expectedData = {
      id: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f"
    };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [expectedData] });
    setupResponseFormat();

    await deleteSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Session has been deleted.",
      data: expectedData.id,
    });
  });

  test("Returns 500 on database error.", async () => {
    mockRequest.body = { id: "123e4567-e89b-12d3-a456-426614174000" };
    (pool.query as jest.Mock).mockRejectedValue(new Error("DB error"));

    await deleteSession(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error." });
  });
});