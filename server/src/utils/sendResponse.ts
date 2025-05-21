import { Response } from "express";

export const sendResponse = (res: Response, message: string, data: null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
};