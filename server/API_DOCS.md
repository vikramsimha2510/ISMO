# ISMO API Documentation

Base URL: `http://localhost:5000/api`

All responses use `Content-Type: application/json`.

---

## Authentication

### POST `/auth/register`

Create a new user account.

**Rate limited**: 10 requests / 15 min / IP

**Request Body**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `fullName` | string | ✅ | min 2 chars |
| `email` | string | ✅ | valid email |
| `password` | string | ✅ | min 6 chars |

**Success Response** — `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2026-06-18T12:00:00.000Z"
  },
  "token": "eyJhbGciOi..."
}
```

**Error Responses**
| Status | Condition |
|--------|-----------|
| `400` | Validation failed (missing/invalid fields) |
| `409` | Email already registered |
| `429` | Rate limit exceeded |

---

### POST `/auth/login`

Authenticate an existing user.

**Rate limited**: 10 requests / 15 min / IP

**Request Body**
```json
{
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Success Response** — `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2026-06-18T12:00:00.000Z"
  },
  "token": "eyJhbGciOi..."
}
```

**Error Responses**
| Status | Condition |
|--------|-----------|
| `400` | Validation failed |
| `401` | Invalid email or password |
| `429` | Rate limit exceeded |

---

### POST `/auth/logout`

Log out the current user (server-side session invalidation).

**Auth required**: `Authorization: Bearer <token>`

**Success Response** — `200 OK`
```json
{
  "message": "Logged out"
}
```

**Error Responses**
| Status | Condition |
|--------|-----------|
| `401` | Missing or invalid token |

---

## Projects

All project endpoints require `Authorization: Bearer <token>`.

All project data is scoped to the authenticated user — you can only see/modify your own projects.

### GET `/projects`

List projects with optional filtering and pagination.

**Query Parameters**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Filter by name (case-insensitive contains) |
| `status` | string | — | Filter by status: `Not Started`, `In Progress`, `Completed` |
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page (max 100) |

**Success Response** — `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "My Project",
      "description": "Description",
      "status": "In Progress",
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-12-31T00:00:00.000Z",
      "taskCount": 5,
      "completionPercentage": 40,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z",
      "userId": "uuid"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

---

### GET `/projects/:id`

Get a single project by ID.

**Success Response** — `200 OK`

Same shape as a single item in the `data` array above.

**Error Responses**
| Status | Condition |
|--------|-----------|
| `401` | Unauthorized |
| `404` | Project not found or not owned by user |

---

### POST `/projects`

Create a new project.

**Request Body**
```json
{
  "name": "New Project",
  "description": "Optional description",
  "status": "Not Started",
  "startDate": "2026-07-01",
  "endDate": "2026-12-31"
}
```

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `name` | string | ✅ | — |
| `description` | string | ❌ | `null` |
| `status` | string | ❌ | `"Not Started"` |
| `startDate` | date string | ❌ | `null` |
| `endDate` | date string | ❌ | `null` |

**Success Response** — `201 Created`

---

### PUT `/projects/:id`

Update a project. Only fields included in the body are updated.

**Request Body** — all fields optional (same as create).

**Success Response** — `200 OK`

**Error Responses**
| Status | Condition |
|--------|-----------|
| `400` | Validation failed |
| `404` | Project not found or not owned by user |

---

### DELETE `/projects/:id`

Delete a project and all its tasks (cascade).

**Success Response** — `204 No Content` (empty body)

**Error Responses**
| Status | Condition |
|--------|-----------|
| `404` | Project not found or not owned by user |

---

## Tasks

All task endpoints require `Authorization: Bearer <token>`.

All task data is scoped to the authenticated user.

### GET `/tasks`

List tasks with optional filtering and pagination.

**Query Parameters**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `projectId` | string | — | Filter by project |
| `search` | string | — | Filter by name (case-insensitive) |
| `status` | string | — | `Pending`, `In Progress`, `Completed` |
| `priority` | string | — | `Low`, `Medium`, `High` |
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page (max 100) |

**Success Response** — `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "name": "Design API Schema",
      "description": "Description",
      "priority": "High",
      "status": "In Progress",
      "dueDate": "2026-07-15T00:00:00.000Z",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-10T00:00:00.000Z",
      "userId": "uuid"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

---

### GET `/tasks/:id`

Get a single task by ID.

**Success Response** — `200 OK`

**Error Responses**
| Status | Condition |
|--------|-----------|
| `404` | Task not found or not owned by user |

---

### POST `/tasks`

Create a new task. The referenced project must belong to the authenticated user.

**Request Body**
```json
{
  "projectId": "uuid",
  "name": "New Task",
  "description": "Optional",
  "priority": "Medium",
  "status": "Pending",
  "dueDate": "2026-08-01"
}
```

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `projectId` | string | ✅ | — |
| `name` | string | ✅ | — |
| `description` | string | ❌ | `null` |
| `priority` | string | ❌ | `"Medium"` |
| `status` | string | ❌ | `"Pending"` |
| `dueDate` | date string | ❌ | `null` |

**Success Response** — `201 Created`

**Error Responses**
| Status | Condition |
|--------|-----------|
| `400` | Validation failed |
| `404` | Referenced project not found or not owned by user |

---

### PUT `/tasks/:id`

Update a task. Only fields included in the body are updated.

**Success Response** — `200 OK`

**Error Responses**
| Status | Condition |
|--------|-----------|
| `400` | Validation failed (e.g. invalid priority) |
| `404` | Task not found or not owned by user |

---

### DELETE `/tasks/:id`

Delete a task.

**Success Response** — `204 No Content` (empty body)

**Error Responses**
| Status | Condition |
|--------|-----------|
| `404` | Task not found or not owned by user |

---

## Dashboard

### GET `/dashboard/stats`

Get aggregate statistics for the authenticated user.

**Auth required**: `Authorization: Bearer <token>`

**Success Response** — `200 OK`
```json
{
  "totalProjects": 5,
  "projectsInProgress": 3,
  "totalTasks": 50,
  "completedTasks": 20,
  "pendingTasks": 30,
  "productivityScore": 0,
  "teamMembersCount": 0,
  "insights": [],
  "recentActivities": [],
  "upcomingDeadlines": [],
  "progressTrend": []
}
```

> **Note**: `productivityScore`, `teamMembersCount`, `insights`, `recentActivities`, `upcomingDeadlines`, and `progressTrend` are placeholders (return zero / empty arrays) until those features are built. The five core counts are computed in real-time from the database.

---

## Health Check

### GET `/health`

**No auth required.**

**Success Response** — `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-06-18T12:00:00.000Z"
}
```

---

## Common Error Shapes

All errors follow a consistent format:

```json
{
  "message": "Human-readable error message"
}
```

Validation errors include additional detail:

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Must be a valid email address" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```
