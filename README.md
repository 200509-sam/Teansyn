# TeamSync – Team Collaboration and Task Management Platform

## About the Project
TeamSync is a full-stack web application that helps teams manage projects, assign tasks, and track work progress in one place. It makes teamwork easier by organizing team members, tasks, deadlines, and responsibilities.

## Features
- **User Authentication:** Register and log in securely.
- **Team Management:** Create teams and manage team members.
- **Task Management:** Create, assign, update, and delete tasks.
- **Kanban Board:** Track tasks using To Do, In Progress, and Completed statuses.
- **Task Filtering:** Filter tasks by status, priority, team, and assignee.
- **Dashboard:** View task statistics, completed tasks, ongoing tasks, and overdue tasks.
- **Role-Based Access:** Different permissions for administrators and team members.

## Technologies Used
- **Frontend:** React.js, CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT), bcryptjs

## Project Structure
- `frontend/` – Contains the user interface.
- `backend/` – Contains server logic and API routes.
- `README.md` – Project documentation.

## Installation and Setup

### 1. Clone the Repository
```bash
git clone https://github.com/200509-sam/Teansyn.git
cd Teansyn
```

### 2. Start the Backend
```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder and configure your database connection and JWT secret. Use `.env.example` as a reference if available.

Start the backend:
```bash
npm start
```

### 3. Start the Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal to use the application.

## Future Improvements
- Real-time notifications
- File sharing
- Advanced project reports
- Sprint planning

## Author
Developed as a full-stack software development project to improve team collaboration and task management.
