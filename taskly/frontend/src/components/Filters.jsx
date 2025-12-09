import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faChevronDown, faChevronUp, faTimes, faClock, faCalendarDay, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function Filters({ users = [], onApply, loading, showUserFilter = true }) {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [q, setQ] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);


  const handleApply = () => {
    if (onApply) {
      onApply({ userId, status, priorityFilter, q });
    }
  };

  const handleClearAll = () => {
    setUserId('');
    setStatus('');
    setPriorityFilter('All');
    setQ('');
    onApply({ userId: '', status: '', priorityFilter: 'All', q: '' });
  };

  const handleQuickFilter = (type) => {
    const today = new Date().toISOString().split('T')[0];

    // Clear other filters and set specific filter based on type
    let filters = { userId: '', status: '', priorityFilter: 'All', q: '' };

    switch (type) {
      case 'today':
        filters.q = `due_date:${today}`;
        break;
      case 'week':
        // Get start and end of current week
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const startStr = startOfWeek.toISOString().split('T')[0];
        const endStr = endOfWeek.toISOString().split('T')[0];
        filters.q = `week:${startStr} to ${endStr}`;
        break;
      case 'overdue':
        filters.status = 'Open'; // Only show open overdue tasks
        filters.q = `overdue:${today}`;
        break;
      default:
        break;
    }

    // Update state
    setUserId(filters.userId);
    setStatus(filters.status);
    setPriorityFilter(filters.priorityFilter);
    setQ(filters.q);

    // Apply filters
    onApply(filters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (userId) count++;
    if (status) count++;
    if (priorityFilter !== 'All') count++;
    if (q) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="mb-4">
      {/* Modern Filter Header */}
      <div className="card shadow-sm border-0 mb-3" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="card-body p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-light d-flex align-items-center gap-2 fw-semibold"
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{ borderRadius: '25px', padding: '8px 16px' }}
              >
                <FontAwesomeIcon icon={faFilter} className="text-primary" />
                <span className="text-dark">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="badge bg-primary rounded-pill">{activeFiltersCount}</span>
                )}
                <FontAwesomeIcon icon={isCollapsed ? faChevronDown : faChevronUp} size="sm" className="text-muted" />
              </button>

              {/* Quick Filter Pills */}
              <div className="d-flex gap-2">
                <button
                  className="btn btn-light btn-sm d-flex align-items-center gap-1 fw-semibold"
                  onClick={() => handleQuickFilter('today')}
                  style={{ borderRadius: '20px', padding: '6px 12px' }}
                >
                  <FontAwesomeIcon icon={faCalendarDay} size="sm" className="text-info" />
                  <span className="text-dark">Today</span>
                </button>
                <button
                  className="btn btn-light btn-sm d-flex align-items-center gap-1 fw-semibold"
                  onClick={() => handleQuickFilter('week')}
                  style={{ borderRadius: '20px', padding: '6px 12px' }}
                >
                  <FontAwesomeIcon icon={faClock} size="sm" className="text-warning" />
                  <span className="text-dark">This Week</span>
                </button>
                <button
                  className="btn btn-light btn-sm d-flex align-items-center gap-1 fw-semibold"
                  onClick={() => handleQuickFilter('overdue')}
                  style={{ borderRadius: '20px', padding: '6px 12px' }}
                >
                  <FontAwesomeIcon icon={faExclamationTriangle} size="sm" className="text-danger" />
                  <span className="text-dark">Overdue</span>
                </button>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <button
                className="btn btn-light btn-sm d-flex align-items-center gap-1 fw-semibold"
                onClick={handleClearAll}
                style={{ borderRadius: '20px', padding: '6px 12px' }}
              >
                <FontAwesomeIcon icon={faTimes} size="sm" className="text-danger" />
                <span className="text-dark">Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          {userId && (
            <span className="badge bg-light text-dark border d-flex align-items-center gap-1">
              User: {users.find(u => u.id == userId)?.name || userId}
              <FontAwesomeIcon
                icon={faTimes}
                size="sm"
                style={{ cursor: 'pointer' }}
                onClick={() => { setUserId(''); handleApply(); }}
              />
            </span>
          )}
          {status && (
            <span className="badge bg-light text-dark border d-flex align-items-center gap-1">
              Status: {status}
              <FontAwesomeIcon
                icon={faTimes}
                size="sm"
                style={{ cursor: 'pointer' }}
                onClick={() => { setStatus(''); handleApply(); }}
              />
            </span>
          )}
          {priorityFilter !== 'All' && (
            <span className="badge bg-light text-dark border d-flex align-items-center gap-1">
              Priority: {priorityFilter}
              <FontAwesomeIcon
                icon={faTimes}
                size="sm"
                style={{ cursor: 'pointer' }}
                onClick={() => { setPriorityFilter('All'); handleApply(); }}
              />
            </span>
          )}
          {q && (
            <span className="badge bg-light text-dark border d-flex align-items-center gap-1">
              Search: {(() => {
                if (q.startsWith('due_date:')) {
                  const date = q.split(':')[1];
                  return `Due Today (${date.split('-').reverse().join('-')})`;
                }
                if (q.startsWith('week:')) {
                  const dateRange = q.split(':')[1];
                  const [startDate, endDate] = dateRange.split('-').length === 6 ?
                    [dateRange.substring(0, 10), dateRange.substring(11)] :
                    dateRange.split(' to ');
                  const formatDate = (d) => d.split('-').reverse().join('-');
                  return `This Week (${formatDate(startDate)} to ${formatDate(endDate)})`;
                }
                if (q.startsWith('overdue:')) return `Overdue Tasks`;
                return q.length > 20 ? q.substring(0, 20) + '...' : q;
              })()}
              <FontAwesomeIcon
                icon={faTimes}
                size="sm"
                style={{ cursor: 'pointer' }}
                onClick={() => { setQ(''); handleApply(); }}
              />
            </span>
          )}
        </div>
      )}

      {/* Modern Collapsible Filter Panel */}
      {!isCollapsed && (
        <div className="card shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="card-body p-4">
            <div className="row g-4">
              <div className="col-md-3">
                <label className="form-label fw-bold text-dark mb-2">
                  <FontAwesomeIcon icon={faFilter} className="me-2 text-primary" />
                  Search
                </label>
                <input
                  className="form-control shadow-sm border-0"
                  placeholder="Title, description..."
                  value={(() => {
                    if (q.startsWith('due_date:')) return 'Due Today';
                    if (q.startsWith('week:')) return 'This Week';
                    if (q.startsWith('overdue:')) return 'Overdue Tasks';
                    return q;
                  })()}
                  onChange={e => setQ(e.target.value)}
                  style={{
                    borderRadius: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#f8f9fa',
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={e => e.target.style.border = '2px solid #667eea'}
                  onBlur={e => e.target.style.border = '2px solid transparent'}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label fw-bold text-dark mb-2">
                  Status
                </label>
                <select
                  className="form-select shadow-sm border-0"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  style={{
                    borderRadius: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#fff',
                    border: '2px solid #e9ecef',
                    backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23667eea\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'m1 6 6 6 6-6\'/%3e%3c/svg%3e")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px 12px',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={e => {
                    e.target.style.border = '2px solid #667eea';
                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(102, 126, 234, 0.25)';
                  }}
                  onBlur={e => {
                    e.target.style.border = '2px solid #e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">All Status</option>
                  <option value="Open"> Open</option>
                  <option value="In Progress"> In Progress</option>
                  <option value="On Hold"> On Hold</option>
                  <option value="Cancelled"> Cancelled</option>
                  <option value="Completed"> Completed</option>
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label fw-bold text-dark mb-2">
                  Priority
                </label>
                <select
                  className="form-select shadow-sm border-0"
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  style={{
                    borderRadius: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#fff',
                    border: '2px solid #e9ecef',
                    backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23667eea\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'m1 6 6 6 6-6\'/%3e%3c/svg%3e")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px 12px',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={e => {
                    e.target.style.border = '2px solid #667eea';
                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(102, 126, 234, 0.25)';
                  }}
                  onBlur={e => {
                    e.target.style.border = '2px solid #e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="All">All Priority</option>
                  <option value="Urgent"> Urgent</option>
                  <option value="High"> High</option>
                  <option value="Medium"> Medium</option>
                  <option value="Low"> Low</option>
                </select>
              </div>

              {showUserFilter && (
                <div className="col-md-3">
                  <label className="form-label fw-bold text-dark mb-2">
                    User
                  </label>
                  <select
                    className="form-select shadow-sm border-0"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    style={{
                      borderRadius: '12px',
                      padding: '12px 16px',
                      backgroundColor: '#fff',
                      border: '2px solid #e9ecef',
                      backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23667eea\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'m1 6 6 6 6-6\'/%3e%3c/svg%3e")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '16px 12px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={e => {
                      e.target.style.border = '2px solid #667eea';
                      e.target.style.boxShadow = '0 0 0 0.2rem rgba(102, 126, 234, 0.25)';
                    }}
                    onBlur={e => {
                      e.target.style.border = '2px solid #e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">👥 All Users</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>👤 {u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="col-md-2 d-flex align-items-end">
                <button
                  className="btn w-100 d-flex align-items-center justify-content-center gap-2 fw-bold"
                  onClick={handleApply}
                  disabled={loading}
                  style={{
                    borderRadius: '12px',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faFilter} />
                      Apply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
