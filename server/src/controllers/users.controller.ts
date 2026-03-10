import { type Request, type Response } from 'express';
import { prisma } from '../../db/prismaConnection';

export const createUsers = async (req: Request, res: Response) => {
  try {
    const { name, email, bio } = req.body;
    if (!name || !email || !bio) {
      return res.status(400).send({
        message: 'Name, email, and bio are required fields'
      });
    }
    const createdUser = await prisma.user.create({
      data: {
        name, 
        email,
        bio
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true
      }
    })
    res.status(201).send({
      message: 'User created successfully',
      user: createdUser
    });
  } catch (error) {
    res.status(500).send({
      message: 'Internal server error while creating of users'
    });
  }
};