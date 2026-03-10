import { prisma } from "../../db/prismaConnection";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the IDs of every user directly connected to `userId`.
 * Connections are treated as **bidirectional** regardless of which side
 * was the originator when the row was created.
 */
async function getNeighborIds(userId: string): Promise<string[]> {
  const rows = await prisma.connection.findMany({
    where: {
      OR: [{ fromId: userId }, { toId: userId }],
    },
    select: { fromId: true, toId: true },
  });

  return rows.map((r) => (r.fromId === userId ? r.toId : r.fromId));
}

/**
 * Loads **all** connections from the database and builds a bidirectional
 * adjacency map  `userId → Set<neighborId>`.
 *
 * Loading the full graph once and doing BFS in-memory is far more efficient
 * than issuing a DB query per hop for the path / depth endpoints.
 */
async function buildAdjacencyMap(): Promise<Map<string, Set<string>>> {
  const allConnections = await prisma.connection.findMany({
    select: { fromId: true, toId: true },
  });

  const adj = new Map<string, Set<string>>();

  const addEdge = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  };

  for (const { fromId, toId } of allConnections) {
    addEdge(fromId, toId);
  }

  return adj;
}

// ─── 1. Mutual Connections ────────────────────────────────────────────────────

export interface MutualUser {
  id: string;
  name: string;
}

/**
 * Returns the list of users that are direct connections of **both**
 * `userId` and `targetId`.
 */
export async function getMutualConnections(
  userId: string,
  targetId: string
): Promise<MutualUser[]> {
  const [neighborsA, neighborsB] = await Promise.all([
    getNeighborIds(userId),
    getNeighborIds(targetId),
  ]);

  const setA = new Set(neighborsA);
  const mutualIds = neighborsB.filter(
    (id) => setA.has(id) && id !== userId && id !== targetId
  );

  if (mutualIds.length === 0) return [];

  return prisma.user.findMany({
    where: { id: { in: mutualIds } },
    select: { id: true, name: true },
  });
}

// ─── 2. Friend-of-Friend Recommendations ─────────────────────────────────────

export interface Recommendation {
  id: string;
  name: string;
  score: number;
}

/**
 * Suggests users that are 2 hops away from `userId` but not already connected.
 * `score` = number of shared mutual friends (higher → stronger recommendation).
 */
// export async function getRecommendations(
//   userId: string,
//   limit = 10
// ): Promise<Recommendation[]> {
//   const directFriends = new Set(await getNeighborIds(userId));

//   // Accumulate scores for every friend-of-friend candidate
//   const scoreMap = new Map<string, number>();

//   for (const friendId of directFriends) {
//     const fof = await getNeighborIds(friendId);
//     for (const candidate of fof) {
//       // Skip self and already-connected users
//       if (candidate === userId || directFriends.has(candidate)) continue;
//       scoreMap.set(candidate, (scoreMap.get(candidate) ?? 0) + 1);
//     }
//   }

//   if (scoreMap.size === 0) return [];

//   // Sort by descending score and take the top N
//   const topCandidates = [...scoreMap.entries()]
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, limit);

//   const candidateIds = topCandidates.map(([id]) => id);

//   const users = await prisma.user.findMany({
//     where: { id: { in: candidateIds } },
//     select: { id: true, name: true },
//   });

//   const userMap = new Map(users.map((u) => [u.id, u.name]));

//   return topCandidates.map(([id, score]) => ({
//     id,
//     name: userMap.get(id) ?? "Unknown",
//     score,
//   }));
// }
// 


export async function getRecommendations(
  userId: string,
  limit = 10
): Promise<Recommendation[]> {

  const adj = await buildAdjacencyMap()

  const direct = adj.get(userId) ?? new Set()

  const scores = new Map<string, number>()

  for (const friend of direct) {

    const fof = adj.get(friend) ?? new Set()

    for (const candidate of fof) {

      if (candidate === userId) continue
      if (direct.has(candidate)) continue

      scores.set(candidate, (scores.get(candidate) ?? 0) + 1)
    }
  }

  const ranked = [...scores.entries()]
    .sort((a,b) => b[1] - a[1])
    .slice(0, limit)

  const ids = ranked.map(([id]) => id)

  const users = await prisma.user.findMany({
    where: { id: { in: ids }},
    select: { id: true, name: true }
  })

  const map = new Map(users.map(u => [u.id, u.name]))

  return ranked.map(([id,score]) => ({
    id,
    name: map.get(id) ?? "Unknown",
    score
  }))
}

// ─── 3. Shortest Path (BFS) ───────────────────────────────────────────────────

const MAX_PATH_HOPS = 5;

/**
 * Finds the shortest connection path between `fromId` and `toId` using BFS.
 * Returns an **ordered array of user IDs** representing the path, or `null`
 * if no path exists within `MAX_PATH_HOPS` hops.
 */
export async function getShortestPath(
  fromId: string,
  toId: string
): Promise<string[] | null> {
  if (fromId === toId) return [fromId];

  const adj = await buildAdjacencyMap();

  // BFS queue entries: the full path taken to reach the current node
  const queue: string[][] = [[fromId]];
  const visited = new Set<string>([fromId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    // Prune paths that have already exceeded the hop limit
    if (path.length - 1 >= MAX_PATH_HOPS) continue;

    const neighbors = adj.get(current!) ?? new Set<string>();

    for (const neighbor of neighbors) {
      if (neighbor === toId) {
        return [...path, toId]; // Found the destination
      }

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return null; // No path found within the hop limit
}

// ─── 4. Network Depth (Reachable within N degrees) ───────────────────────────

const NETWORK_DEGREE_LIMIT = 4;

/**
 * Counts how many **distinct** users can be reached from `userId` by
 * traversing up to `NETWORK_DEGREE_LIMIT` (4) connection hops.
 * The originating user is excluded from the count.
 */
export async function getNetworkDepth(userId: string): Promise<number> {
  const adj = await buildAdjacencyMap();

  const visited = new Set<string>([userId]);
  let frontier: string[] = [userId];

  for (let degree = 1; degree <= NETWORK_DEGREE_LIMIT; degree++) {
    const nextFrontier: string[] = [];

    for (const nodeId of frontier) {
      const neighbors = adj.get(nodeId) ?? new Set<string>();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          nextFrontier.push(neighbor);
        }
      }
    }

    frontier = nextFrontier;
    if (frontier.length === 0) break; // Graph exhausted early
  }

  // Subtract 1 to exclude the starting user themselves
  return visited.size - 1;
}
