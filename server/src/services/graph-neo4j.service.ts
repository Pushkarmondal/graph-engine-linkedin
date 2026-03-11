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
}

