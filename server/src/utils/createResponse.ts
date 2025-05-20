import { Response } from "express";

export const createResponse = (res: Response, message: string, data: null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
};