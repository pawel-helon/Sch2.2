import { Request, Response } from "express";
import { pool } from "../../../index";
import { undoDeleteSession } from "../../../controllers/sessions/undoDeleteSession";
import { getTestDates } from "../../../utils/getTestDates";

jest.mock("../../../index", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("undoDeleteSession", () => {
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

  test("Returns error if session is not a non-empty object.", async () => {
    mockRequest.body = {};
    setupResponseFormat();

    await undoDeleteSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid input data: session must be a non-empty object.",
      data: null,
    });
  });

  test("Returns error if id is in invalid format.", async () => {
    mockRequest.body = { session : {
      id: "invalid-uuid",
      slotId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      employeeId: "f9c3e7b2-8d5a-4f1e-9a6d-2c7f3b8e5d1a",
      customerId: "1e6d9a3f-7c2b-4f8e-b5a9-d3c7e1f2a8b6",
      startTime: new Date(futureDate),
      message: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }};
    setupResponseFormat();

    await undoDeleteSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid id format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error if slotId is in invalid format.", async () => {
    mockRequest.body = { session: {
      id: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      slotId: "invalid-uuid",
      employeeId: "f9c3e7b2-8d5a-4f1e-9a6d-2c7f3b8e5d1a",
      customerId: "1e6d9a3f-7c2b-4f8e-b5a9-d3c7e1f2a8b6",
      startTime: new Date(futureDate),
      message: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }};
    setupResponseFormat();

    await undoDeleteSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid slotId format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error if employeeId is in invalid format.", async () => {
    mockRequest.body = { session: {
      id: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      slotId: "f9c3e7b2-8d5a-4f1e-9a6d-2c7f3b8e5d1a",
      employeeId: "invalid-uuid",
      customerId: "1e6d9a3f-7c2b-4f8e-b5a9-d3c7e1f2a8b6",
      startTime: new Date(futureDate),
      message: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }};
    setupResponseFormat();

    await undoDeleteSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid employeeId format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error if customerId is in invalid format.", async () => {
    mockRequest.body = { session: {
      id: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      slotId: "f9c3e7b2-8d5a-4f1e-9a6d-2c7f3b8e5d1a",
      employeeId: "1e6d9a3f-7c2b-4f8e-b5a9-d3c7e1f2a8b6",
      customerId: "invalid-uuid",
      startTime: new Date(futureDate),
      message: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }};
    setupResponseFormat();

    await undoDeleteSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid customerId format. Expected UUID.",
      data: null,
    });
  });

  test("Returns error if startTime is in invalid format.", async () => {
    mockRequest.body = { session: {
      id: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      slotId: "f9c3e7b2-8d5a-4f1e-9a6d-2c7f3b8e5d1a",
      employeeId: "1e6d9a3f-7c2b-4f8e-b5a9-d3c7e1f2a8b6",
      customerId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      startTime: "invalid-date",
      message: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }};
    setupResponseFormat();

    await undoDeleteSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid startTime format. Expected Date object.",
      data: null,
    });
  });

  test("Returns error if startTime has past value.", async () => {
    mockRequest.body = { session: {
      id: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      slotId: "f9c3e7b2-8d5a-4f1e-9a6d-2c7f3b8e5d1a",
      employeeId: "1e6d9a3f-7c2b-4f8e-b5a9-d3c7e1f2a8b6",
      customerId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      startTime: new Date(pastDate),
      message: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }};
    setupResponseFormat();

    await undoDeleteSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid startTime. Expected non-past value.",
      data: null,
    });
  });
  
  test("Returns error if createdAt is in invalid format.", async () => {
    mockRequest.body = { session: {
      id: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      slotId: "f9c3e7b2-8d5a-4f1e-9a6d-2c7f3b8e5d1a",
      employeeId: "1e6d9a3f-7c2b-4f8e-b5a9-d3c7e1f2a8b6",
      customerId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      startTime: new Date(futureDate),
      message: null,
      createdAt: "invalid-date",
      updatedAt: new Date()
    }};
    setupResponseFormat();

    await undoDeleteSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid createdAt format. Expected Date object.",
      data: null,
    });
  });

  test("Returns error if updatedAt is in invalid format.", async () => {
    mockRequest.body = { session: {
      id: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      slotId: "f9c3e7b2-8d5a-4f1e-9a6d-2c7f3b8e5d1a",
      employeeId: "1e6d9a3f-7c2b-4f8e-b5a9-d3c7e1f2a8b6",
      customerId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      startTime: new Date(futureDate),
      message: null,
      createdAt: new Date(),
      updatedAt: "invalid-date"
    }};
    setupResponseFormat();

    await undoDeleteSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid updatedAt format. Expected Date object.",
      data: null,
    });
  });
  
  test("Returns error on failed database query.", async () => {
    mockRequest.body = { session: {
      id: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      slotId: "f9c3e7b2-8d5a-4f1e-9a6d-2c7f3b8e5d1a",
      employeeId: "1e6d9a3f-7c2b-4f8e-b5a9-d3c7e1f2a8b6",
      customerId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      startTime: new Date(futureDate),
      message: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }};
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
    setupResponseFormat();

    await undoDeleteSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Failed to add session.",
      data: null,
    });
  });

  test("Returns slot on successful database query.", async () => {
    mockRequest.body = { session: {
      id: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      slotId: "f9c3e7b2-8d5a-4f1e-9a6d-2c7f3b8e5d1a",
      employeeId: "1e6d9a3f-7c2b-4f8e-b5a9-d3c7e1f2a8b6",
      customerId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      startTime: new Date(futureDate),
      message: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }};
    const expectedData = {
      id: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      slotId: "f9c3e7b2-8d5a-4f1e-9a6d-2c7f3b8e5d1a",
      employeeId: "1e6d9a3f-7c2b-4f8e-b5a9-d3c7e1f2a8b6",
      customerId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      startTime: new Date(futureDate),
      message: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [expectedData] });
    setupResponseFormat();

    await undoDeleteSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Session has been restored.",
      data: expectedData,
    });
  });

  test("Returns 500 on database error.", async () => {
    mockRequest.body = { session: {
      id: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      slotId: "f9c3e7b2-8d5a-4f1e-9a6d-2c7f3b8e5d1a",
      employeeId: "1e6d9a3f-7c2b-4f8e-b5a9-d3c7e1f2a8b6",
      customerId: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      startTime: new Date(futureDate),
      message: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }};
    (pool.query as jest.Mock).mockRejectedValue(new Error("DB error"));

    await undoDeleteSession(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error." });
  });
});
