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



## Getting Started Guide (User & Admin)

This guide explains how to use Taskly as a regular User and as an Admin.

### A) User Guide

1) Sign Up / Login
- Open the app: `http://localhost:3000`.
- New user: click Create a new account, fill Username, email, password.
- Existing user: enter email and password to log in.

2) Home Dashboard
- After login, your tasks appear in a list.
- If you have tasks due today or tomorrow, a reminder modal will show once per login.

3) Create a Task
- Click the Add button (usually in the header).
- Fill in:
  - Title (required)
  - Description (optional)
  - Start Date (required)
  - Due Date (required)
  - Priority (Low / Medium / High / Urgent)
  - Status (Open / In Progress / On Hold / Cancelled / Completed)
- Click Create. The new task appears in the list.

4) Update a Task
- From the task’s action menu (ellipsis), click Edit.
- Change fields as needed and save.
- Tip: Dates are stored/displayed as local yyyy-MM-dd to avoid timezone issues.

5) Change Status Inline (No Edit Needed)
- Click the status badge on the task card.
- Choose a status (Open, In Progress, On Hold, Cancelled, Completed).
- If you select Completed, the task’s Done checkbox is also set.

6) Mark Done / Reopen Quickly
- Toggle the checkbox at the start of the row.
- Checked = Done (status becomes Completed), Unchecked = Open.

7) Mark Favorite / Important
- Click the heart (Favorite) or star (Important) icons to toggle.
- These flags help organize and filter tasks.

8) Filters
- Use the sidebar to filter your list:
  - All: all active tasks
  - Important: tasks with the star flag
  - Favorites: tasks with the heart flag
  - Completed: tasks with Done = 1
  - Due Soon: tasks due in the next 7 days

9) Delete a Task
- From the action menu (ellipsis), click Delete.
- Confirm to remove the task.

10) Logout
- Use the header logout button to end your session.

### B) Admin Guide

1) Open Admin Panel
- After login (with an admin role), click the Admin button in the header.
- The Admin Dashboard opens in an overlay.

2) Users List
- Top section shows registered users (name and email).

3) Tasks Table
- Shows all tasks with columns: User, Title, Due, Days Left, Priority, Status, Flags.
- Pagination controls at the bottom.

4) Filters and Search
- Filter by Priority or Status.
- Filter by User.
- Search box supports text search across title/description.
- Debounced search (wait a moment after typing to trigger).

5) Data Source
- The admin view uses `getTasksAdmin.php` with optional query parameters: `status`, `user_id`, `q`.

6) Close Admin Panel
- Click Close to return to the main app.

### Tips & Troubleshooting
- API Base: Ensure `API_BASE` in `src/App.jsx` matches your server path. Recommended:
  ```js
  const API_BASE = `${window.location.origin}/React/taskly/backend/`;
  ```
- XAMPP: Apache and MySQL must be running.
- Backend test: Open `http://localhost/React/taskly/backend/getTasks.php?user_id=1` to verify JSON.
- CRA issues: If React 19 causes build errors, install React 18:
  ```bash
  npm i react@18.3.1 react-dom@18.3.1
  ```
- Dates: The app formats dates in local `yyyy-MM-dd` to avoid timezone shifts.

