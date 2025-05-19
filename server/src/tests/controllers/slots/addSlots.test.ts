import { Request, Response } from "express";
import { pool } from "../../../index";
import { addSlots } from "../../../controllers/slots/addSlots";
import { getTestDates } from "../../../utils/getTestDates";
import { NormalizedSlots } from "../../../types";

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

  test("Returns error if slots are missing.", async () => {
    mockRequest.body = {};
    setupResponseFormat();

    await addSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Slots must be a non-empty array.",
      data: null,
    });
  });

  test("Returns error if any of slots is not an object.", async () => {
    mockRequest.body = { slots: [
      "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
      "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
      "AVAILABLE" as "AVAILABLE",
      new Date(futureDate),
      "00:30:00",
      false,
      new Date(),
      new Date(),
    ]};
    setupResponseFormat();

    await addSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Each slot must be a valid object.",
      data: null,
    });
  });

  test("Returns error if id is an invalid UUID.", async () => {
    mockRequest.body = { slots: [
      {
        id: "invalid-uuid",
        employeeId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
        type: "AVAILABLE" as "AVAILABLE",
        startTime: new Date(futureDate),
        duration: "00:30:00",
        recurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]};
    setupResponseFormat();

    await addSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid id format in slots. Expected UUID.",
      data: null,
    });
  });

  test("Returns error if employeeId is an invalid UUID.", async () => {
    mockRequest.body = { slots: [
      {
        id: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
        employeeId: "invalid-uuid",
        type: "AVAILABLE" as "AVAILABLE",
        startTime: new Date(futureDate),
        duration: "00:30:00",
        recurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]};
    setupResponseFormat();

    await addSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid employeeId format in slots. Expected UUID.",
      data: null,
    });
  });

  test(`Returns error if slot type is different than "AVAILABLE" or "BLOCKED" or "BOOKED".`, async () => {
    mockRequest.body = { slots: [
      {
        id: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
        employeeId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
        type: "INVALID_TYPE",
        startTime: new Date(futureDate),
        duration: "00:30:00",
        recurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]};
    setupResponseFormat();

    await addSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid type in slots. Expected AVAILABLE, BLOCKED or BOOKED.",
      data: null,
    });
  });

  test("returns error if slot startTime in invalid format", async () => {
    mockRequest.body = { slots: [
      {
        id: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
        employeeId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
        type: "AVAILABLE" as "AVAILABLE",
        startTime: "2025-10-10",
        duration: "00:30:00",
        recurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]};
    setupResponseFormat();

    await addSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid startTime format in slots.",
      data: null,
    });
  });

  test("Returns error if duration is in invalid format.", async () => {
    mockRequest.body = { slots: [
      {
        id: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
        employeeId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
        type: "AVAILABLE" as "AVAILABLE",
        startTime: new Date(futureDate),
        duration: 30,
        recurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]};
    setupResponseFormat();

    await addSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid duration format in slots. Expected string.",
      data: null,
    });
  });

  test("Returns error if recurring is in invalid format.", async () => {
    mockRequest.body = { slots: [
      {
        id: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
        employeeId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
        type: "AVAILABLE" as "AVAILABLE",
        startTime: new Date(futureDate),
        duration: "00:30:00",
        recurring: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]};
    setupResponseFormat();

    await addSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid recurring format in slots. Expected boolean.",
      data: null,
    });
  });

  test("Returns error if createdAt is in invalid format.", async () => {
    mockRequest.body = { slots: [
      {
        id: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
        employeeId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
        type: "AVAILABLE" as "AVAILABLE",
        startTime: new Date(futureDate),
        duration: "00:30:00",
        recurring: false,
        createdAt: "2025-10-10",
        updatedAt: new Date(),
      }
    ]};
    setupResponseFormat();

    await addSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid createdAt format in slots.",
      data: null,
    });
  });

  test("Returns error if updatedAt is in invalid format.", async () => {
    mockRequest.body = { slots: [
      {
        id: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
        employeeId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
        type: "AVAILABLE" as "AVAILABLE",
        startTime: new Date(futureDate),
        duration: "00:30:00",
        recurring: false,
        createdAt: new Date(),
        updatedAt: "2025-10-10",
      }
    ]};
    setupResponseFormat();

    await addSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Invalid updatedAt format in slots.",
      data: null,
    });
  });

  test("Returns error on failed database mutation.", async () => {
    mockRequest.body = { slots: [
      {
        id: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
        employeeId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
        type: "AVAILABLE" as "AVAILABLE",
        startTime: new Date(futureDate),
        duration: "00:30:00",
        recurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]};
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
    setupResponseFormat();

    await addSlots(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Failed to add slots.",
      data: null,
    });
  });

  test("Returns normalized slots on successful database mutation.", async () => {
    const slots = [
      {
        id: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
        employeeId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
        type: "AVAILABLE" as "AVAILABLE",
        startTime: new Date(futureDate),
        duration: "00:30:00",
        recurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    mockRequest.body = { slots };
    (pool.query as jest.Mock).mockResolvedValue({ rows: slots });
    setupResponseFormat();

    await addSlots(mockRequest as Request, mockResponse as Response);

    const expectedData: NormalizedSlots = {
      byId: {
        ["6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a"]: slots[0],
      },
      allIds: ["6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a"],
    };

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Slots have been restored.",
      data: expectedData,
    });
  });

  test("Returns 500 on database error.", async () => {
    mockRequest.body = { slots : [
      {
        id: "6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a",
        employeeId: "92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f",
        type: "AVAILABLE" as "AVAILABLE",
        startTime: new Date(futureDate),
        duration: "00:30:00",
        recurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]
    };
    (pool.query as jest.Mock).mockRejectedValue(new Error("DB error"));

    await addSlots(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error." });
  });
});