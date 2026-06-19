# ISMO - Project Management Platform

ISMO is a full-stack project management platform built to help engineers and teams organize their tasks, track project progress, and manage activities with a premium, modern user interface.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS (Custom Glassmorphism Design), Lucide React (Icons), React Hook Form + Zod (Validation), React Router.
- **Backend**: Node.js, Express, TypeScript, Zod (Validation).
- **Database**: PostgreSQL (managed via Supabase).
- **ORM**: Prisma.
- **Authentication**: Supabase Auth (JWT, Row Level Security compatible).
- **Containerization**: Docker & Docker Compose.

---

## Database Schema & ER Diagram

The database uses PostgreSQL and is managed entirely through Prisma. The schema includes users, profiles, projects, tasks, and activity logs.

```mermaid
erDiagram
    AuthUser ||--o| Profile : "1 to 1"
    Profile ||--o{ Project : "creates"
    Profile ||--o{ Task : "assigned to"
    Profile ||--o{ Activity : "performs"
    Project ||--o{ Task : "contains"

    AuthUser {
        Uuid id PK
    }

    Profile {
        Uuid id PK "FK to AuthUser"
        String fullName
        DateTime createdAt
    }

    Project {
        String id PK
        Uuid userId FK "FK to Profile"
        String name
        String description
        ProjectStatus status "NOT_STARTED, IN_PROGRESS, COMPLETED"
        DateTime startDate
        DateTime endDate
        DateTime createdAt
        DateTime updatedAt
    }

    Task {
        String id PK
        String projectId FK "FK to Project"
        Uuid userId FK "FK to Profile"
        String name
        String description
        TaskPriority priority "LOW, MEDIUM, HIGH"
        TaskStatus status "PENDING, IN_PROGRESS, COMPLETED"
        DateTime dueDate
        DateTime createdAt
        DateTime updatedAt
    }

    Activity {
        String id PK
        Uuid userId FK "FK to Profile"
        String action
        String target
        DateTime createdAt
    }
```

---

## API Documentation

The backend exposes a RESTful API running on `/api`. All protected routes require a `Bearer <token>` in the `Authorization` header.

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Body | Auth Required |
|--------|----------|-------------|------|---------------|
| POST | `/register` | Register a new user | `{ email, password, fullName }` | No |
| POST | `/login` | Log in an existing user | `{ email, password }` | No |
| POST | `/logout` | Invalidate user session | None | Yes |
| POST | `/forgot-password` | Send password recovery email | `{ email }` | No |
| POST | `/reset-password` | Set new password with recovery token | `{ password }` | Yes (Recovery Token) |

### Projects (`/api/projects`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all projects for the authenticated user | Yes |
| GET | `/:id` | Get a specific project by ID | Yes |
| POST | `/` | Create a new project | Yes |
| PUT | `/:id` | Update project details | Yes |
| DELETE | `/:id` | Delete a project | Yes |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all tasks for the user | Yes |
| GET | `/:projectId` | Get tasks for a specific project | Yes |
| POST | `/` | Create a new task | Yes |
| PUT | `/:id` | Update task details / status | Yes |
| DELETE | `/:id` | Delete a task | Yes |

### Dashboard & Analytics (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/stats` | Get aggregate statistics (completion rates, task counts) | Yes |
| GET | `/activity` | Get recent activity logs for the user | Yes |

---

## Setup & Local Development

### Prerequisites
- Node.js (v20+)
- Docker & Docker Compose
- A Supabase Project (for Auth & PostgreSQL)

### 1. Environment Variables
Copy `.env.example` to `.env` in the `server` directory and fill in your Supabase details:
```env
# server/.env
DATABASE_URL="postgres://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

### 2. Run with Docker
The easiest way to run the application locally is using Docker Compose:
```bash
docker-compose up -d --build
```
- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5000/api`

### 3. Database Management (Prisma)
To view and manage the live data locally through a GUI:
```bash
cd server
npx prisma studio
```
This runs the database studio at `http://localhost:5555`.
