import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../App.css';

const CreateTaskForm = forwardRef(({ onSubmit, onUpdate, onEdit }, ref) => {
  const modalRef = useRef(null);
  const modalInstanceRef = useRef(null);

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [assignee, setAssignee] = useState('');

  const PRIORITY_OPTIONS = [
    { name: 'Low', value: 'Low' },
    { name: 'Medium', value: 'Medium' },
    { name: 'High', value: 'High' },
    { name: 'Urgent', value: 'Urgent' }
  ];

  const STATUS_OPTIONS = [
    { name: 'Open', value: 'Open' },
    { name: 'In Progress', value: 'In Progress' },
    { name: 'On Hold', value: 'On Hold' },
    { name: 'Cancelled', value: 'Cancelled' }
  ];
  // Dropdown data
  const [priorities] = useState(PRIORITY_OPTIONS);
  const [statuses] = useState(STATUS_OPTIONS);
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);


  useEffect(() => {
    setDropdownsLoaded(true);
  }, []);

  //  Open modal and populate task if provided
  useImperativeHandle(ref, () => ({
    openModal: (task = null) => {
      const modal = new window.bootstrap.Modal(modalRef.current);
      modalInstanceRef.current = modal;
      const safeParseDate = (dateStr) => {
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? null : parsed;
      };
      if (task) {
        // Wait until dropdowns are loaded before setting task values
        const waitAndSetForm = () => {
          if (dropdownsLoaded) {
            setEditingId(task.id || null);
            setTaskTitle(task.title || '');
            setStartDate(
              task.startDate
                ? safeParseDate(task.startDate)
                : task.start_date
                  ? safeParseDate(task.start_date)
                  : null
            );
            setDueDate(
              task.dueDate
                ? safeParseDate(task.dueDate)
                : task.due_date
                  ? safeParseDate(task.due_date)
                  : null
            );
            setDescription(task.description || '');
            setPriority(task.priority || '');
            setStatus(task.status || '');
            setAssignee(task.assignee || '');

            modal.show();
          } else {
            setTimeout(waitAndSetForm, 100); // Retry after short delay
          }
        };
        waitAndSetForm();
      } else {
        // Reset form for new task
        setEditingId(null);
        setTaskTitle('');
        setStartDate('');
        setDueDate('');
        setDescription('');
        setPriority('');
        setStatus('');
        setAssignee('');
        modal.show();
      }
    }

  }));

  const handleSubmit = (e) => {
    e.preventDefault();

    const taskData = {
      id: editingId || Date.now(),
      title: taskTitle,
      startDate: startDate instanceof Date ? startDate.toISOString().split('T')[0] : '',
      dueDate: dueDate instanceof Date ? dueDate.toISOString().split('T')[0] : '',
      description,
      priority,
      status,
      assignee,
    };

    if (editingId) {
      onUpdate && onUpdate(taskData);
    } else {
      onSubmit && onSubmit(taskData);
    }

    modalInstanceRef.current.hide();

    // Reset form
    setEditingId(null);
    setTaskTitle('');
    setStartDate('');
    setDueDate('');
    setDescription('');
    setPriority('');
    setStatus('');
    setAssignee('');
  };



  return (
    <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow rounded-4">
          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-white border-0 rounded-top-4 px-4 py-3">
              <h5 className="modal-title fw-semibold">
                {editingId ? 'Update Task' : 'Create New Task'}
              </h5>
              <button type="button" className="btn-close btn-close-dark" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body bg-light px-4 pt-4 pb-2">
              <div className="bg-white p-4 rounded-4 shadow-sm">

                {/* Task Details Section */}
                <h6 className="text-muted text-uppercase mb-3">Task Details</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-12"> {/* Changed to col-md-12 for full width */}
                    <label className="form-label fw-medium">Task Title</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="Add task title..."
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">Description</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      placeholder="Add details about this task..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                {/* Dates Section */}
                <h6 className="text-muted text-uppercase mb-3">Dates</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Start Date</label>
                    <div className="d-grid">
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => {
                          setStartDate(date);
                          if (dueDate && date && dueDate < date) setDueDate(null);
                        }}
                        className="form-control rounded-3 custom-datepicker"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select start date"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Due Date</label>
                    <div className="d-grid">
                      <DatePicker
                        selected={dueDate}
                        onChange={(date) => setDueDate(date)}
                        className="form-control rounded-3 custom-datepicker"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select due date"
                        minDate={startDate || new Date()}
                        required
                      />
                    </div>
                  </div>
                </div>


                {/* Categorization Section */}
                <h6 className="text-muted text-uppercase mb-3">Categorization</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Priority</label>
                    <select
                      className="form-select"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      required
                    >
                      <option value="">Select</option>
                      {priorities.map(item => (
                        <option key={item.value} value={item.value}>{item.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Status</label>
                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      required
                    >
                      <option value="">Select</option>
                      {statuses.map(item => (
                        <option key={item.value} value={item.value}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-white border-0 rounded-bottom-4 px-4 py-3">
              <button type="button" className="btn btn-outline-secondary rounded-3" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="submit" className="btn btn-success rounded-3">
                <FontAwesomeIcon icon={editingId ? faEdit : faPlus} className="me-2" />
                {editingId ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

export default CreateTaskForm;
