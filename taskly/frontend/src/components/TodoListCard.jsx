import React, { useEffect, useRef, useState } from 'react';
import styles from './TodoListCard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar, faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar, faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import TaskOptions from './TaskOptions';
import TaskTextToggle from './TaskTextToggle';

const TodoListCard = ({ data, onEdit, onDelete, onDone, onToggleFavorite, onToggleImportant, onChangeStatus }) => {

  // function to calculate days left
  const calculateDaysLeft = (dueDate) => {
    if (!dueDate) return '';

    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0); // normalize time
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
    if (diffDays === 0) return "Due today";
    return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
  };

  const STATUS_OPTIONS = ['Open', 'In Progress', 'On Hold', 'Cancelled', 'Completed'];

  // Track open status menu per task id
  const [openMenuById, setOpenMenuById] = useState({});
  const containerRefs = useRef({});

  const toggleMenu = (taskId) => {
    setOpenMenuById(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };
  const closeMenu = (taskId) => {
    setOpenMenuById(prev => ({ ...prev, [taskId]: false }));
  };

  useEffect(() => {
    const onDocClick = (e) => {
      // Close any menu if clicked outside its container
      Object.entries(containerRefs.current).forEach(([id, el]) => {
        if (el && !el.contains(e.target)) {
          setOpenMenuById(prev => (prev[id] ? { ...prev, [id]: false } : prev));
        }
      });
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  if (data.length === 0) {
    return (
      <div className="row d-flex align-items-center">
        <div className="col text-center">
          <p className="text-muted">No tasks available. Please add a new task.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {data.map(task => (
        <div
          key={task.id}
          className={`row d-flex align-items-center mb-3 ${styles.todoList}  
          ${task.priority === 'Urgent' ? 'border border-danger border-2'
              : task.priority === 'High' ? 'border border-warning border-2'
                : task.priority === 'Medium' ? 'border border-success border-2'
                  : 'border border-secondary border-2'
            }`}
        >
          <div className="col-md-1">
            <div className="form-check d-flex align-items-center">
              <input
                className={`form-check-input me-2 ${styles.checkbox}`}
                type="checkbox"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title={task.is_done ? "Mark as Open" : "Mark as Completed"}
                id={`check-${task.id}`}
                checked={!!task.is_done}
                onChange={() => onDone && onDone(task.id, task.is_done)}
              />
              <FontAwesomeIcon
                icon={task.is_important ? solidStar : regularStar}
                style={{ color: task.is_important ? 'gold' : '#6c757d', cursor: 'pointer' }}
                onClick={() => onToggleImportant && onToggleImportant(task.id, task.is_important)}
                className="me-2"
              />
              <FontAwesomeIcon
                icon={task.is_favorite ? solidHeart : regularHeart}
                style={{ color: task.is_favorite ? 'red' : '#6c757d', cursor: 'pointer' }}
                onClick={() => onToggleFavorite && onToggleFavorite(task.id, task.is_favorite)}
                className="me-2"
              />
            </div>
          </div>

          <div className="col-md-2 d-flex align-items-center">
            <span className="fw-semibold"><TaskTextToggle text={task.title} maxLength={20} /></span>
          </div>
          <div className="col-md-3 d-flex align-items-center text-muted small"><TaskTextToggle text={task.description} maxLength={40} /></div>
          <div className="col-md-2">
            <span className="text-muted small">{task.due_date}</span>
            <br />
            <span
              className={`fw-semibold small 
                  ${calculateDaysLeft(task.due_date).includes("Overdue") ? "text-danger" : "text-success"}`}
            >
              {calculateDaysLeft(task.due_date)}
            </span>
          </div>
          <div className="col-md-2 text-center">
            <div
              className={styles.statusDropdown}
              ref={(el) => { containerRefs.current[task.id] = el; }}
            >
              <span
                className={`badge bg-light text-dark ${styles.statusToggle}`}
                onClick={() => toggleMenu(task.id)}
              >
                {task.status || 'Open'}
              </span>
              <div
                className={styles.statusMenu}
                style={{ display: openMenuById[task.id] ? 'block' : 'none' }}
              >
                {STATUS_OPTIONS.map(opt => (
                  <div
                    key={opt}
                    className={styles.statusMenuItem}
                    onClick={() => { onChangeStatus && onChangeStatus(task, opt); closeMenu(task.id); }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-1  d-flex text-center justify-content-center">
            <span className={`badge 
              ${task.priority === 'Urgent' ? 'bg-danger'
                : task.priority === 'High' ? 'bg-warning'
                  : task.priority === 'Medium' ? 'bg-success'
                    : 'bg-secondary'
              } `}>{task.priority}</span>

          </div>
          <div className="col-md-1 text-center">
            <div className="ms-3">
              <TaskOptions
                onEdit={() => onEdit && onEdit(task)}
                onDelete={() => onDelete && onDelete(task.id)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodoListCard;
