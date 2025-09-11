# Taskly – React + PHP/MySQL Task Manager

Taskly is a simple, full‑stack task management web app built with React on the frontend and PHP/MySQL on the backend. It supports authentication, task CRUD, inline status changes, favorites/important flags, due‑date reminders, and an admin panel.

## Tech Stack
- Frontend: React (CRA), Bootstrap 5, FontAwesome, react-datepicker, date-fns
- Backend: PHP (procedural), MySQL (XAMPP stack)
- Hosting (local): Apache + MySQL via XAMPP

## Why React for this App
- Component-based: Reusable UI pieces (task card, modal, admin table) map naturally.
- State management: Local and lifted state keep UI interactions consistent and responsive.
- Ecosystem: Mature libraries (e.g., react-datepicker) and smooth Bootstrap integration.
- SPA UX: Fast, no full page reloads; easy conditional modals and inline controls.

Alternatives and rationale:
- jQuery/vanilla JS: Managing complex UI state across many components becomes error‑prone.
- Angular: Heavier scaffolding and patterns for a small/medium demo app.
- Vue: Great option; React chosen due to team familiarity and existing CRA toolchain.
- Backend not in Node: PHP fits XAMPP, was faster to spin up; can be swapped later without frontend changes.

---

## Project Structure
```
React/
  taskly/
    backend/            # PHP endpoints (Apache-served under htdocs)
    frontend/           # React app (CRA)
    README.md
```

## Architecture & Data Flow
- React SPA calls PHP endpoints for CRUD using fetch.
- PHP talks to MySQL and returns JSON.
- After any mutation, the frontend re-fetches the task list for consistency.

### Core Frontend Files
- `src/App.jsx`: API base, login state, task fetching, handlers, and DueSoonModal
- `src/components/TodoListCard.jsx`: Task rows; checkbox for done; favorite/important toggles; click-to-open status dropdown
- `src/components/CreateTaskForm.jsx`: Create/update task modal; local date formatting (yyyy‑MM‑dd)
- `src/components/DueSoonModal.jsx`: Reminder shown after login if tasks are due today/tomorrow
- `src/components/AdminPanel.jsx`: Admin list with filters and debounce search
- `src/index.js`: Bootstrap CSS/JS imports; exposes `window.bootstrap`

### Core Backend Endpoints
- `GET getTasks.php?user_id=<id>` → Tasks for user
- `GET getTasksAdmin.php?[status]&[user_id]&[q]` → Admin listing with optional filters
- `POST addTask.php` → { user_id, title, description, startDate, dueDate, priority, status, is_favorite, is_important, is_done }
- `POST updateTask.php` → { id, user_id, title, description, startDate, dueDate, priority, status }
- `POST updateStatus.php` → { id, user_id, is_done, status }
- `POST deleteTask.php` → { id, user_id }
- `POST toggleFavorite.php` → { id, user_id, is_favorite }
- `POST toggleImportant.php` → { id, user_id, is_important }
- Auth: `signupUser.php`, `loginUser.php`
- Profile: `get_profile.php`, `update_profile.php`, uploads under `backend/uploads/`

### Task Model (DB)
- id (int, PK)
- user_id (int, FK)
- title (varchar)
- description (text)
- start_date (date, yyyy‑MM‑dd)
- due_date (date, yyyy‑MM‑dd)
- priority (enum: Low | Medium | High | Urgent)
- status (enum: Open | In Progress | On Hold | Cancelled | Completed)
- is_favorite, is_important, is_done (tinyint 0/1)

---

## Setup (Local)

### Prerequisites
- XAMPP (Apache + MySQL)
- Node.js 18+ and npm

### Backend
1) Place the project under XAMPP htdocs as: `C:\xampp\htdocs\React\taskly`.
2) Create MySQL database `taskly` and tables `users`, `todotasks` with fields mentioned above.
3) Verify connection in `backend/db.php` (default: host `localhost`, user `root`, empty password).
4) Test API in browser: `http://localhost/React/taskly/backend/getTasks.php?user_id=1` (should return JSON).

### Frontend
1) `cd React/taskly/frontend`
2) `npm install`
3) Set API base in `src/App.jsx` (recommended):
   ```js
   const API_BASE = `${window.location.origin}/React/taskly/backend/`;
   ```
4) `npm start` → open `http://localhost:3000`

Notes:
- If CRA build issues occur with React 19, use React 18: `npm i react@18.3.1 react-dom@18.3.1`.

---

## Features
- Authentication (login/signup)
- Create/Update tasks (modal)
- Inline status change (click badge → menu: Open, In Progress, On Hold, Cancelled, Completed)
  - Selecting “Completed” also sets `is_done = 1`; others set `is_done = 0`
- Mark Done/Open via checkbox
- Mark Important / Favorite
- Filters: All, Important, Favorites, Completed, Due Soon (next 7 days)
- Due Soon reminder: shows once after login if any tasks due today/tomorrow
- Admin panel: users + tasks view with filters and search debounce

### Date Handling
- Dates are stored and displayed as local `yyyy‑MM‑dd` (no UTC ISO) to avoid timezone shifts.

---

## API Quick Reference

Example request to change status:
```http
POST /React/taskly/backend/updateStatus.php
Content-Type: application/json

{
  "id": 123,
  "user_id": 1,
  "status": "In Progress",
  "is_done": 0
}
```
Successful responses include a message string (e.g., "updated"). After mutation, the frontend re-fetches `getTasks.php`.

---

## Demo Script (what to show)
1) Login → tasks load; if due today/tomorrow, the reminder modal appears once per login.
2) Create a task with start/due dates; verify date persists correctly and appears in the list.
3) Toggle Important/Favorite flags; show badge changes.
4) Change status via click dropdown; for Completed, the done checkbox becomes checked.
5) Toggle Done/Open via checkbox; status updates accordingly.
6) Open Admin panel → filter by Priority and search using the query box.

---

## Roadmap
- Browser notifications (Notification API) for due tasks
- Pagination and sorting for large lists
- Role-based authorization for admin endpoints
- Unit tests (React Testing Library) and API tests
- Migrate backend to Node/Express or Laravel as optional paths

