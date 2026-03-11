import { v4 as uuid } from "uuid"
import { getSession } from "../../db/neo4j"

const USERS = 100
const CONNECTIONS = 500
const COMPANIES = 10
const SKILLS = 20

async function seed() {

  const session = getSession()

  try {

    const userIds: string[] = []
    const companyIds: string[] = []
    const skillIds: string[] = []

    // ─────────────────────────
    // Create Users
    // ─────────────────────────

    for (let i = 0; i < USERS; i++) {

      const id = uuid()
      userIds.push(id)

      await session.run(
        `
        CREATE (u:User {
          id:$id,
          name:$name,
          email:$email
        })
        `,
        {
          id,
          name: `User_${i}`,
          email: `user${i}@test.com`
        }
      )
    }

    console.log("Users created")

    // ─────────────────────────
    // Create Companies
    // ─────────────────────────

    for (let i = 0; i < COMPANIES; i++) {

      const id = uuid()
      companyIds.push(id)

      await session.run(
        `
        CREATE (c:Company {
          id:$id,
          name:$name,
          industry:"Tech"
        })
        `,
        {
          id,
          name: `Company_${i}`
        }
      )
    }

    console.log("Companies created")

    // ─────────────────────────
    // Create Skills
    // ─────────────────────────

    for (let i = 0; i < SKILLS; i++) {

      const id = uuid()
      skillIds.push(id)

      await session.run(
        `
        CREATE (s:Skill {
          id:$id,
          name:$name
        })
        `,
        {
          id,
          name: `Skill_${i}`
        }
      )
    }

    console.log("Skills created")

    // ─────────────────────────
    // Attach companies to users
    // ─────────────────────────

    for (const userId of userIds) {

      const company =
        companyIds[Math.floor(Math.random() * companyIds.length)]

      await session.run(
        `
        MATCH (u:User {id:$userId})
        MATCH (c:Company {id:$company})
        MERGE (u)-[:WORKS_AT]->(c)
        `,
        { userId, company }
      )
    }

    console.log("Users attached to companies")

    // ─────────────────────────
    // Attach skills
    // ─────────────────────────

    for (const userId of userIds) {

      const skill =
        skillIds[Math.floor(Math.random() * skillIds.length)]

      await session.run(
        `
        MATCH (u:User {id:$userId})
        MATCH (s:Skill {id:$skill})
        MERGE (u)-[:HAS_SKILL]->(s)
        `,
        { userId, skill }
      )
    }

    console.log("Skills attached")

    // ─────────────────────────
    // Create Connections
    // ─────────────────────────

    for (let i = 0; i < CONNECTIONS; i++) {

      const userA =
        userIds[Math.floor(Math.random() * userIds.length)]

      const userB =
        userIds[Math.floor(Math.random() * userIds.length)]

      if (userA === userB) continue

      await session.run(
        `
        MATCH (a:User {id:$userA})
        MATCH (b:User {id:$userB})

        MERGE (a)-[:CONNECTED]->(b)
        MERGE (b)-[:CONNECTED]->(a)
        `,
        { userA, userB }
      )
    }

    console.log("Connections created")

    console.log("Seed complete 🚀")

  } finally {

    await session.close()

  }
}

seed()