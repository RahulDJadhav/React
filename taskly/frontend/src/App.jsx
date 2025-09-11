import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import CreateTaskForm from './components/CreateTaskForm';
import './App.css';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import DueSoonModal from './components/DueSoonModal';


const App = () => {

  const API_BASE = 'http://localhost/taskly/taskly/backend/';
  // tasks: Array holding all todo tasks
  const [tasks, setTasks] = useState([]);
  const [dueSoonTasks, setDueSoonTasks] = useState([]);
  const [showDueModal, setShowDueModal] = useState(false);
  const [hasShownDueModal, setHasShownDueModal] = useState(false);

  // editingTask: Holds the task being edited (for the modal).
  const [editingTask, setEditingTask] = useState(null);

  // successMessage: Stores a message to show after actions (add, edit, delete, done).
  const [successMessage, setSuccessMessage] = useState('');

  // formRef: Reference to control the Create/Edit Task modal.
  const formRef = useRef();

  // isLoggedIn: Tracks if the user is logged in.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const [showAdmin, setShowAdmin] = useState(false);
  const isAdmin = localStorage.getItem('userRole') === 'admin';

  // Reset due modal state on login changes
  useEffect(() => {
    if (isLoggedIn) {
      setHasShownDueModal(false);
    } else {
      setShowDueModal(false);
      setHasShownDueModal(false);
    }
  }, [isLoggedIn]);

  // Fetch tasks for the logged-in user
  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      fetch(`${API_BASE}getTasks.php?user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
          if (Array.isArray(data)) {
            setTasks(data);
          } else {
            console.error("Expected array but got:", data);
            setTasks([]);
          }
        })
        .catch(error => {
          console.error("Fetch failed:", error);
          setTasks([]);
        });
    } else {
      // If no user is logged in, clear tasks
      setTasks([]);
    }
  }, [isLoggedIn]); // Re-fetch when login status changes

  // Compute and show due-soon modal (today or tomorrow, not done). Only once per login.
  useEffect(() => {
    if (!isLoggedIn || hasShownDueModal) {
      return;
    }
    if (!tasks || tasks.length === 0) {
      setDueSoonTasks([]);
      setShowDueModal(false);
      setHasShownDueModal(true); // consume for this login regardless
      return;
    }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    const filtered = tasks.filter(t => {
      if (!t.due_date) return false;
      if (Number(t.is_done) === 1) return false;
      const due = new Date(t.due_date); due.setHours(0, 0, 0, 0);
      const isToday = due.getTime() === today.getTime();
      const isTomorrow = due.getTime() === tomorrow.getTime();
      return isToday || isTomorrow;
    });

    setDueSoonTasks(filtered);
    setShowDueModal(filtered.length > 0);
    setHasShownDueModal(true); // ensure it won't show again until next login
  }, [tasks, isLoggedIn, hasShownDueModal]);

  const handleDismissDueModal = () => {
    setShowDueModal(false);
  };

  const handleAddTask = (newTask) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to add tasks.");
      return;
    }

    const taskWithDefaults = {
      ...newTask,
      due_date: newTask.dueDate, // Ensure snake_case for backend
      is_important: false,
      is_favorite: false,
      is_done: false,
      user_id: userId // Always include user_id
    };

    fetch(`${API_BASE}addTask.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskWithDefaults)
    })
      .then(response => response.json()) // Parse response as JSON
      .then(data => {
        if (data.message && data.message.includes("successfully")) {
          // Re-fetch tasks only on success
          const currentUserId = localStorage.getItem("userId");
          fetch(`${API_BASE}getTasks.php?user_id=${currentUserId}`)
            .then(res => res.json())
            .then(data => {
              setTasks(data);
              setSuccessMessage("Task Created Successfully!");
              setTimeout(() => setSuccessMessage(""), 1000);
            });
        } else if (data.error) {
          console.error("Server Error:", data.error);
          alert(`Error: ${data.error}`);
        } else {
          console.error("Server Error:", data.message || JSON.stringify(data));
          alert(`Error: ${data.message || JSON.stringify(data)}`);
        }
      })
      .catch(error => {
        console.error("Error adding task:", error);
        alert("Something went wrong while adding the task.");
      });
  };

  // UPDATE
  const handleUpdateTask = async (updatedTask) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to update tasks.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}updateTask.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...updatedTask,
          user_id: userId
        })
      });

      const result = await res.json();

      if (result.message && result.message.toLowerCase().includes("success")) {
        // Refresh the task list
        const currentUserId = localStorage.getItem("userId");
        const taskRes = await fetch(`${API_BASE}getTasks.php?user_id=${currentUserId}`);
        const data = await taskRes.json();
        setTasks(data);
        setSuccessMessage("Task updated successfully!");
        setTimeout(() => setSuccessMessage(""), 1000);
      } else {
        alert("Something went wrong: " + result.message);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Something went wrong while updating the task.");
    }
  };

  // DELETE
  const handleDeleteTask = async (id) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to delete tasks.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`${API_BASE}deleteTask.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, user_id: userId })
      });

      const result = await res.json();

      if (result.message && result.message.toLowerCase().includes("success")) {
        // Refresh the task list
        const currentUserId = localStorage.getItem("userId");
        const taskRes = await fetch(`${API_BASE}getTasks.php?user_id=${currentUserId}`);
        const data = await taskRes.json();
        setTasks(data);
        setSuccessMessage("Task deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 1000);
      } else {
        alert("Something went wrong: " + result.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong while deleting the task.");
    }
  };


  // EDIT: Open modal with task data
  const handleEditTask = (task) => {
    setEditingTask(task);
    formRef.current.openModal(task);
  };

  // When creating, open modal with no task
  const handleOpenCreate = () => {
    setEditingTask(null);
    formRef.current.openModal();
  };

  //Done
  const handleDoneTask = async (id, isCurrentlyDone) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to update task status.");
      return;
    }

    const newDoneStatus = Number(isCurrentlyDone) === 1 ? 0 : 1;
    const newStatus = newDoneStatus === 1 ? 'Completed' : 'Open';

    const confirmMessage = newDoneStatus === 1
      ? "Are you sure you want to mark this task as Completed?"
      : "Are you sure you want to mark this task as Open?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}updateStatus.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_done: newDoneStatus, status: newStatus, user_id: userId })
      });

      const result = await res.json();

      if (result.message && result.message.toLowerCase().includes("updated")) {
        const currentUserId = localStorage.getItem("userId");
        const taskRes = await fetch(`${API_BASE}getTasks.php?user_id=${currentUserId}`);
        const data = await taskRes.json();
        setTasks(data);
        setSuccessMessage("Task status updated successfully!");
        setTimeout(() => setSuccessMessage(""), 1000);
      } else {
        alert("Something went wrong: " + result.message);
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert("Something went wrong while updating the status.");
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (id, currentValue) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to update favorite status.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}toggleFavorite.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, user_id: userId, is_favorite: currentValue ? 0 : 1 })
      });
      const result = await res.json();

      if (result.message && result.message.toLowerCase().includes("updated")) {
        const currentUserId = localStorage.getItem("userId");
        const taskRes = await fetch(`${API_BASE}getTasks.php?user_id=${currentUserId}`);
        const data = await taskRes.json();
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Important
  const handleToggleImportant = async (id, currentValue) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to update important status.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}toggleImportant.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, user_id: userId, is_important: currentValue ? 0 : 1 })
      });
      const result = await res.json();

      if (result.message && result.message.toLowerCase().includes("updated")) {
        const currentUserId = localStorage.getItem("userId");
        const taskRes = await fetch(`${API_BASE}getTasks.php?user_id=${currentUserId}`);
        const data = await taskRes.json();
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    // Optional: clear success message when filter changes
    setSuccessMessage('');
  };

  // Change status directly from card
  const handleChangeStatus = async (task, newStatus) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to update task status.");
      return;
    }

    const newDone = newStatus === 'Completed' ? 1 : 0;

    try {
      const res = await fetch(`${API_BASE}updateStatus.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, is_done: newDone, status: newStatus, user_id: userId })
      });
      const result = await res.json();
      if (result.message && result.message.toLowerCase().includes("updated")) {
        const currentUserId = localStorage.getItem("userId");
        const taskRes = await fetch(`${API_BASE}getTasks.php?user_id=${currentUserId}`);
        const data = await taskRes.json();
        setTasks(data);
      } else {
        alert("Something went wrong: " + result.message);
      }
    } catch (error) {
      console.error("Status change error:", error);
      alert("Something went wrong while changing the status.");
    }
  };

  // Calculate dynamic counts for TaskFilterCard

  const allTasksCount = tasks.length;
  const importantTasksCount = tasks.filter(task => task.is_important).length;
  const favoritesCount = tasks.filter(task => task.is_favorite).length;
  const doneTasksCount = tasks.filter(task => task.is_done).length;
  const dueSoonTasksCount = tasks.filter(task => {
    if (!task.due_date || task.is_done) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999);
    const taskDueDate = new Date(task.due_date);
    taskDueDate.setHours(0, 0, 0, 0);
    return taskDueDate >= today && taskDueDate <= sevenDaysFromNow;
  }).length;

  const taskCounts = {
    "All": allTasksCount,
    "Important": importantTasksCount,
    "Favorites": favoritesCount,
    "Completed": doneTasksCount,
    "Due Soon": dueSoonTasksCount,
  };


  // Purpose: If the user is not logged in, show the login page.
  // After login: The main app is rendered.
  useEffect(() => {
    const checkLoggedIn = () => {
      if (localStorage.getItem("userId")) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };
    checkLoggedIn();

    // Listen for storage changes from other tabs/windows if needed
    window.addEventListener('storage', checkLoggedIn);
    return () => {
      window.removeEventListener('storage', checkLoggedIn);
    };
  }, []);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }
  return (
    <div className="d-flex flex-column body" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header onAddClick={handleOpenCreate} onLogout={() => setIsLoggedIn(false)} tasks={tasks} onOpenAdmin={() => setShowAdmin(true)} />

      {/* Body: Sidebar + Content */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <div className="col-md-2 p-3">
          <Sidebar
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            taskCounts={taskCounts}
            showAdminPanel={showAdmin}
          />
        </div>

        {/* Main Content */}
        <div className="col-md-10 p-4">
          <div className="row mb-3">
            <div className="col">
              {successMessage && (
                <div className="taskSuccess">
                  {successMessage}
                </div>

              )}
              {showDueModal && (
                <DueSoonModal tasks={dueSoonTasks} onClose={handleDismissDueModal} />
              )}
              {isAdmin && showAdmin ? (
                <AdminPanel onClose={() => setShowAdmin(false)} />
              ) : (
                <MainContent
                  tasks={tasks}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                  onDone={handleDoneTask}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleImportant={handleToggleImportant}
                  activeFilter={activeFilter}
                  onChangeStatus={handleChangeStatus}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Create Task Modal */}
      <CreateTaskForm
        ref={formRef}
        onSubmit={handleAddTask}
        onUpdate={handleUpdateTask}
        editingTask={editingTask}
      />
    </div>
  );
};

export default App;
