import React, { useState } from 'react';

export default function Filters({ users = [], onApply, loading, showUserFilter = true }) {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [q, setQ] = useState('');

  const handleApply = () => {
    if (onApply) {
      onApply({ userId, status, priorityFilter, q });
    }
  };

  return (
    <div className="card shadow-sm border-0 p-3 mb-4">
      <div className="row g-3">
        {showUserFilter && (
          <div className="col-md-3">
            <label className="form-label fw-semibold">User</label>
            <select className="form-select" value={userId} onChange={e => setUserId(e.target.value)}>
              <option value="">All Users</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
        )}
        <div className={showUserFilter ? "col-md-2" : "col-md-3"}>
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
            onChange={e => setPriorityFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className={showUserFilter ? "col-md-3" : "col-md-4"}>
          <label className="form-label fw-semibold">Search</label>
          <input
            className="form-control"
            placeholder="Title / Description"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button className="btn btn-primary-taskly text-white w-100" onClick={handleApply} disabled={loading}>
            {loading ? 'Loading...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
