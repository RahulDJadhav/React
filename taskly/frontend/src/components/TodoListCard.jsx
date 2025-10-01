import React, { useEffect, useRef, useState } from 'react';
import styles from './TodoListCard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar, faHeart as solidHeart, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar, faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import TaskOptions from './TaskOptions';
import TaskTextToggle from './TaskTextToggle';
import Filters from './Filters';

const TodoListCard = ({ data, onEdit, onDelete, onDone, onToggleFavorite, onToggleImportant, onChangeStatus }) => {
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const [filteredData, setFilteredData] = useState(data);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const handleFilterApply = ({ status, priorityFilter, q }) => {
    let filtered = data;

    if (status) {
      filtered = filtered.filter(task => task.status === status);
    }

    if (priorityFilter && priorityFilter !== 'All') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    if (q) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(q.toLowerCase()) ||
        task.description.toLowerCase().includes(q.toLowerCase())
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
    setHasActiveFilters(!!(status || (priorityFilter && priorityFilter !== 'All') || q));
  };

  const handleClearFilters = () => {
    setFilteredData(data);
    setCurrentPage(1);
    setHasActiveFilters(false);
  };

  useEffect(() => {
    setFilteredData(data);
    setCurrentPage(1);
  }, [data]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTasks = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
  // Track open task options menu per task id
  const [openTaskOptionsById, setOpenTaskOptionsById] = useState({});
  const containerRefs = useRef({});

  const toggleMenu = (taskId) => {
    setOpenMenuById(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };
  const closeMenu = (taskId) => {
    setOpenMenuById(prev => ({ ...prev, [taskId]: false }));
  };

  const handleTaskOptionsToggle = (taskId, isOpen) => {
    setOpenTaskOptionsById(prev => ({ ...prev, [taskId]: isOpen }));
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

  if (filteredData.length === 0) {
    return (
      <div className="text-center py-5">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png"
          alt="Empty"
          width="100"
          className="mb-3"
        />
        <h5 className="fw-bold text-warning">Oops! Nothing here</h5>
        <p className="text-muted">
          {hasActiveFilters
            ? "No tasks match your current filters. Try adjusting your search criteria."
            : "Looks like you've completed everything 🎉"
          }
        </p>
        {hasActiveFilters && (
          <button
            className="btn btn-outline-primary mt-3"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  const priorityOrder = ['urgent', 'high', 'medium', 'low'];
  const groupedTasks = priorityOrder.reduce((acc, priority) => {
    acc[priority] = currentTasks.filter(task => task.priority?.toLowerCase() === priority);
    return acc;
  }, {});

  return (
    <div className="container">
      {!isAdmin && (
        <Filters
          onApply={handleFilterApply}
          showUserFilter={false}
        />
      )}
      {priorityOrder.flatMap(priority => {
        const tasks = groupedTasks[priority] || [];
        return tasks.map(task => (
          <div
            key={task.id}
            className={`row d-flex align-items-center mb-3 ${styles.todoList}  
          ${task.priority?.toLowerCase() === 'urgent' ? 'border border-danger border-2'
                : task.priority?.toLowerCase() === 'high' ? 'border border-warning border-2'
                  : task.priority?.toLowerCase() === 'medium' ? 'border border-success border-2'
                    : 'border border-secondary border-2'
              }`}
            style={{ zIndex: (openMenuById[task.id] || openTaskOptionsById[task.id]) ? 100000 : 1 }}
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
                  className={`badge bg-light text-dark ${styles.statusToggle} d-flex align-items-center`}
                  onClick={() => toggleMenu(task.id)}
                >
                  {task.status || 'Open'}
                  <FontAwesomeIcon icon={faChevronDown} className="ms-1" style={{ fontSize: '0.7rem' }} />
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
              ${task.priority?.toLowerCase() === 'urgent' ? 'bg-danger'
                  : task.priority?.toLowerCase() === 'high' ? 'bg-warning'
                    : task.priority?.toLowerCase() === 'medium' ? 'bg-success'
                      : 'bg-secondary'
                } `}>{task.priority}</span>

            </div>
            <div className="col-md-1 text-center">
              <div className="ms-3">
                <TaskOptions
                  taskId={task.id}
                  onEdit={() => onEdit && onEdit(task)}
                  onDelete={() => onDelete && onDelete(task.id)}
                  onMenuToggle={handleTaskOptionsToggle}
                />
              </div>
            </div>
          </div>
        ));
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-4">
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
      )}
    </div>
  );
};

export default TodoListCard;
