# LinkedIn-Style Mutual Connection Engine (Neo4j + Node.js)

A graph-powered backend that demonstrates social network traversal, mutual connection discovery, friend-of-friend recommendations, and shortest path search — built with Neo4j and Node.js.

---

## What You're Building

A REST API that mimics core LinkedIn features using a **graph database** instead of a relational one. The key insight: connections are stored as direct graph edges, so traversing 1 hop, 2 hops, or 4 hops is extremely cheap compared to JOINs.

---

## Graph Data Model

### Nodes
| Node | Properties |
|------|-----------|
| `User` | id, name, email, bio |
| `Company` | id, name, industry |
| `Skill` | id, name |

### Relationships
```
(User)-[:CONNECTED_TO]->(User)
(User)-[:WORKS_AT]->(Company)
(User)-[:HAS_SKILL]->(Skill)
```

---

## Project Structure

```
src/
 ├── controllers/        # Request handlers
 ├── services/           # Business logic + Cypher queries
 ├── repositories/       # Neo4j query execution layer
 ├── routes/             # Express route definitions
 ├── db/
 │    └── neo4j.js       # Neo4j driver setup
 ├── seed/               # Seed script (1000 users)
 └── app.js              # Entry point
```

---

## Environment Variables

```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=yourpassword
PORT=3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create a new user |
| POST | `/companies` | Create a new company |
| POST | `/skills` | Create a new skill |
| POST | `/users/:id/company` | Attach a company to a user |
| POST | `/users/:id/skill` | Attach a skill to a user |
| POST | `/connect` | Connect two users |
| GET | `/users/:id/mutual/:targetId` | Get mutual connections |
| GET | `/users/:id/recommendations` | Get friend-of-friend suggestions |
| GET | `/connections/path` | Find shortest path between two users |
| GET | `/users/:id/network-depth` | Count reachable network within 4 degrees |

---

## Endpoint Reference + Postman Guide

---

### 1. `POST /users` — Create a User

**Request**
```
POST http://localhost:3000/users
Content-Type: application/json
```

```json
{
  "id": "user_001",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "bio": "Backend engineer at Zepto"
}
```

**Response `201 Created`**
```json
{
  "success": true,
  "user": {
    "id": "user_001",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "bio": "Backend engineer at Zepto"
  }
}
```

**Cypher (internal)**
```cypher
CREATE (u:User {id: $id, name: $name, email: $email, bio: $bio})
RETURN u
```

---

### 2. `POST /connect` — Connect Two Users

**Request**
```
POST http://localhost:3000/connect
Content-Type: application/json
```

```json
{
  "fromId": "user_001",
  "toId": "user_002"
}
```

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Connected user_001 and user_002"
}
```

**Error `404 Not Found`**
```json
{
  "success": false,
  "error": "One or both users not found"
}
```

**Cypher (internal)**
```cypher
MATCH (a:User {id: $fromId}), (b:User {id: $toId})
MERGE (a)-[:CONNECTED_TO]->(b)
MERGE (b)-[:CONNECTED_TO]->(a)
```

---

### 3. `GET /users/:id/mutual/:targetId` — Get Mutual Connections

**Request**
```
GET http://localhost:3000/users/user_001/mutual/user_003
```

**Response `200 OK`**
```json
{
  "success": true,
  "userId": "user_001",
  "targetId": "user_003",
  "mutualConnections": [
    {
      "id": "user_002",
      "name": "Priya Singh"
    },
    {
      "id": "user_007",
      "name": "Arjun Mehta"
    }
  ],
  "count": 2
}
```

**Response when no mutuals**
```json
{
  "success": true,
  "mutualConnections": [],
  "count": 0
}
```

**Cypher (internal)**
```cypher
MATCH (a:User {id: $userId})-[:CONNECTED_TO]->(mutual)<-[:CONNECTED_TO]-(b:User {id: $targetId})
RETURN mutual
```

---

### 4. `GET /users/:id/recommendations` — Friend-of-Friend Suggestions

**Request**
```
GET http://localhost:3000/users/user_001/recommendations
```

**Optional query param**
```
GET http://localhost:3000/users/user_001/recommendations?limit=5
```

**Response `200 OK`**
```json
{
  "success": true,
  "userId": "user_001",
  "recommendations": [
    {
      "id": "user_014",
      "name": "Sneha Patel",
      "score": 4
    },
    {
      "id": "user_022",
      "name": "Vikram Nair",
      "score": 3
    },
    {
      "id": "user_009",
      "name": "Ananya Roy",
      "score": 2
    }
  ]
}
```

> `score` = number of mutual friends who know this person. Higher score = stronger recommendation.

**Cypher (internal)**
```cypher
MATCH (u:User {id: $userId})-[:CONNECTED_TO]->(c)-[:CONNECTED_TO]->(suggested)
WHERE NOT (u)-[:CONNECTED_TO]->(suggested)
AND u <> suggested
RETURN suggested, count(*) as score
ORDER BY score DESC
LIMIT 10
```

---

### 5. `GET /connections/path` — Shortest Path Between Two Users

**Request**
```
GET http://localhost:3000/connections/path?from=user_001&to=user_099
```

**Response `200 OK`**
```json
{
  "success": true,
  "from": "user_001",
  "to": "user_099",
  "hops": 3,
  "path": [
    { "id": "user_001", "name": "Rahul Sharma" },
    { "id": "user_014", "name": "Sneha Patel" },
    { "id": "user_047", "name": "Karan Joshi" },
    { "id": "user_099", "name": "Meera Iyer" }
  ]
}
```

**Response when no path found**
```json
{
  "success": false,
  "error": "No connection path found within 5 hops"
}
```

**Cypher (internal)**
```cypher
MATCH p = shortestPath(
  (a:User {id: $from})-[:CONNECTED_TO*..5]-(b:User {id: $to})
)
RETURN p
```

> This is the **six degrees of separation** concept in action.

---

### 6. `GET /users/:id/network-depth` — Reachable Network Size

**Request**
```
GET http://localhost:3000/users/user_001/network-depth
```

**Response `200 OK`**
```json
{
  "success": true,
  "userId": "user_001",
  "name": "Rahul Sharma",
  "reachableWithin4Degrees": 842
}
```

> LinkedIn tracks this same metric as your "network size". With 1000 seeded users, expect numbers in the hundreds.

**Cypher (internal)**
```cypher
MATCH (u:User {id: $userId})-[:CONNECTED_TO*1..4]-(other)
RETURN count(distinct other)
```

---

## Seed Script

Run this to populate 1000 users with random connections, companies, and skills:

```bash
node src/seed/index.js
```

Seed creates:
- 1000 `User` nodes
- 50 `Company` nodes
- 30 `Skill` nodes
- ~5000 random `CONNECTED_TO` relationships
- Random `WORKS_AT` and `HAS_SKILL` relationships

> Graphs look meaningless with 5 users. With 1000 nodes, patterns emerge.

---

## Architecture Notes

### Why Neo4j over PostgreSQL?

**Relational DB (3-hop query):**
```sql
JOIN users_connections uc1 ON ...
JOIN users_connections uc2 ON ...
JOIN users_connections uc3 ON ...
```
Performance degrades exponentially with depth.

**Graph DB (same query):**
```cypher
MATCH (u)-[:CONNECTED_TO*1..3]->(other)
```
Traverses edges directly. Performance grows with relationship depth, not table size.

This is why fraud detection, recommendation systems, and social networks use graph databases.

---

## Postman Setup

1. Create a new **Collection** called `Connection Engine`
2. Set a **Collection Variable**: `baseUrl = http://localhost:3000`
3. Use `{{baseUrl}}/users` etc. in your requests
4. Import the endpoints above in order: create users → connect → query

**Suggested test flow:**
```
POST /users          (create user_001, user_002, user_003)
POST /connect        (connect 001↔002, 002↔003)
GET  /mutual         (001 and 003 should show 002 as mutual)
GET  /recommendations (001 should suggest 003)
GET  /path           (001 → 002 → 003)
GET  /network-depth  (001's reachable count)
```

---

## Scaling Considerations

- Add **indexes** on `User.id` for fast node lookup
- Use **read replicas** in Neo4j Aura for heavy traversal workloads
- Cache `/recommendations` results with Redis (TTL: 10 min)
- `/network-depth` is expensive on large graphs — run async and cache result

---

## Stack

- **Runtime:** Node.js (Express)
- **Database:** Neo4j 5.x
- **Driver:** `neo4j-driver` npm package
- **Query Language:** Cypher
