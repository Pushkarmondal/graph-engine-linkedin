import type { Request, Response } from "express";
import { prisma } from "../../db/prismaConnection";

export const attachCompanyToUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { companyId } = req.body;
    if(!companyId) {
      return res.status(400).json({ error: "companyId is required" })
    }
    const connectCompanyToUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        companies: {
          connect: {
            id: companyId
          }
        }
      },
      include: {
        companies: true
      }
    })
    res.status(200).json({ message: "Company attached to User successfully", connectCompanyToUser })
  } catch (error) {
    res.status(500).json({ error: "Internal server error while attaching Company to User" })
  }
}