import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag, faCalendarAlt, faEdit, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';

const PriorityGroupedTasks = ({
  data,
  onEdit,
  onDelete,
  onDone,
  onToggleFavorite,
  onToggleImportant,
  onChangeStatus,
  isLoadingTasks
}) => {
  const priorityOrder = ['Urgent', 'High', 'Medium', 'Low'];
  const statusOrder = ['Open', 'In Progress', 'On Hold'];

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#198754';
      case 'low': return '#6c757d';
      default: return '#e9ecef';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return '🔴';
      case 'high': return '🟡';
      case 'medium': return '🟢';
      case 'low': return '⚪';
      default: return '⚫';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return '📋';
      case 'In Progress': return '⚡';
      case 'On Hold': return '⏸️';
      case 'Completed': return '✅';
      default: return '📝';
    }
  };

  // Group tasks by priority first, then by status
  const groupedTasks = {};
  
  data.forEach(task => {
    const priority = task.priority || 'Low';
    const status = task.status || 'Open';
    
    if (!groupedTasks[priority]) {
      groupedTasks[priority] = {};
    }
    if (!groupedTasks[priority][status]) {
      groupedTasks[priority][status] = [];
    }
    groupedTasks[priority][status].push(task);
  });

  if (isLoadingTasks) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading tasks...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-5">
        <img src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png" alt="Empty" width="100" className="mb-3" />
        <h5 className="fw-bold text-warning">No tasks found</h5>
        <p className="text-muted">Create your first task to get started! 🎉</p>
      </div>
    );
  }

  return (
    <div className="priority-grouped-tasks">
      {priorityOrder.map(priority => {
        if (!groupedTasks[priority]) return null;
        
        const priorityTasks = groupedTasks[priority];
        const totalCount = Object.values(priorityTasks).flat().length;
        
        return (
          <div key={priority} className="mb-4">
            {/* Priority Header */}
            <div 
              className="card border-0 mb-3"
              style={{
                background: `linear-gradient(135deg, ${getPriorityColor(priority)}15 0%, ${getPriorityColor(priority)}05 100%)`,
                borderLeft: `4px solid ${getPriorityColor(priority)}`
              }}
            >
              <div className="card-body p-3">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <span style={{ fontSize: '1.2rem' }}>{getPriorityIcon(priority)}</span>
                  <span style={{ color: getPriorityColor(priority), fontWeight: 'bold' }}>
                    {priority.toUpperCase()} PRIORITY
                  </span>
                  <span className="badge rounded-pill" style={{ backgroundColor: getPriorityColor(priority), color: 'white' }}>
                    {totalCount}
                  </span>
                </h5>
              </div>
            </div>

            {/* Status Groups within Priority */}
            <div className="row g-3">
              {statusOrder.map(status => {
                if (!priorityTasks[status] || priorityTasks[status].length === 0) return null;
                
                return (
                  <div key={status} className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-header bg-light border-0 p-3">
                        <h6 className="mb-0 d-flex align-items-center gap-2">
                          <span>{getStatusIcon(status)}</span>
                          <span className="fw-bold">{status}</span>
                          <span className="badge bg-secondary rounded-pill">
                            {priorityTasks[status].length}
                          </span>
                        </h6>
                      </div>
                      <div className="card-body p-0">
                        {priorityTasks[status].map(task => (
                          <div key={task.id} className="border-bottom p-3 task-item" style={{ cursor: 'pointer' }}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="mb-1 fw-bold text-dark">{task.title}</h6>
                              <div className="dropdown">
                                <button className="btn btn-sm btn-light" data-bs-toggle="dropdown">
                                  ⋮
                                </button>
                                <ul className="dropdown-menu">
                                  <li>
                                    <button className="dropdown-item" onClick={() => onEdit(task)}>
                                      <FontAwesomeIcon icon={faEdit} className="me-2" />
                                      Edit
                                    </button>
                                  </li>
                                  <li>
                                    <button className="dropdown-item text-danger" onClick={() => onDelete(task.id)}>
                                      <FontAwesomeIcon icon={faTrash} className="me-2" />
                                      Delete
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </div>
                            
                            {task.description && (
                              <p className="text-muted small mb-2">
                                {task.description.length > 60 
                                  ? `${task.description.substring(0, 60)}...` 
                                  : task.description
                                }
                              </p>
                            )}
                            
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center gap-2">
                                {task.due_date && (
                                  <span className="text-muted small">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                    {new Date(task.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              
                              <button
                                className="btn btn-sm"
                                style={{
                                  backgroundColor: status === 'Completed' ? '#198754' : 
                                                 status === 'In Progress' ? '#0dcaf0' : 
                                                 status === 'On Hold' ? '#ffc107' : '#0d6efd',
                                  color: 'white',
                                  borderRadius: '15px',
                                  fontSize: '0.75rem'
                                }}
                                onClick={() => {
                                  const statuses = ['Open', 'In Progress', 'Completed'];
                                  const currentIndex = statuses.indexOf(task.status || 'Open');
                                  const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                  onChangeStatus(task, nextStatus);
                                }}
                              >
                                {status === 'Completed' && <FontAwesomeIcon icon={faCheck} className="me-1" />}
                                {status}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PriorityGroupedTasks;