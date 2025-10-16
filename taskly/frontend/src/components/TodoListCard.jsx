import React, { useEffect, useRef, useState } from 'react';
import styles from './TodoListCard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar, faHeart as solidHeart, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar, faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import TaskOptions from './TaskOptions';
import TaskTextToggle from './TaskTextToggle';
import Filters from './Filters';

const TodoListCard = ({ data, onEdit, onDelete, onDone, onToggleFavorite, onToggleImportant, onChangeStatus, isLoadingTasks }) => {
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const [filteredData, setFilteredData] = useState(data);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const handleFilterApply = ({ status, priorityFilter, q }) => {
    let filtered = [...data];

    if (status) {
      filtered = filtered.filter(task => task.status === status);
    }

    if (priorityFilter && priorityFilter !== 'All') {
      filtered = filtered.filter(task => task.priority?.toLowerCase() === priorityFilter.toLowerCase());
    }

    if (q) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(q.toLowerCase()) ||
        task.description.toLowerCase().includes(q.toLowerCase())
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Only reset page when filters are applied
    setHasActiveFilters(!!(status || (priorityFilter && priorityFilter !== 'All') || q));
  };

  const handleClearFilters = () => {
    setFilteredData([...data]);
    setCurrentPage(1);
    setHasActiveFilters(false);
  };

  useEffect(() => {
    setFilteredData([...data]);
    // Only reset page and clear selections if data actually changed
    if (JSON.stringify(data) !== JSON.stringify(filteredData)) {
      setCurrentPage(1);
      setSelectedTasks([]);
    }
  }, [data]);

  // Sort all filtered tasks by priority before pagination
  const priorityOrder = { 'urgent': 1, 'high': 2, 'medium': 3, 'low': 4 };
  const sortedFilteredData = [...filteredData].sort((a, b) => {
    const aPriority = priorityOrder[a.priority?.toLowerCase()] || 5;
    const bPriority = priorityOrder[b.priority?.toLowerCase()] || 5;
    return aPriority - bPriority;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTasks = sortedFilteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedFilteredData.length / itemsPerPage);



  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleTaskSelection = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === currentTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(currentTasks.map(task => task.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    if (!window.confirm(`Delete ${selectedTasks.length} selected tasks?`)) return;

    try {
      // Delete all tasks without showing individual alerts
      const deletePromises = selectedTasks.map(taskId =>
        fetch(`${process.env.REACT_APP_API_URL}deleteTask.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: taskId, user_id: JSON.parse(localStorage.getItem('taskly_user'))?.id })
        })
      );

      await Promise.all(deletePromises);

      // Show single success message
      alert(`${selectedTasks.length} tasks deleted successfully!`);

      // Refresh data by calling parent's refresh function
      window.location.reload();

    } catch (error) {
      alert('Error deleting tasks');
    }

    setSelectedTasks([]);
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedTasks.length === 0) return;

    for (const taskId of selectedTasks) {
      const task = currentTasks.find(t => t.id === taskId);
      if (task) {
        await onChangeStatus(task, newStatus);
      }
    }
    setSelectedTasks([]);
  };

  // Show bulk actions when tasks are selected
  useEffect(() => {
    setShowBulkActions(selectedTasks.length > 0);
  }, [selectedTasks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusDropdown && !event.target.closest('.status-dropdown')) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStatusDropdown]);

  // function to calculate days left
  const calculateDaysLeft = (dueDate, isCompleted = false) => {
    if (isCompleted) return "Completed ✓";
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

  if (sortedFilteredData.length === 0) {
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

  // Tasks are already sorted by priority, no need to group them

  return (
    <div className="container">
      {!isAdmin && (
        <Filters
          onApply={handleFilterApply}
          showUserFilter={false}
        />
      )}

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="mb-4 p-4 rounded-4 shadow-sm d-flex align-items-center justify-content-between" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div className="d-flex align-items-center">
            <div className="me-3">
              <i className="fas fa-check-circle text-white" style={{ fontSize: '1.2rem' }}></i>
            </div>
            <div>
              <h6 className="mb-1 text-white fw-bold">{selectedTasks.length} Task{selectedTasks.length > 1 ? 's' : ''} Selected</h6>
              <button
                className="btn btn-sm text-white-50 p-0 border-0 bg-transparent text-decoration-underline"
                onClick={() => setSelectedTasks([])}
                style={{ fontSize: '12px' }}
              >
                <i className="fas fa-times me-1"></i>Clear Selection
              </button>
            </div>
          </div>
          <div className="d-flex gap-3">
            <button
              className="btn btn-light btn-sm px-3 py-2 rounded-3 fw-semibold"
              onClick={handleBulkDelete}
            >
              🗑️ Delete
            </button>
            <div className="position-relative status-dropdown">
              <button
                className="btn btn-outline-light btn-sm px-3 py-2 rounded-3 fw-semibold"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white !important' }}
              >
                <i className="fas fa-edit me-2"></i>Change Status <i className="fas fa-chevron-down ms-1"></i>
              </button>
              {showStatusDropdown && (
                <div className="position-absolute bg-white border-0 rounded-3 shadow-lg" style={{
                  top: '100%',
                  left: 0,
                  zIndex: 1000,
                  minWidth: '180px',
                  marginTop: '5px'
                }}>
                  {STATUS_OPTIONS.map((status, index) => (
                    <button
                      key={status}
                      // className="d-block w-100 text-start border-0 bg-transparent px-3 py-2"
                      className="d-block w-100 text-start border-0 bg-transparent px-3 py-2 dropdown-option"
                      style={{
                        fontSize: '14px',
                        borderRadius: index === 0 ? '12px 12px 0 0' : index === STATUS_OPTIONS.length - 1 ? '0 0 12px 12px' : '0',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#e3f2fd';
                        e.target.style.transform = 'translateX(5px)';
                        e.target.style.paddingLeft = '20px';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.transform = 'translateX(0)';
                        e.target.style.paddingLeft = '12px';
                      }}
                      onClick={() => {
                        handleBulkStatusChange(status);
                        setShowStatusDropdown(false);
                      }}
                    >
                      <span className={`badge me-2 ${status === 'Completed' ? 'bg-success' :
                          status === 'In Progress' ? 'bg-info' :
                            status === 'Open' ? 'bg-primary' :
                              status === 'On Hold' ? 'bg-warning text-dark' :
                                'bg-secondary'
                        }`}>
                        •
                      </span>
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Select All Checkbox */}
      {currentTasks.length > 0 && (
        <div className="mb-2">
          <input
            type="checkbox"
            id="select-all"
            checked={selectedTasks.length === currentTasks.length && currentTasks.length > 0}
            onClick={handleSelectAll}
          />
          <label htmlFor="select-all" className="ms-2 small text-muted">
            Select All ({currentTasks.length} tasks)
          </label>
        </div>
      )}
      {currentTasks.length > 0 ? currentTasks.map(task => (
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
                title="Select task"
                id={`select-${task.id}`}
                checked={selectedTasks.includes(task.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskSelection(task.id);
                }}
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
              className={`fw-semibold small ${task.status === 'Completed' ? "text-success" :
                calculateDaysLeft(task.due_date).includes("Overdue") ? "text-danger" : "text-success"
                }`}
            >
              {calculateDaysLeft(task.due_date, task.status === 'Completed')}
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
                : task.priority?.toLowerCase() === 'high' ? 'bg-warning text-dark'
                  : task.priority?.toLowerCase() === 'medium' ? 'bg-success'
                    : task.priority?.toLowerCase() === 'low' ? 'bg-secondary' : 'bg-light text-dark'
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
      )) : (
        <div className="text-center py-3">
          <p>No tasks found on this page</p>
        </div>
      )}

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

            <li className={`page-item ${currentPage >= totalPages && 'disabled'}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default TodoListCard;
