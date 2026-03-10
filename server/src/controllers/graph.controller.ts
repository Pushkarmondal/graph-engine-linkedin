import type { Request, Response } from "express";
import { prisma } from "../../db/prismaConnection";
import {
  getMutualConnections,
  getRecommendations,
  getShortestPath,
  getNetworkDepth,
} from "../services/graph.service";

// ─── GET /users/:id/mutual/:targetId ─────────────────────────────────────────

export const getMutualConnectionsController = async ( req: Request, res: Response ) => {
  try {
    const { id, targetId } = req.params;

    // Validate that both users actually exist
    const [userA, userB] = await Promise.all([
      prisma.user.findUnique({ where: { id }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: targetId }, select: { id: true } }),
    ]);

    if (!userA || !userB) {
      return res.status(404).json({
        success: false,
        error: "One or both users not found",
      });
    }

    const mutualConnections = await getMutualConnections(id!, targetId!);

    return res.status(200).json({
      success: true,
      userId: id,
      targetId,
      mutualConnections,
      count: mutualConnections.length,
    });
  } catch (error) {
    console.error("[getMutualConnections]", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching mutual connections",
    });
  }
};

// ─── GET /users/:id/recommendations ──────────────────────────────────────────

export const getRecommendationsController = async ( req: Request, res: Response ) => {
  try {
    const { id } = req.params;
    const rawLimit = req.query.limit;
    const limit =
      rawLimit && !isNaN(Number(rawLimit)) ? Math.min(Number(rawLimit), 50) : 10;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const recommendations = await getRecommendations(id!, limit);

    return res.status(200).json({
      success: true,
      userId: id,
      recommendations,
    });
  } catch (error) {
    console.error("[getRecommendations]", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching recommendations",
    });
  }
};

// ─── GET /connections/path?from=&to= ─────────────────────────────────────────

export const getShortestPathController = async ( req: Request, res: Response ) => {
  try {
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: "Both 'from' and 'to' query parameters are required",
      });
    }

    if (from === to) {
      return res.status(400).json({
        success: false,
        error: "'from' and 'to' must be different users",
      });
    }

    // Validate that both users actually exist
    const [userFrom, userTo] = await Promise.all([
      prisma.user.findUnique({ where: { id: from }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: to }, select: { id: true } }),
    ]);

    if (!userFrom || !userTo) {
      return res.status(404).json({
        success: false,
        error: "One or both users not found",
      });
    }

    const pathIds = await getShortestPath(from, to);

    if (!pathIds) {
      return res.status(404).json({
        success: false,
        error: "No connection path found within 5 hops",
      });
    }

    // Resolve IDs → names in a single DB round-trip
    const users = await prisma.user.findMany({
      where: { id: { in: pathIds } },
      select: { id: true, name: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u.name]));

    const path = pathIds.map((id) => ({
      id,
      name: userMap.get(id) ?? "Unknown",
    }));

    return res.status(200).json({
      success: true,
      from,
      to,
      hops: path.length - 1,
      path,
    });
  } catch (error) {
    console.error("[getShortestPath]", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while finding shortest path",
    });
  }
};

// ─── GET /users/:id/network-depth ─────────────────────────────────────────────

export const getNetworkDepthController = async ( req: Request, res: Response ) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const reachableWithin4Degrees = await getNetworkDepth(id!);

    return res.status(200).json({
      success: true,
      userId: id,
      name: user.name,
      reachableWithin4Degrees,
    });
  } catch (error) {
    console.error("[getNetworkDepth]", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while computing network depth",
    });
  }
};
