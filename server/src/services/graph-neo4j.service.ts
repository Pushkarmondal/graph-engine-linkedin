import { getSession } from "../../db/neo4j"

export const createUserNode = async (id: string, name: string, email: string) => {
  const session = getSession();
  await session.run(
    `
    CREATE (u:User {
    id: $id,
    name: $name,
    email: $email
    })
    `,
    { id, name, email }
  )
  await session.close();
}

export const createCompanyNode = async (id: string, name: string, industry: string) => {
  const session = getSession()
  await session.run(
    `
    CREATE (c:Company {
    id: $id,
    name: $name,
    industry: $industry
    })
    `,
    { id, name, industry }
  )
  await session.close();
}

export const createSkillNode = async (id: string, name: string) => {
  const session = getSession();
  await session.run(
    `
    CREATE (s:Skill {
    id: $id,
    name: $name
    })
    `,
    { id, name }
  )
  await session.close();
}

export const attachCompanyToUser = async (userId: string, companyId: string) => {
  const session = getSession();
  await session.run(
    `
    MATCH (u:User {id: $userId})
    MATCH (c:Company {id: $companyId})
    MERGE (u)-[:WORKS_AT]->(c)
    `,
    {userId, companyId}
  )
  await session.close();
}

export const attachSkillsToUser = async (userId: string, skillsId: string) => {
  const session = getSession();
  await session.run(
    `
    MATCH (u:User {id: $userId})
    MATCH (s:Skill {id: $skillsId})
    MERGE (u)-[:HAS_SKILL]->(s)
    `,
    {userId, skillsId}
  )
  await session.close();
}

export const connectUsers = async (fromId: string, toId: string) => {
  const session = getSession();
  await session.run(
    `
    MATCH (u1: User {id: $fromId})
    MATCH (u2: User {id: $toId})
    MERGE (u1)-[:CONNECTED]->(u2)
    MERGE (u2)-[:CONNECTED]->(u1)
    `,
    {from: fromId, to: toId}
  )
  await session.close();
}

export const getMutualConnections = async (userId: string, targetId: string) => {
  const session = getSession()
  
    const result = await session.run(
      `
      MATCH (a:User {id:$userId})-[:CONNECTED]->(m)<-[:CONNECTED]-(b:User {id:$targetId})
      RETURN m.id AS id, m.name AS name
      `,
      { userId, targetId }
    )
  
    await session.close()
  
    return result.records.map(r => ({
      id: r.get("id"),
      name: r.get("name")
    }))
}
