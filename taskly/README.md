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

## Live Demo Script (10–12 minutes)

- Prep (before you start sharing)
  - Start Apache + MySQL in XAMPP.
  - Open the backend test URL in a tab: `http://localhost/React/taskly/backend/getTasks.php?user_id=1` (to prove API works).
  - In another terminal: `cd C:\xampp\htdocs\React\taskly\frontend && npm start`.
  - App URL ready: `http://localhost:3000`.

### 1) Introduce the app (1 min)
- “Taskly is a React + PHP/MySQL task manager.”
- “Frontend is React with Bootstrap; backend is PHP endpoints on XAMPP; MySQL stores users and tasks.”
- “You’ll see login, create task, inline status updates, due reminders, and an admin view.”

### 2) Login and data fetch (1 min)
- Navigate to `http://localhost:3000`.
- Log in with an existing account (or sign up quickly if needed).
- Say: “On login, the app fetches tasks via `getTasks.php?user_id=<id>`; this drives the UI.”

Expected: Task list appears. If tasks due today/tomorrow exist, a due reminder modal opens once.

### 3) Due reminder (30 sec)
- If the modal appears: “This shows tasks due today or tomorrow; it’s presented once per login.”
- Click Dismiss. Note: “It won’t reappear until next login.”

If no due tasks: say “If tasks were due today/tomorrow, you’d see the reminder here.”

### 4) Create a task (2 min)
- Click “Add” (or your Create button).
- In the modal:
  - Title: “Prepare sprint review”
  - Description: “Slides + live demo”
  - Start Date: pick today
  - Due Date: pick tomorrow
  - Priority: High
  - Status: Open
- Submit.

Expected: New card appears with correct dates (no off-by-one). Say: “Dates are stored/displayed as local yyyy-MM-dd to avoid timezone shifts.”

Optional: Show network tab request to `addTask.php`, then `getTasks.php` re-fetch.

### 5) Inline status change (1.5 min)
- On the new card, click the status badge (e.g., “Open”).
- The click menu opens; pick “In Progress”.

Expected: Status updates; list re-fetches. Say: “This hits `updateStatus.php` with `{ status, is_done }`. If I choose Completed, it also sets `is_done = 1`.”

- Click again → choose “Completed”. Checkbox becomes checked.

### 6) Done/Open checkbox (30 sec)
- Uncheck the Done checkbox.

Expected: Status flips back to “Open” via `updateStatus.php`. Mention confirmation prompts if any.

### 7) Flags: Important & Favorite (30 sec)
- Click the star icon (Important) → toggles color.
- Click the heart icon (Favorite) → toggles color.

Say: “These call `toggleImportant.php` and `toggleFavorite.php` and then re-fetch.”

### 8) Filters (45 sec)
- Use the sidebar filters:
  - “Important” → shows important tasks
  - “Favorites” → favorites
  - “Completed” → tasks with `is_done=1`
  - “Due Soon” → tasks due within 7 days

Say: “Filtering is client-side; ‘Due Soon’ checks the date range.”

### 9) Admin panel (1.5 min)
- Open Admin panel (button in header).
- Show:
  - Users list (top)
  - Tasks table with pagination
  - Filter by priority
  - Type in search field and pause → debounce triggers `getTasksAdmin.php?q=...`

Say: “Admin endpoint joins `todotasks` and `users` for management views.”

### 10) Quick architecture slide (talk track, 1 min)
- “Frontend React SPA, calls PHP endpoints.”
- “PHP talks to MySQL and returns JSON.”
- “State flows: after any mutation, we re-fetch tasks to keep UI in sync.”
- “Why React: component model, ecosystem (datepicker, Bootstrap), SPA UX, quick iteration vs jQuery/Angular overhead.”

### 11) Troubleshooting talking points (30 sec)
- If errors connecting: confirm API base is `${window.location.origin}/React/taskly/backend/`.
- If CRA fails: use React 18 (`npm i react@18.3.1 react-dom@18.3.1`).
- If dates slip: confirm local date formatter is used (CreateTaskForm).

### 12) Close (15 sec)
- “Taskly demonstrates a clean split: React UI, PHP+MySQL backend. Inline UX (status menu, flags), correct date handling, and a login-driven due reminder.”

#### Optional deep-dive (if asked)
- Show `src/App.jsx` handlers: `handleChangeStatus`, `handleDoneTask`.
- Show `backend/updateStatus.php` parameter contract.
- Show `CreateTaskForm.jsx` local date formatting (`yyyy-MM-dd`).

#### Cheat sheet for endpoints (show if asked)
- Read: `GET getTasks.php?user_id=<id>`
- Create: `POST addTask.php`
- Update: `POST updateTask.php`
- Status: `POST updateStatus.php`
- Delete: `POST deleteTask.php`
- Flags: `POST toggleFavorite.php`, `POST toggleImportant.php`
- Admin: `GET getTasksAdmin.php?[status]&[user_id]&[q]`

