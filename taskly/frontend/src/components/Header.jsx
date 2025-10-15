import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBell, faSignOutAlt, faTasks, faPlus, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import AddButton from './AddButton';

const Header = ({ onAddClick, onLogout, tasks, onOpenAdmin, onGlobalSearch, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const dueToday = tasks.filter(task => task.due_date === today);
    setNotifications(dueToday.map(task => ({ 
      id: `due_${task.id}`, 
      message: `Task '${task.title}' is due today!`,
      read: false
    })));
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
    <nav className="navbar navbar-dark px-4 py-3">
      <div className="container-fluid">
        <div className="row w-100 align-items-center">

          {/* Logo Section */}
          <div className="col-md-3">
            <span className="navbar-brand mb-0 h1" style={{ color: '#4d46e1', fontSize: '1.5rem', fontWeight: 'bold' }}>
              <FontAwesomeIcon icon={faTasks} size="lg" className="me-2" />
              Taskly
            </span>
          </div>

          {/* Search Section */}
          <div className="col-md-6">
            <div className="position-relative mx-auto" style={{ maxWidth: '500px' }}>
              <input
                className="form-control"
                type="search"
                placeholder="Search tasks, descriptions, priorities..."
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onGlobalSearch(e.target.value);
                }}
                style={{
                  paddingRight: searchQuery ? '40px' : '12px',
                  borderRadius: '25px',
                  border: '2px solid #e9ecef',
                  fontSize: '14px'
                }}
              />
              {searchQuery && (
                <button
                  className="btn btn-link position-absolute"
                  style={{
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '0',
                    zIndex: 10,
                    color: '#6c757d'
                  }}
                  onClick={() => {
                    setSearchQuery('');
                    onGlobalSearch('');
                  }}
                >
                  {/* <FontAwesomeIcon icon={faTimes} /> */}
                </button>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className="col-md-3">
            <div className='d-flex align-items-center justify-content-end gap-2'>
              {user?.role === 'admin' && (
                <button className="btn btn-outline-primary btn-sm" onClick={onOpenAdmin}>
                  Admin Panel
                </button>
              )}

              <AddButton
                onClick={onAddClick}
                className="btn-primary-taskly text-white btn-sm"
                label={<><FontAwesomeIcon icon={faPlus} className="me-1" />Add</>}

              />

              <div className="position-relative" ref={dropdownRef}>
                <FontAwesomeIcon
                  icon={faBell}
                  style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#6c757d' }}
                  onClick={toggleDropdown}
                />
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: '0.6rem' }}
                  >
                    {unreadCount}
                  </span>
                )}

                {showDropdown && (
                  <div
                    className="dropdown-menu dropdown-menu-end show mt-2 p-2 shadow"
                    style={{ width: '280px', right: 0 }}
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
                          {n.message || `Task ${n.title} is due today!`}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <FontAwesomeIcon
                icon={faSignOutAlt}
                style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#6c757d' }}
                title="Logout"
                onClick={onLogout}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
