# 📋 Task Manager — MERN Stack

A full-stack **Task Management System** built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js) following clean code principles and modular architecture.

---

## 🚀 Features

### 👤 Role-Based Access Control
- **Admin** — Full system access: create/update/delete tasks & manage employees
- **Employee** — Restricted access: view & update only their own assigned tasks

### 📝 Task Management
- Create, update, and delete tasks (Admin)
- Assign tasks to employees with priority and due date
- Task statuses: `pending` · `in-progress` · `completed` · `on-hold`
- Employees can update their task status and add progress notes

### 👥 Employee Management
- Admin can create, view, and delete employee profiles
- Default password assigned on creation (`Emp@123456`)

### 🔐 Authentication
- Email & password-based login (JWT)
- Role-aware dashboard routing
- Token persisted in localStorage with session validation on load

### 🛡️ API Design
- Standardized `ApiResponse` and `ApiError` classes for consistent responses
- Centralized error handling (Mongoose, JWT, validation errors)
- Role-based middleware (`protect`, `restrictTo`)

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React.js (Vite), Vanilla CSS      |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB (Mongoose ODM)            |
| Auth       | JWT (jsonwebtoken), bcryptjs      |
| Dev Tools  | morgan, dotenv, cors              |

---

## 📁 Project Structure

```
task-manager/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Route handlers (auth, user, task)
│   │   ├── middleware/     # Auth, role, error middleware
│   │   ├── models/         # Mongoose schemas (User, Task)
│   │   ├── routes/         # Express route definitions
│   │   └── utils/          # ApiError, ApiResponse, JWT helpers, seed
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/     # Navbar, TaskCard, Modals, StatsCards
    │   ├── context/        # AuthContext (global auth state)
    │   ├── pages/          # LoginPage, DashboardPage
    │   └── services/       # api.js (fetch wrapper)
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally on port `27017`

### 1. Clone the repository
```bash
git clone https://github.com/Shubh1202/task-manager.git
cd task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/task_manager_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
ADMIN_DEFAULT_NAME=System Administrator
ADMIN_DEFAULT_EMAIL=admin@taskmanager.com
ADMIN_DEFAULT_PASSWORD=Admin@123
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The frontend runs on **http://localhost:3000** and proxies API calls to the backend on port `5000`.

---

## 🔑 Default Admin Credentials

On first run, a default admin account is automatically seeded:

| Field    | Value                    |
|----------|--------------------------|
| Email    | `admin@taskmanager.com`  |
| Password | `Admin@123`              |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint         | Access  | Description          |
|--------|------------------|---------|----------------------|
| POST   | `/api/auth/login`| Public  | Login with email & password |
| GET    | `/api/auth/me`   | Private | Get current user     |

### Users (Employees)
| Method | Endpoint                   | Access | Description           |
|--------|----------------------------|--------|-----------------------|
| GET    | `/api/users/employees`     | Admin  | List all employees    |
| POST   | `/api/users/employees`     | Admin  | Create employee       |
| GET    | `/api/users/employees/:id` | Admin  | Get employee by ID    |
| DELETE | `/api/users/employees/:id` | Admin  | Delete employee       |

### Tasks
| Method | Endpoint                         | Access        | Description                      |
|--------|----------------------------------|---------------|----------------------------------|
| GET    | `/api/tasks`                     | Both          | Get tasks (role-filtered)        |
| POST   | `/api/tasks`                     | Admin         | Create task                      |
| GET    | `/api/tasks/:id`                 | Both          | Get task by ID                   |
| PUT    | `/api/tasks/:id`                 | Admin         | Full task update                 |
| DELETE | `/api/tasks/:id`                 | Admin         | Delete task                      |
| PATCH  | `/api/tasks/:id/status`          | Both          | Quick status update              |
| PATCH  | `/api/tasks/:id/employee-update` | Both          | Employee progress update         |

---

## 🏗️ API Response Format

**Success:**
```json
{
  "success": true,
  "message": "Request successful.",
  "data": { ... },
  "meta": { "count": 5 }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [{ "field": "email", "message": "Email is required." }]
}
```

---

## 📄 License

MIT
