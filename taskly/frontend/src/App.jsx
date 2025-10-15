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

  // const API_BASE = 'http://localhost/taskly/taskly/backend/';
  const API_BASE = process.env.REACT_APP_API_URL;
  // tasks: Array holding all todo tasks
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [dueSoonTasks, setDueSoonTasks] = useState([]);
  const [showDueModal, setShowDueModal] = useState(false);
  const [hasShownDueModal, setHasShownDueModal] = useState(false);

  // editingTask: Holds the task being edited (for the modal).
  const [editingTask, setEditingTask] = useState(null);

  // successMessage: Stores a message to show after actions (add, edit, delete, done).
  const [successMessage, setSuccessMessage] = useState('');

  // formRef: Reference to control the Create/Edit Task modal.
  const formRef = useRef();

  // User state management
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [activeFilter, setActiveFilter] = useState('All');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const [showAdmin, setShowAdmin] = useState(false);
  const isAdmin = user?.role === 'admin';
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [lastNotificationId, setLastNotificationId] = useState(null);

  // Add currentUserId state
  const currentUserId = user?.id || '';





  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('taskly_user');
    const savedActivity = localStorage.getItem('taskly_last_activity');
    
    if (savedUser && savedActivity) {
      const timeDiff = Date.now() - parseInt(savedActivity);
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
      
      if (timeDiff < oneHour) {
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
        setLastActivity(Date.now());
      } else {
        localStorage.removeItem('taskly_user');
        localStorage.removeItem('taskly_last_activity');
      }
    }
  }, []);

  // Track user activity and auto-logout
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const updateActivity = () => {
      const now = Date.now();
      setLastActivity(now);
      localStorage.setItem('taskly_last_activity', now.toString());
    };
    
    const checkInactivity = () => {
      const timeDiff = Date.now() - lastActivity;
      const oneHour = 60 * 60 * 1000;
      
      if (timeDiff >= oneHour) {
        handleLogout();
        alert('Session expired due to inactivity. Please login again.');
      }
    };
    
    // Update activity on user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });
    
    // Check inactivity every minute
    const inactivityCheck = setInterval(checkInactivity, 60000);
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(inactivityCheck);
    };
  }, [isLoggedIn, lastActivity]);

  // Reset due modal state on login changes
  useEffect(() => {
    if (isLoggedIn) {
      setHasShownDueModal(false);
    } else {
      setShowDueModal(false);
      setHasShownDueModal(false);
    }
  }, [isLoggedIn]);

  // Check for notifications
  useEffect(() => {
    if (user?.id) {
      const checkNotifications = () => {
        fetch(`${API_BASE}getUserNotifications.php?user_id=${user.id}`)
          .then(r => r.json())
          .then(data => {
            if (data && data.message && data.timestamp !== lastNotificationId) {
              setNotificationMessage(data.message);
              setShowNotificationPopup(true);
              setLastNotificationId(data.timestamp);
            }
          })
          .catch(() => {});
      };
      
      checkNotifications();
      const interval = setInterval(checkNotifications, 3000); // Check every 3 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch tasks for the logged-in user
  useEffect(() => {
    if (user?.id) {
      setIsLoadingTasks(true);
      fetch(`${API_BASE}getTasks.php?user_id=${user.id}`)
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
        })
        .finally(() => {
          setIsLoadingTasks(false);
        });
    } else {
      // If no user is logged in, clear tasks
      setTasks([]);
      setIsLoadingTasks(false);
    }
  }, [user]); // Re-fetch when user changes

  // Compute and show due-soon modal (today or tomorrow, not done). Only once per login.
  useEffect(() => {
    if (!isLoggedIn || hasShownDueModal) {
      return;
    }
    if (!tasks || tasks.length === 0) {
      // Don't mark as shown if tasks haven't loaded yet
      return;
    }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    const filtered = tasks.filter(t => {
      if (!t.due_date) return false;
      if (t.is_done == 1) return false;
      if (t.status === 'Cancelled') return false;
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
    if (!user?.id) {
      alert("Please log in to add tasks.");
      return;
    }

    const taskWithDefaults = {
      ...newTask,
      due_date: newTask.dueDate, // Ensure snake_case for backend
      is_important: false,
      is_favorite: false,
      is_done: false,
      user_id: user.id // Always include user_id
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
          fetch(`${API_BASE}getTasks.php?user_id=${user.id}`)
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
    if (!user?.id) {
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
          user_id: user.id
        })
      });

      const result = await res.json();

      if (result.message && result.message.toLowerCase().includes("success")) {
        // Refresh the task list
        const taskRes = await fetch(`${API_BASE}getTasks.php?user_id=${user.id}`);
        const data = await taskRes.json();
        setTasks(Array.isArray(data) ? data : []);
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
    if (!user?.id) {
      alert("Please log in to delete tasks.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`${API_BASE}deleteTask.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, user_id: user.id })
      });

      const result = await res.json();

      if (result.message && result.message.toLowerCase().includes("success")) {
        // Refresh the task list
        const taskRes = await fetch(`${API_BASE}getTasks.php?user_id=${user.id}`);
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
    if (!user?.id) {
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
        body: JSON.stringify({ id, is_done: newDoneStatus, status: newStatus, user_id: user.id })
      });

      const result = await res.json();

      if (result.message && result.message.toLowerCase().includes("updated")) {
        const taskRes = await fetch(`${API_BASE}getTasks.php?user_id=${user.id}`);
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
    if (!user?.id) {
      alert("Please log in to update favorite status.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}toggleFavorite.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, user_id: user.id, is_favorite: currentValue ? 0 : 1 })
      });
      const result = await res.json();

      if (result.message && result.message.toLowerCase().includes("updated")) {
        const taskRes = await fetch(`${API_BASE}getTasks.php?user_id=${user.id}`);
        const data = await taskRes.json();
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Important
  const handleToggleImportant = async (id, currentValue) => {
    if (!user?.id) {
      alert("Please log in to update important status.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}toggleImportant.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, user_id: user.id, is_important: currentValue ? 0 : 1 })
      });
      const result = await res.json();

      if (result.message && result.message.toLowerCase().includes("updated")) {
        const taskRes = await fetch(`${API_BASE}getTasks.php?user_id=${user.id}`);
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
    if (!user?.id) {
      alert("Please log in to update task status.");
      return;
    }

    const newDone = newStatus === 'Completed' ? 1 : 0;

    try {
      const res = await fetch(`${API_BASE}updateStatus.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, is_done: newDone, status: newStatus, user_id: user.id })
      });
      const result = await res.json();
      if (result.message && result.message.toLowerCase().includes("updated")) {
        const taskRes = await fetch(`${API_BASE}getTasks.php?user_id=${user.id}`);
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
  const importantTasksCount = tasks.filter(task => task.is_important == 1).length;
  const favoritesCount = tasks.filter(task => task.is_favorite == 1).length;
  const doneTasksCount = tasks.filter(task => task.is_done == 1).length;
  const cancelledTaskCount = tasks.filter(task => task.status === 'Cancelled').length;
  const onHoldTaskCount = tasks.filter(task => task.status === 'On Hold').length;
  const inProgressTasksCount = tasks.filter(task => task.status === 'In Progress').length;
  const openTasksCount = tasks.filter(task => task.status === 'Open').length;
  const dueSoonTasksCount = tasks.filter(task => {
    if (!task.due_date || task.is_done == 1 || task.status === 'Cancelled') return false;
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
    "Cancelled": cancelledTaskCount,
    "On Hold": onHoldTaskCount,
    "In Progress": inProgressTasksCount,
    "Open": openTasksCount
  };


  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setLastActivity(Date.now());
    localStorage.setItem('taskly_user', JSON.stringify(userData));
    localStorage.setItem('taskly_last_activity', Date.now().toString());
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setTasks([]);
    setShowAdmin(false);
    localStorage.removeItem('taskly_user');
    localStorage.removeItem('taskly_last_activity');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }
  return (
    <div className="d-flex flex-column body" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header
        onAddClick={handleOpenCreate}
        onLogout={handleLogout}
        tasks={tasks}
        onOpenAdmin={() => setShowAdmin(true)}
        onGlobalSearch={setGlobalSearchQuery}
        user={user}
      />

      {/* Body: Sidebar + Content */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <div className="col-md-2 p-3">
          <Sidebar
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            taskCounts={taskCounts}
            showAdminPanel={showAdmin}
            user={user}
            onUserUpdate={handleUserUpdate}
          />
        </div>

        {/* Main Content */}
        <div className="col-md-10 p-4">
          <div className="row mb-3">
            <div className="col">
              {successMessage && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  <div className="rounded-4 shadow-lg p-5 text-center text-white" style={{
                    minWidth: '350px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    animation: 'fadeIn 0.3s ease-in',
                    border: '3px solid rgba(255,255,255,0.2)'
                  }}>
                    <div className="mb-3" style={{ color: '#90EE90' }}>
                      <i className="fas fa-check-circle" style={{ fontSize: '4rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}></i>
                    </div>
                    <h4 className="mb-3" style={{ fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Success!</h4>
                    <p className="mb-0" style={{ fontSize: '1.1rem', opacity: '0.9' }}>{successMessage}</p>
                  </div>
                </div>
              )}
              {showNotificationPopup && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  <div className="rounded-4 shadow-lg p-4 text-center text-white position-relative" style={{
                    minWidth: '400px',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                    animation: 'fadeIn 0.3s ease-in',
                    border: '3px solid rgba(255,255,255,0.2)'
                  }}>
                    <button 
                      className="btn-close btn-close-white position-absolute" 
                      style={{ top: '15px', right: '15px' }}
                      onClick={() => setShowNotificationPopup(false)}
                    ></button>
                    <div className="mb-3" style={{ color: '#fff' }}>
                      <i className="fas fa-bell" style={{ fontSize: '3rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}></i>
                    </div>
                    <h5 className="mb-3" style={{ fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Admin Notification</h5>
                    <p className="mb-3" style={{ fontSize: '1rem', opacity: '0.9' }}>{notificationMessage}</p>
                    <button 
                      className="btn btn-light btn-sm" 
                      onClick={() => setShowNotificationPopup(false)}
                    >
                      Got it!
                    </button>
                  </div>
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
                  currentUserId={currentUserId}
                  globalSearchQuery={globalSearchQuery}
                  isLoadingTasks={isLoadingTasks}
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
