import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost/taskly/taskly/backend/';

export default function AdminPanel({ onClose }) {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [priorityFilter, setPriorityFilter] = useState("All");

  const filteredTasks = tasks.filter(t =>
    priorityFilter === "All" || t.priority === priorityFilter
  );

  const [itemsPerPage] = useState(5);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  // Fetch users
  useEffect(() => {
    fetch(`${API_BASE}getUsers.php`)
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setUsers(data) : setUsers([]))
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (q.trim() !== "") {
      const delayDebounce = setTimeout(() => {
        fetchTasks();
      }, 500); // wait 500ms after typing (debounce)

      return () => clearTimeout(delayDebounce);
    } else {
      fetchTasks(); // reload all tasks if search box is empty
    }
  }, [q]);

  const calculateDaysLeft = (dueDate) => {
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

  const fetchTasks = () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (status) qs.append('status', status);
    if (userId) qs.append('user_id', userId);
    if (q) qs.append('q', q);

    fetch(`${API_BASE}getTasksAdmin.php?` + qs.toString())
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setTasks(data) : setTasks([]))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // initial load

  return (
    <div className="container-fluid py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold"> Admin Dashboard</h3>
        <button className="btn btn-outline-dark" onClick={onClose}>Close</button>
      </div>

      <div className="row g-3 mb-4">
        {[
          { title: "Total Tasks", value: tasks.length, color: "primary" },
          { title: "Open", value: tasks.filter(t => t.status === "Open").length, color: "info" },
          { title: "In Progress", value: tasks.filter(t => t.status === "In Progress").length, color: "warning" },
          { title: "Completed", value: tasks.filter(t => t.status === "Completed").length, color: "success" }
        ].map((card, idx) => (
          <div className="col-md-3" key={idx}>
            <div className={`card text-center shadow-sm border-0 p-3 text-${card.color}`}
              style={{ transition: "transform 0.3s", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              <h6>{card.title}</h6>
              <h3 className="fw-bold">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>


      {/* Filters */}
      <div className="card shadow-sm border-0 p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold">User</label>
            <select className="form-select" value={userId} onChange={e => setUserId(e.target.value)}>
              <option value="">All Users</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label fw-semibold">Status</label>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label fw-semibold"> Priority:</label>
            <select
              className="form-select"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1); // reset to page 1 after filter change
              }}
            >
              <option value="All">All</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Search</label>
            <input
              className="form-control"
              placeholder="Title / Description"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className="btn btn-primary-taskly text-white w-100" onClick={fetchTasks} disabled={loading}>
              {loading ? 'Loading...' : 'Apply'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {filteredTasks.length === 0 ? (
            // <p className="text-muted p-3 text-center">No tasks found.</p>
            <div className="text-center py-5">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png"
                alt="Empty"
                width="100"
                className="mb-3"
              />
              <h5 className="fw-bold text-warning">Oops! Nothing here</h5>
              <p className="text-muted">Looks like you’ve completed everything 🎉</p>
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
                      <th>Flags</th>
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
                          <span className={`fw-semibold small 
                            ${calculateDaysLeft(t.due_date).includes("Overdue") ? "text-danger" : "text-success"}`}>
                            {calculateDaysLeft(t.due_date)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${t.priority === 'High' ? 'bg-danger' :
                            t.priority === 'Medium' ? 'bg-warning text-dark' :
                              'bg-secondary'}`}>
                            {t.priority || '-'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${t.status === 'Completed' ? 'bg-success' :
                            t.status === 'In Progress' ? 'bg-info text-dark' :
                              t.status === 'Open' ? 'bg-primary' :
                                'bg-secondary'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          {t.is_important && <span className="badge bg-danger me-1">Important</span>}
                          {t.is_favorite && <span className="badge bg-warning text-dark me-1">★ Fav</span>}
                          {t.is_done && <span className="badge bg-success">✓ Done</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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
          )}
        </div>
      </div>

    </div>
  );
}
