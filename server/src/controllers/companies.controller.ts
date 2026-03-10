import type { Request, Response } from "express";
import { prisma } from "../../db/prismaConnection";

export const createCompany = async(req: Request, res: Response) => {
  try {
    const { name, industry } = req.body;
    if (!name || !industry) {
      return res.status(400).json({
        message: 'Name and industry are required'
      });
    }
    const company = await prisma.company.create({
      data: {
        name,
        industry
      },
      select: {
        id: true,
        name: true,
        industry: true,
      }
    })
    res.status(201).json({
      message: 'Company created successfully',
      company
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error while creating of company'
    });
  }
};