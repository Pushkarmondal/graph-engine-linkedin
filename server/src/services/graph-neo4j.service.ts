// import { getSession } from "../../db/neo4j"

// export const createUserNode = async (id: string, name: string, email: string) => {
//   const session = getSession();
//   await session.run(
//     `
//     CREATE (u:User {
//     id: $id,
//     name: $name,
//     email: $email
//     })
//     `,
//     { id, name, email }
//   )
//   await session.close();
// }

// export const createCompanyNode = async (id: string, name: string, industry: string) => {
//   const session = getSession()
//   await session.run(
//     `
//     CREATE (c:Company {
//     id: $id,
//     name: $name,
//     industry: $industry
//     })
//     `,
//     { id, name, industry }
//   )
//   await session.close();
// }

// export const createSkillNode = async (id: string, name: string) => {
//   const session = getSession();
//   await session.run(
//     `
//     CREATE (s:Skill {
//     id: $id,
//     name: $name
//     })
//     `,
//     { id, name }
//   )
//   await session.close();
// }

// export const attachCompanyToUser = async (userId: string, companyId: string) => {
//   const session = getSession();
//   await session.run(
//     `
//     MATCH (u:User {id: $userId})
//     MATCH (c:Company {id: $companyId})
//     MERGE (u)-[:WORKS_AT]->(c)
//     `,
//     {userId, companyId}
//   )
//   await session.close();
// }

// export const attachSkillsToUser = async (userId: string, skillsId: string) => {
//   const session = getSession();
//   await session.run(
//     `
//     MATCH (u:User {id: $userId})
//     MATCH (s:Skill {id: $skillsId})
//     MERGE (u)-[:HAS_SKILL]->(s)
//     `,
//     {userId, skillsId}
//   )
//   await session.close();
// }

// export const connectUsers = async (fromId: string, toId: string) => {
//   const session = getSession();
//   await session.run(
//     `
//     MATCH (u1: User {id: $fromId})
//     MATCH (u2: User {id: $toId})
//     MERGE (u1)-[:CONNECTED]->(u2)
//     MERGE (u2)-[:CONNECTED]->(u1)
//     `,
//     {from: fromId, to: toId}
//   )
//   await session.close();
// }

// export const getMutualConnections = async (userId: string, targetId: string) => {
//   const session = getSession()
  
//     const result = await session.run(
//       `
//       MATCH (a:User {id:$userId})-[:CONNECTED]->(m)<-[:CONNECTED]-(b:User {id:$targetId})
//       RETURN m.id AS id, m.name AS name
//       `,
//       { userId, targetId }
//     )
  
//     await session.close()
  
//     return result.records.map(r => ({
//       id: r.get("id"),
//       name: r.get("name")
//     }))
// }


// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 



import { getSession } from "../../db/neo4j"

// ─────────────────────────────────────────────
// 1. Create User
// ─────────────────────────────────────────────

export const createUserNode = async (
  id: string,
  name: string,
  email: string
) => {

  const session = getSession()

  try {

    await session.run(
      `
      MERGE (u:User {id:$id})
      SET u.name = $name,
          u.email = $email
      `,
      { id, name, email }
    )

  } finally {
    await session.close()
  }
}


// ─────────────────────────────────────────────
// 2. Create Company
// ─────────────────────────────────────────────

export const createCompanyNode = async (
  id: string,
  name: string,
  industry: string
) => {

  const session = getSession()

  try {

    await session.run(
      `
      MERGE (c:Company {id:$id})
      SET c.name = $name,
          c.industry = $industry
      `,
      { id, name, industry }
    )

  } finally {
    await session.close()
  }
}


// ─────────────────────────────────────────────
// 3. Create Skill
// ─────────────────────────────────────────────

export const createSkillNode = async (
  id: string,
  name: string
) => {

  const session = getSession()

  try {

    await session.run(
      `
      MERGE (s:Skill {id:$id})
      SET s.name = $name
      `,
      { id, name }
    )

  } finally {
    await session.close()
  }
}


// ─────────────────────────────────────────────
// 4. Attach Company To User
// ─────────────────────────────────────────────

export const attachCompanyToUser = async (
  userId: string,
  companyId: string
) => {

  const session = getSession()

  try {

    await session.run(
      `
      MATCH (u:User {id:$userId})
      MATCH (c:Company {id:$companyId})
      MERGE (u)-[:WORKS_AT]->(c)
      `,
      { userId, companyId }
    )

  } finally {
    await session.close()
  }
}


// ─────────────────────────────────────────────
// 5. Attach Skill To User
// ─────────────────────────────────────────────

export const attachSkillsToUser = async (
  userId: string,
  skillId: string
) => {

  const session = getSession()

  try {

    await session.run(
      `
      MATCH (u:User {id:$userId})
      MATCH (s:Skill {id:$skillId})
      MERGE (u)-[:HAS_SKILL]->(s)
      `,
      { userId, skillId }
    )

  } finally {
    await session.close()
  }
}


// ─────────────────────────────────────────────
// 6. Connect Two Users
// ─────────────────────────────────────────────

export const connectUsers = async (
  fromId: string,
  toId: string
) => {

  const session = getSession()

  try {

    await session.run(
      `
      MATCH (a:User {id:$fromId})
      MATCH (b:User {id:$toId})

      MERGE (a)-[:CONNECTED]->(b)
      MERGE (b)-[:CONNECTED]->(a)
      `,
      { fromId, toId }
    )

  } finally {
    await session.close()
  }
}


// ─────────────────────────────────────────────
// 7. Mutual Connections
// ─────────────────────────────────────────────

export const getMutualConnections = async (
  userId: string,
  targetId: string
) => {

  const session = getSession()

  try {

    const result = await session.run(
      `
      MATCH (a:User {id:$userId})-[:CONNECTED]->(m)<-[:CONNECTED]-(b:User {id:$targetId})
      RETURN m.id AS id, m.name AS name
      `,
      { userId, targetId }
    )

    return result.records.map(record => ({
      id: record.get("id"),
      name: record.get("name")
    }))

  } finally {
    await session.close()
  }
}


// ─────────────────────────────────────────────
// 8. Friend Recommendations
// ─────────────────────────────────────────────

export const getRecommendations = async (
  userId: string,
  limit = 10
) => {

  const session = getSession()

  try {

    const result = await session.run(
      `
      MATCH (u:User {id:$userId})-[:CONNECTED]->()-[:CONNECTED]->(rec)
      WHERE NOT (u)-[:CONNECTED]->(rec)
      AND u <> rec

      RETURN rec.id AS id,
             rec.name AS name,
             COUNT(*) AS score
      ORDER BY score DESC
      LIMIT $limit
      `,
      { userId, limit }
    )

    return result.records.map(r => ({
      id: r.get("id"),
      name: r.get("name"),
      score: r.get("score").toNumber()
    }))

  } finally {
    await session.close()
  }
}


// ─────────────────────────────────────────────
// 9. Shortest Path
// ─────────────────────────────────────────────

export const getShortestPath = async (
  fromId: string,
  toId: string
) => {

  const session = getSession()

  try {

    const result = await session.run(
      `
      MATCH p = shortestPath(
        (a:User {id:$fromId})-[:CONNECTED*..5]-(b:User {id:$toId})
      )
      RETURN p
      `,
      { fromId, toId }
    )

    if (result.records.length === 0) return null

    const path = result.records[0]!.get("p")

    return path.segments.map((segment: any) => ({
      from: segment.start.properties.name,
      to: segment.end.properties.name
    }))

  } finally {
    await session.close()
  }
}


// ─────────────────────────────────────────────
// 10. Network Depth
// ─────────────────────────────────────────────

export const getNetworkDepth = async (userId: string) => {

  const session = getSession()

  try {

    const result = await session.run(
      `
      MATCH (u:User {id:$userId})-[:CONNECTED*1..4]-(n)
      RETURN COUNT(DISTINCT n) AS networkSize
      `,
      { userId }
    )

    return result.records[0]!.get("networkSize").toNumber()

  } finally {
    await session.close()
  }
}