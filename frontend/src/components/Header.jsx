import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBell, faSignOutAlt, faTasks, faPlus } from '@fortawesome/free-solid-svg-icons';
import AddButton from './AddButton';

const Header = ({ onAddClick, onLogout, tasks, onOpenAdmin }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dueToday = tasks.filter(task => task.due_date === today);
    setNotifications(dueToday.map(task => ({ ...task, read: false })));
  }, [tasks]);

  const toggleDropdown = () => setShowDropdown(prev => !prev);

  const handleNotificationClick = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  //  Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <nav className="navbar navbar-dark px-3">
      <div className="container-fluid d-flex justify-content-between align-items-center">

        <span className="navbar-brand mb-0 h1" style={{ color: '#4d46e1' }}>
          <FontAwesomeIcon icon={faTasks} size="1x" /> Taskly
        </span>

        <form className="d-flex w-50 mx-3 col-md-4">
          <input className="form-control me-2" type="search" placeholder="Search tasks..." aria-label="Search" />
        </form>

        <div className='d-flex align-items-center justify-content-end'>
          {localStorage.getItem('userRole') === 'admin' && (
            <button className="btn btn-outline-primary me-3" onClick={onOpenAdmin}>
              Admin Panel
            </button>
          )}
          <AddButton
            onClick={onAddClick}
            className="me-4 btn-primary-taskly text-white"
            label={<><FontAwesomeIcon icon={faPlus} className="me-2" />Add Task</>}
          />

          <div className="position-relative me-4" ref={dropdownRef}>
            <FontAwesomeIcon
              icon={faBell}
              style={{ cursor: 'pointer' }}
              onClick={toggleDropdown}
            />
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.7rem' }}
              >
                {unreadCount}
              </span>
            )}

            {showDropdown && (
              <div
                className="dropdown-menu dropdown-menu-end show mt-2 p-2 shadow"
                style={{ width: '250px', right: 0 }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>Notifications</strong>
                  <button className="btn btn-sm btn-link text-danger" onClick={handleClearAll}>
                    Clear All
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-muted text-center mb-0">No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2 mb-1 rounded ${n.read ? 'bg-light text-muted' : 'bg-primary text-white'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleNotificationClick(n.id)}
                    >
                      Task <strong>{n.title}</strong> is due today!
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" style={{ cursor: 'pointer' }} title="Logout" onClick={onLogout} />
        </div>
      </div>
    </nav>
  );
};

export default Header;
