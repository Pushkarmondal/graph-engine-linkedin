import type { Request, Response } from "express";
import { prisma } from "../../db/prismaConnection";

export const createSkill = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const skill = await prisma.skill.create({
      data: {
        name
      }
    })
    res.status(201).json({
      message: "Skill created successfully",
      skill
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error while creating skill" });
  }
}