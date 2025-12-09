import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar as solidStar, 
  faHeart as solidHeart, 
  faCalendarAlt,
  faFlag,
  faEllipsisV,
  faEdit,
  faTrash,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar, faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

const EnhancedTaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  onToggleImportant, 
  onChangeStatus,
  isSelected,
  onSelect 
}) => {
  const [showActions, setShowActions] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#198754';
      case 'low': return '#6c757d';
      default: return '#e9ecef';
    }
  };

  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#198754';
      case 'In Progress': return '#0dcaf0';
      case 'On Hold': return '#ffc107';
      case 'Cancelled': return '#6c757d';
      default: return '#0d6efd';
    }
  };

  // Calculate days left
  const calculateDaysLeft = (dueDate, isCompleted = false) => {
    if (isCompleted) return { text: "Completed ✓", color: "#198754" };
    if (!dueDate) return { text: '', color: '' };

    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return { 
      text: `${diffDays} day${diffDays > 1 ? 's' : ''} left`, 
      color: "#198754" 
    };
    if (diffDays === 0) return { text: "Due today", color: "#fd7e14" };
    return { 
      text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`, 
      color: "#dc3545" 
    };
  };

  const daysInfo = calculateDaysLeft(task.due_date, task.status === 'Completed');

  return (
    <div 
      className="card border-0 shadow-sm mb-3"
      style={{
        borderRadius: '16px',
        borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
      }}
    >
      <div className="card-body p-4">
        {/* Header Row */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center gap-2">
            <input
              type="checkbox"
              className="form-check-input"
              checked={!!isSelected}
              onChange={(e) => {
                console.log('Checkbox clicked:', task.id, 'isSelected:', isSelected);
                onSelect(task.id);
              }}
            />
            <FontAwesomeIcon
              icon={task.is_important ? solidStar : regularStar}
              style={{ color: task.is_important ? '#ffc107' : '#dee2e6', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleImportant(task.id, task.is_important);
              }}
            />
            <FontAwesomeIcon
              icon={task.is_favorite ? solidHeart : regularHeart}
              style={{ color: task.is_favorite ? '#dc3545' : '#dee2e6', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(task.id, task.is_favorite);
              }}
            />
          </div>
          
          <div className="position-relative" ref={dropdownRef}>
            <button
              className="btn btn-sm btn-light rounded-circle"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              style={{ width: '32px', height: '32px' }}
            >
              <FontAwesomeIcon icon={faEllipsisV} size="sm" />
            </button>
            
            {showActions && (
              <div 
                className="position-absolute bg-white border rounded-3 shadow-lg"
                style={{
                  top: '100%',
                  right: 0,
                  zIndex: 1000,
                  minWidth: '150px',
                  marginTop: '5px',
                  border: '1px solid #dee2e6'
                }}
              >
                <button
                  className="d-block w-100 text-start border-0 bg-transparent px-3 py-2 hover-bg-light"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                    setShowActions(false);
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Edit
                </button>
                <button
                  className="d-block w-100 text-start border-0 bg-transparent px-3 py-2 text-danger hover-bg-light"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                    setShowActions(false);
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Task Title */}
        <h6 className="fw-bold mb-2 text-dark">{task.title}</h6>
        
        {/* Task Description */}
        {task.description && (
          <p className="text-muted small mb-3" style={{ lineHeight: '1.4' }}>
            {task.description.length > 100 
              ? `${task.description.substring(0, 100)}...` 
              : task.description
            }
          </p>
        )}

        {/* Task Meta Info */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-3">
            {/* Priority Badge */}
            <span 
              className="badge px-2 py-1"
              style={{ 
                backgroundColor: getPriorityColor(task.priority),
                color: 'white',
                fontSize: '0.75rem'
              }}
            >
              <FontAwesomeIcon icon={faFlag} className="me-1" />
              {task.priority || 'Low'}
            </span>
            
            {/* Due Date */}
            {task.due_date && (
              <span className="text-muted small d-flex align-items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {/* Days Left */}
          {daysInfo.text && (
            <span 
              className="small fw-semibold"
              style={{ color: daysInfo.color }}
            >
              {daysInfo.text}
            </span>
          )}
        </div>

        {/* Status and Progress */}
        <div className="d-flex justify-content-between align-items-center">
          <button
            className="btn btn-sm px-3 py-1"
            style={{
              backgroundColor: getStatusColor(task.status),
              color: 'white',
              borderRadius: '20px',
              fontSize: '0.75rem'
            }}
            onClick={(e) => {
              e.stopPropagation();
              const statuses = ['Open', 'In Progress', 'Completed'];
              const currentIndex = statuses.indexOf(task.status || 'Open');
              const nextStatus = statuses[(currentIndex + 1) % statuses.length];
              onChangeStatus(task, nextStatus);
            }}
          >
            {task.status === 'Completed' && <FontAwesomeIcon icon={faCheck} className="me-1" />}
            {task.status || 'Open'}
          </button>
          
          {/* Progress Bar for In Progress tasks */}
          {task.status === 'In Progress' && (
            <div className="flex-grow-1 ms-3">
              <div className="progress" style={{ height: '6px', borderRadius: '3px' }}>
                <div 
                  className="progress-bar"
                  style={{ 
                    width: '60%', // You can make this dynamic based on task completion
                    backgroundColor: getStatusColor(task.status)
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedTaskCard;