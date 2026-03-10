import type { Request, Response } from "express";
import { prisma } from "../../db/prismaConnection";

export const connectUsers = async (req: Request, res: Response) => {
  try {
    const { fromId, toId } = req.body;
    if (!fromId || !toId) {
      return res.status(400).json({ message: "Missing fromId or toId" })
    }
    const connection = await prisma.connection.create({
      data: {
        fromId,
        toId
      },
    })
    res.status(200).json({ 
      message: "Connection created successfully",
      connection
    })
  } catch (error) {
    res.status(500).json({ message: "Internal server error while connecting users" })
  }
}