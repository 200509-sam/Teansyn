# TeamSync — Team Collaboration & Task Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-v22+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

> A full-stack engineering portfolio application demonstrating robust MERN architecture, RESTful API design, Role-Based Access Control (RBAC), and dynamic analytics.

---

## 1. Project Overview

**TeamSync** is an enterprise-grade team collaboration and workflow management platform designed to streamline project tracking across engineering teams. It enables organizations to register members, organize into teams, delegate responsibilities, track real-time Kanban tasks, and monitor workspace velocity through dynamic metrics.

Designed to serve as a **Software Development Engineer (SDE) Portfolio Project**, TeamSync emphasizes clean separation of concerns, defensive programming, automated integration testing, and production-ready security practices.

---

## 2. Core Features

### 🔐 Authentication & Security
- **JWT-Based Authentication**: Stateless authentication using signed JSON Web Tokens (`Bearer <token>`).
- **Cryptographic Password Hashing**: Passwords salt-hashed with `bcryptjs` (10 rounds); never stored or returned in plain text.
- **Client Route Protection**: `ProtectedRoute` wrapper guarding private routes, preserving intent redirect targets.
- **Input Sanitization & Validation**: Server and client-side validation against injection, invalid email domains, and schema violations.

### 🏢 Team & Workspace Management
- **Autonomous Workspace Creation**: Team creators automatically assume the `Admin` role.
- **Email-Based Member Invitations**: Seamlessly onboard registered users into teams without duplicate collisions.
- **Role-Based Permissions (RBAC)**:
  - **Admin**: Create teams, invite/remove members, update workspace details, delete teams, modify and reassign tasks.
  - **Member**: Access workspace boards, view assigned work, create tasks, and update workflow statuses.
- **Workload Visibility**: Real-time aggregated task counts per team member.

### 📋 Task Management & Kanban Board
- **Three-Column Kanban Workflow**: Visual board featuring `TO DO`, `IN PROGRESS`, and `COMPLETED` columns.
- **Instant Status Progression**: Update workflow states directly through card selectors with zero latency.
- **Dual View Modes**: Switch between **Kanban Board** and a compact **Table/List View**.
- **Multi-Facet Filtering & Search**:
  - Filter by Status (`To Do`, `In Progress`, `Completed`)
  - Filter by Priority (`Low`, `Medium`, `High`)
  - Filter by Workspace/Team
  - Filter by Assignee (`Assigned to Me`, `Unassigned`)
  - Real-time debounced full-text search across task titles and descriptions.
- **Deadline Tracking**: Real-time overdue detection with warning indicators for past-due unfinished tasks.

### 📊 Dynamic Dashboard Analytics
- Real-time calculated counters directly computed from MongoDB:
  - **Total Teams**
  - **Total Tasks**
  - **In Progress Tasks**
  - **Completed Tasks**
  - **Overdue Tasks**
  - **My Assigned Workload**
- Visual status distribution progress breakdown.
- Activity feed of the latest active team tasks.

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18, React Router v6, Lucide Icons | Component-driven architecture, declarative client-side routing, high-performance UI |
| **Styling** | Modern CSS3 (CSS Variables, Flexbox/Grid, Glassmorphism) | Lightweight, responsive design without bloated UI frameworks |
| **Backend** | Node.js, Express.js | Event-driven runtime, scalable REST API middleware pipeline |
| **Database** | MongoDB, Mongoose ODM | Document datastore for hierarchical team and task relationships |
| **Security** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` | Industry-standard stateless auth and secure credential hashing |
| **Build Tool** | Vite | Lightning-fast HMR and optimized production bundles |

---

## 4. System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React Frontend                       │
│        (Vite Dev Server @ http://localhost:5173)       │
│                                                        │
│  [AuthContext]  ───>  [Centralized api.js]            │
│  [Pages & Views] ───>  [TaskBoard / TeamCards / Modals]│
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON (Bearer JWT)
                           ▼
┌────────────────────────────────────────────────────────┐
│                 Express REST API Server                │
│                 (Port @ http://localhost:5000)         │
│                                                        │
│  ├── Middleware: CORS, JSON Parser, JWT Auth, Errors  │
│  ├── Controllers: authController, teamController, ...  │
│  └── Validation: Schema integrity, RBAC checks         │
└──────────────────────────┬─────────────────────────────┘
                           │ Mongoose ODM
                           ▼
┌────────────────────────────────────────────────────────┐
│                    MongoDB Database                    │
│                 (mongodb://127.0.0.1:27017)            │
│                                                        │
│  Collections: users, teams, tasks                      │
└────────────────────────────────────────────────────────┘
```

---

## 5. Folder Structure

```text
TeamSync/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile
│   │   ├── teamController.js     # Team CRUD & member management
│   │   └── taskController.js     # Task CRUD, filters, dynamic metrics
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT bearer token verification
│   │   └── errorMiddleware.js    # Centralized error handler & 404 handler
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt hooks
│   │   ├── Team.js               # Team schema with member roles
│   │   └── Task.js               # Task schema with references
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── teamRoutes.js         # /api/teams routes
│   │   └── taskRoutes.js         # /api/tasks routes
│   ├── scripts/
│   │   └── seed.js               # Realistic portfolio demo data seeder
│   ├── tests/
│   │   └── api.test.js           # Automated integration test suite
│   ├── .env                      # Environment config (gitignored)
│   ├── .env.example              # Example environment template
│   ├── package.json
│   └── server.js                 # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Modal.jsx         # Accessible modal dialog
│   │   │   ├── Navbar.jsx        # Navigation header with profile pill
│   │   │   ├── ProtectedRoute.jsx# Auth gatekeeper
│   │   │   ├── Sidebar.jsx       # Navigation drawer with active states
│   │   │   ├── TaskBoard.jsx     # 3-column Kanban board
│   │   │   ├── TaskCard.jsx      # Task card with priority & status trigger
│   │   │   └── TeamCard.jsx      # Workspace overview card
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state & token storage
│   │   ├── pages/
│   │   │   ├── CreateTask.jsx    # Task creation form with dynamic assignees
│   │   │   ├── Dashboard.jsx     # Dynamic analytics & recent activity
│   │   │   ├── Login.jsx         # Authentication sign in
│   │   │   ├── Profile.jsx       # User profile & my assigned tasks
│   │   │   ├── Register.jsx      # User registration form
│   │   │   ├── TaskDetails.jsx   # Team workspace roster & team tasks
│   │   │   ├── Tasks.jsx         # Full task view (Kanban & List toggle)
│   │   │   └── Teams.jsx         # Team directory & team creation
│   │   ├── services/
│   │   │   └── api.js            # Centralized API service with auth interceptor
│   │   ├── App.jsx               # Route tree
│   │   ├── index.css             # Design system styling
│   │   └── main.jsx              # React mounting root
│   ├── index.html
│   ├── package.json
│   └── vite.config.js            # Vite configuration with /api proxy
│
└── README.md
```

---

## 6. Database Design

### User Schema (`models/User.js`)
```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // Hashed with bcrypt
  createdAt: { type: Date, default: Date.now }
}
```

### Team Schema (`models/Team.js`)
```javascript
{
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  owner: { type: ObjectId, ref: 'User', required: true },
  members: [
    {
      user: { type: ObjectId, ref: 'User', required: true },
      role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
      joinedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
}
```

### Task Schema (`models/Task.js`)
```javascript
{
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  team: { type: ObjectId, ref: 'Team', required: true },
  assignedTo: { type: ObjectId, ref: 'User', default: null },
  createdBy: { type: ObjectId, ref: 'User', required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['To Do', 'In Progress', 'Completed'], default: 'To Do' },
  dueDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## 7. REST API Endpoints

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile |

### 🏢 Teams (`/api/teams`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/teams` | Private | Create team (creator is Admin) |
| `GET` | `/api/teams` | Private | List all teams user belongs to |
| `GET` | `/api/teams/:id` | Private | Get team details, members & task counts |
| `PUT` | `/api/teams/:id` | Admin | Update team name & description |
| `DELETE` | `/api/teams/:id` | Admin | Delete team & cascade-delete tasks |
| `POST` | `/api/teams/:id/members` | Admin | Add member by registered email |
| `DELETE` | `/api/teams/:id/members/:userId` | Admin | Remove member & unassign their tasks |

### 📋 Tasks (`/api/tasks`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tasks/dashboard/stats` | Private | Dynamic metrics (teams, tasks, overdue, etc.) |
| `POST` | `/api/tasks` | Private | Create task for a team |
| `GET` | `/api/tasks` | Private | Filter & search tasks across user's teams |
| `GET` | `/api/tasks/:id` | Private | Get single task by ID |
| `PUT` | `/api/tasks/:id` | Private/Admin | Update task details or workflow status |
| `DELETE` | `/api/tasks/:id` | Admin/Creator | Delete task |

---

## 8. Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or MongoDB Atlas URI)

### 1. Clone & Configure Backend
```bash
cd backend

# Install dependencies
npm install

# Setup environment variables (.env is preconfigured for local MongoDB)
cp .env.example .env
```

Ensure `.env` contains:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/teamsync
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 2. (Optional) Seed Demo Portfolio Data
To immediately test the application with realistic teams, members, and Kanban tasks:
```bash
npm run seed
```
Demo accounts created:
- `alex@teamsync.io` (password: `password123`) - Admin
- `sarah@teamsync.io` (password: `password123`) - Member
- `david@teamsync.io` (password: `password123`) - Member

### 3. Run Backend Integration Tests
```bash
npm test
```
*Validates registration, login, token authentication, role authorization, task CRUD, status transitions, and dynamic statistics.*

### 4. Start Backend Server
```bash
npm start
# Server listens on http://localhost:5000
```

### 5. Setup & Launch Frontend
In a separate terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
# Accessible at http://localhost:5173
```

---

## 9. SDE Technical Interview Talking Points

1. **Relational Constraints in MongoDB**:
   - Implemented relational integrity manually via Mongoose references (`User`, `Team`, `Task`).
   - Handled cascade deletions on team removal (`Task.deleteMany({ team: teamId })`) and member unassignments (`Task.updateMany({ team, assignedTo }, { assignedTo: null })`).

2. **Security & Authorization**:
   - Role-Based Access Control verified at the controller level: Admins hold roster management and deletion permissions, while Members are permitted status transitions.
   - All passwords salt-hashed using `bcryptjs` with 10 rounds; passwords explicitly omitted from queries (`select('-password')`).

3. **Performance & Aggregation**:
   - Multi-field indexes on team membership and task assignees.
   - Debounced search queries on the frontend to minimize redundant database round-trips.

4. **Stateless Scalability**:
   - Authentication relies strictly on cryptographically signed JWTs stored client-side, enabling zero-session backend clustering.

---

## 10. Future Enhancements

- **Real-Time Push Notifications**: Integrate WebSockets (`socket.io`) for instant Kanban card movement across concurrent browsers.
- **Activity Audit Log**: Time-series log tracking who changed task status or priority.
- **File Attachments**: S3/Cloudinary integration for attaching specification documents and screenshots to tasks.
- **Sprint & Milestone Planning**: Group tasks by weekly sprint cycles and burn-down charts.

---

**Developed for SDE Portfolio Demonstration**
