import React, { useState, useEffect, useRef } from 'react';
import DashboardOverview from './DashboardOverview';
import EnhancedTaskCard from './EnhancedTaskCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faThLarge, faFilter } from '@fortawesome/free-solid-svg-icons';

const EnhancedTodoList = ({ 
  data, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  onToggleImportant, 
  onChangeStatus, 
  isLoadingTasks 
}) => {
  const [filteredData, setFilteredData] = useState(data);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Fewer items per page for card view
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    let filtered = [...data];
    
    if (filterStatus) {
      filtered = filtered.filter(task => task.status === filterStatus);
    }
    
    if (filterPriority) {
      filtered = filtered.filter(task => task.priority?.toLowerCase() === filterPriority.toLowerCase());
    }
    
    setFilteredData(filtered);
    setCurrentPage(1);
    setSelectedTasks([]); // Clear selection when data changes
  }, [data, filterStatus, filterPriority]);

  // Sort tasks by priority
  const priorityOrder = { 'urgent': 1, 'high': 2, 'medium': 3, 'low': 4 };
  const sortedData = [...filteredData].sort((a, b) => {
    const aPriority = priorityOrder[a.priority?.toLowerCase()] || 5;
    const bPriority = priorityOrder[b.priority?.toLowerCase()] || 5;
    return aPriority - bPriority;
  });

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTasks = sortedData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleTaskSelection = (taskId) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    
    console.log('handleTaskSelection called with taskId:', taskId);
    setSelectedTasks(current => {
      console.log('Current state:', current);
      const newState = current.includes(taskId) 
        ? current.filter(id => id !== taskId)
        : [...current, taskId];
      console.log('New state:', newState);
      
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
      
      return newState;
    });
  };

  const handleSelectAll = (e) => {
    const allTaskIds = currentTasks.map(task => task.id);
    const isAllSelected = selectedTasks.length === currentTasks.length && currentTasks.length > 0;
    
    if (isAllSelected) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(allTaskIds);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    if (!window.confirm(`Delete ${selectedTasks.length} selected tasks?`)) return;

    try {
      const deletePromises = selectedTasks.map(taskId =>
        fetch(`${process.env.REACT_APP_API_URL}deleteTask.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: taskId, 
            user_id: JSON.parse(localStorage.getItem('taskly_user'))?.id 
          })
        })
      );

      await Promise.all(deletePromises);
      alert(`${selectedTasks.length} tasks deleted successfully!`);
      window.location.reload();
    } catch (error) {
      alert('Error deleting tasks');
    }

    setSelectedTasks([]);
  };

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

  return (
    <div className="container-fluid">
      {/* Dashboard Overview */}
      <DashboardOverview tasks={data} />

      {/* Controls Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded-3">
        <div className="d-flex align-items-center gap-3">
          <h5 className="mb-0 fw-bold">📋 My Tasks</h5>
          
          {/* View Toggle */}
          <div className="btn-group" role="group">
            <button
              className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('cards')}
            >
              <FontAwesomeIcon icon={faThLarge} className="me-1" />
              Cards
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('list')}
            >
              <FontAwesomeIcon icon={faList} className="me-1" />
              List
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faFilter} className="text-muted" />
          <select 
            className="form-select form-select-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          
          <select 
            className="form-select form-select-sm"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <div className="alert alert-primary d-flex justify-content-between align-items-center mb-4">
          <span>
            <strong>{selectedTasks.length}</strong> task{selectedTasks.length > 1 ? 's' : ''} selected
          </span>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setSelectedTasks([])}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}



      {/* Debug */}
      <div className="mb-2 p-2 bg-light rounded small">
        Selected: [{selectedTasks.join(', ')}]
        <button 
          className="btn btn-sm btn-primary ms-2" 
          onClick={() => {
            console.log('Direct test button clicked');
            handleTaskSelection(currentTasks[0]?.id);
          }}
        >
          Test Direct
        </button>
      </div>

      {/* Select All */}
      {currentTasks.length > 0 && (
        <div className="mb-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="selectAll"
              checked={selectedTasks.length === currentTasks.length && currentTasks.length > 0}
              onChange={handleSelectAll}
            />
            <label className="form-check-label text-muted" htmlFor="selectAll">
              Select all ({currentTasks.length} tasks) - Currently selected: {selectedTasks.length}
            </label>
          </div>
        </div>
      )}

      {/* Tasks Display */}
      {sortedData.length === 0 ? (
        <div className="text-center py-5">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png"
            alt="Empty"
            width="100"
            className="mb-3"
          />
          <h5 className="fw-bold text-warning">No tasks found</h5>
          <p className="text-muted">
            {filterStatus || filterPriority 
              ? "No tasks match your current filters." 
              : "You're all caught up! 🎉"
            }
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="row g-3">
              {currentTasks.map(task => (
                <div key={task.id} className="col-lg-4 col-md-6">
                  <EnhancedTaskCard
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleFavorite={onToggleFavorite}
                    onToggleImportant={onToggleImportant}
                    onChangeStatus={onChangeStatus}
                    isSelected={selectedTasks.includes(task.id)}
                    onSelect={handleTaskSelection}
                  />
                </div>
              ))}
            </div>
          ) : (
            // List view (simplified version of original)
            <div className="card border-0 shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th width="50">
                        <input
                          type="checkbox"
                          checked={selectedTasks.length === currentTasks.length && currentTasks.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Task</th>
                      <th>Due Date</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTasks.map(task => (
                      <tr key={task.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(task.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleTaskSelection(task.id);
                            }}
                          />
                        </td>
                        <td>
                          <div>
                            <div className="fw-semibold">{task.title}</div>
                            {task.description && (
                              <small className="text-muted">
                                {task.description.length > 50 
                                  ? `${task.description.substring(0, 50)}...` 
                                  : task.description
                                }
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <small className="text-muted">{task.due_date || '-'}</small>
                        </td>
                        <td>
                          <span className={`badge ${
                            task.priority?.toLowerCase() === 'urgent' ? 'bg-danger' :
                            task.priority?.toLowerCase() === 'high' ? 'bg-warning text-dark' :
                            task.priority?.toLowerCase() === 'medium' ? 'bg-success' :
                            'bg-secondary'
                          }`}>
                            {task.priority || 'Low'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            task.status === 'Completed' ? 'bg-success' :
                            task.status === 'In Progress' ? 'bg-info' :
                            'bg-primary'
                          }`}>
                            {task.status || 'Open'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => onEdit(task)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => onDelete(task.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>
                
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default EnhancedTodoList;