import type { Request, Response } from "express";
import { prisma } from "../../db/prismaConnection";

export const attachSkillsToUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { skillId } = req.body;
    if(!skillId) {
      return res.status(400).json({ error: "skillId is required" })
    }
    const connectSkillsToUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        skills: {
          connect: {
            id: skillId
          }
        }
      },
      include: {
        skills: true,
        companies: true
      }
    })
    res.status(200).json({ message: "Skills attached to User successfully", connectSkillsToUser })
  } catch (error) {
    res.status(500).json({ error: "Internal server error while attaching Skills to User" })
  }
}