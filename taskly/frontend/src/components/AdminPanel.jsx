import React, { useEffect, useState } from 'react';
import Filters from './Filters';

// Animated Counter Component
const AnimatedCounter = ({ target, duration = 1000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return <span>{count}</span>;
};

const API_BASE = process.env.REACT_APP_API_URL;

export default function AdminPanel({ 
  onClose, 
  role = "admin",
  activeTab,
  setActiveTab,
  tasks,
  users,
  allTasks,
  loading,
  handleApplyFilters
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ priority: '', due_date: '' });

  // Priority filtering is now handled by backend, so use all tasks
  const filteredTasks = tasks;

  const [itemsPerPage] = useState(5);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  const fetchUsers = () => {
    fetch(`${API_BASE}getUsers.php`)
      .then(r => r.json())
      .then(data => {
        console.log('Users data:', data);
      })
      .catch(() => {});
  };



  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This will delete the user and all their tasks.')) return;

    try {
      const response = await fetch(`${API_BASE}deleteUser.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId })
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = JSON.parse(responseText);

      if (result.success) {
        fetchUsers();
        alert('User deleted successfully!');
      } else {
        alert(result.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  };

  const calculateDaysLeft = (dueDate, isCompleted = false) => {
    if (isCompleted) return "Completed ✓";
    if (!dueDate) return '';
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
    if (diffDays === 0) return "Due today";
    return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditForm({ priority: task.priority || '', due_date: task.due_date || '' });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`${API_BASE}updateTaskAdmin.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: editingTask.id,
          priority: editForm.priority,
          due_date: editForm.due_date,
          user_id: editingTask.user_id,
          old_priority: editingTask.priority,
          old_due_date: editingTask.due_date
        })
      });
      const result = await response.json();
      if (result.success) {
        alert('Task updated and user notified!');
        setEditingTask(null);
        // Refresh tasks by calling the parent's refresh function
        window.location.reload(); // Simple refresh for now
      } else {
        alert(result.message || 'Failed to update task');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };





  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3   rounded">
        <h3 className="mb-0">🛠️ Admin Dashboard</h3>
        <button className="btn btn-outline-secondary btn-light" onClick={onClose}>
          ← Back to Tasks
        </button>
      </div>

      <div className="px-4">





        {activeTab === 'tasks' && (
          <Filters users={users} loading={loading} onApply={handleApplyFilters} />
        )}

        {activeTab === 'users' && (
          <div className="mb-3">
            <h5 className="mb-0">User Management</h5>
          </div>
        )}

        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            {activeTab === 'tasks' ? (
              loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading tasks...</p>
                </div>
              ) : currentTasks.length === 0 ? (
                <div className="text-center py-5">
                  <img src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png" alt="Empty" width="100" className="mb-3" />
                  <h5 className="fw-bold text-warning">Oops! Nothing here</h5>
                  <p className="text-muted">Looks like you've completed everything 🎉</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>User</th>
                          <th>Title</th>
                          <th>Due</th>
                          <th>Days Left</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTasks.map(t => (
                          <tr key={t.id}>
                            <td>
                              <small>{t.user_name} <br />
                                <span className="text-muted">{t.user_email}</span>
                              </small>
                            </td>
                            <td>{t.title}</td>
                            <td><span className="text-muted small">{t.due_date || '-'}</span></td>
                            <td>
                              <span className={`fw-semibold small ${t.status === 'Completed' ? "text-success" :
                                calculateDaysLeft(t.due_date).includes("Overdue") ? "text-danger" : "text-success"
                                }`}>
                                {calculateDaysLeft(t.due_date, t.status === 'Completed')}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${t.priority?.toLowerCase() === 'urgent' ? 'bg-danger' :
                                t.priority?.toLowerCase() === 'high' ? 'bg-warning text-dark' :
                                  t.priority?.toLowerCase() === 'medium' ? 'bg-success' :
                                    t.priority?.toLowerCase() === 'low' ? 'bg-secondary' : 'bg-light text-dark'
                                }`}>
                                {t.priority || '-'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${t.status === 'Completed' ? 'bg-success' : t.status === 'In Progress' ? 'bg-info text-dark' : t.status === 'Open' ? 'bg-primary' : 'bg-secondary'}`}>
                                {t.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditTask(t)}
                                title="Edit Task"
                              >
                                ✏️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <nav className="p-3">
                    <ul className="pagination justify-content-end mb-0">
                      <li className={`page-item ${currentPage === 1 && 'disabled'}`}>
                        <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 && 'active'}`}>
                          <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages && 'disabled'}`}>
                        <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                      </li>
                    </ul>
                  </nav>
                </>
              )
            ) : (
              users.length === 0 ? (
                <div className="text-center py-5">
                  <img src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" alt="No Users" width="100" className="mb-3" />
                  <h5 className="fw-bold text-info">No Users Found</h5>
                  <p className="text-muted">Start by adding your first user</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td className="fw-semibold">{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete User"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>

        {/* Edit Task Modal */}
        {editingTask && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Task: {editingTask.title}</h5>
                  <button className="btn-close" onClick={() => setEditingTask(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    >
                      <option value="">Select Priority</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editForm.due_date}
                      onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setEditingTask(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}