import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faUsers, faList, faSpinner, faHandHolding, faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './TaskFilterCard.module.css';

// Animated Counter Component
const AnimatedCounter = ({ target, duration = 1000 }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return <span>{count}</span>;
};

const AdminPanelCard = ({ 
  activeTab, 
  setActiveTab, 
  tasks = [], 
  users = [], 
  allTasks = [], 
  handleApplyFilters 
}) => {
  // Admin panel items (Task Management, User Management)
  const adminItems = [
    { 
      title: "Task Management", 
      icon: faClipboardList, 
      type: "tab", 
      tabName: "tasks", 
      count: tasks.length,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      description: "Manage and monitor all tasks"
    },
    { 
      title: "User Management", 
      icon: faUsers, 
      type: "tab", 
      tabName: "users", 
      count: users.length,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      description: "Manage user accounts and permissions"
    }
  ];

  // Stats items (only show when Tasks tab is active)
  const statsItems = activeTab === 'tasks' ? [
    { title: "Total Tasks", icon: faList, type: "stat", count: allTasks.length, filter: "" },
    { title: "Open", icon: faClipboardList, type: "stat", count: allTasks.filter(t => t.status === "Open").length, filter: "Open" },
    { title: "In Progress", icon: faSpinner, type: "stat", count: allTasks.filter(t => t.status === "In Progress").length, filter: "In Progress" },
    { title: "Completed", icon: faSquareCheck, type: "stat", count: allTasks.filter(t => t.status === "Completed").length, filter: "Completed" }
  ] : [];

  const handleItemClick = (item) => {
    if (item.type === "tab") {
      setActiveTab(item.tabName);
    } else if (item.type === "stat") {
      const statusFilter = item.filter;
      handleApplyFilters({ userId: '', status: statusFilter, priorityFilter: 'All', q: '' });
    }
  };

  const allItems = [...adminItems, ...statsItems];

  return (
    <div>
      {/* Responsive Tab Cards */}
      <div className="mb-4">
        <div className="row g-2">
          {adminItems.map((item, index) => (
            <div key={index} className="col-12">
              <div 
                className={`card border-0 shadow-sm h-100`}
                style={{
                  cursor: 'pointer',
                  borderRadius: '12px',
                  background: activeTab === item.tabName ? item.gradient : '#fff',
                  border: activeTab === item.tabName ? 'none' : '2px solid #e9ecef',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleItemClick(item)}
              >
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <div 
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: '35px',
                          height: '35px',
                          borderRadius: '8px',
                          background: activeTab === item.tabName ? 'rgba(255,255,255,0.2)' : item.gradient,
                          color: 'white'
                        }}
                      >
                        <FontAwesomeIcon icon={item.icon} size="sm" />
                      </div>
                      <div>
                        <h6 className={`mb-0 fw-bold ${activeTab === item.tabName ? 'text-white' : 'text-dark'}`} style={{ fontSize: '14px' }}>
                          {item.title}
                        </h6>
                      </div>
                    </div>
                    <span 
                      className={`badge fw-bold px-2 py-1 ${activeTab === item.tabName ? 'bg-white text-dark' : 'text-white'}`}
                      style={{
                        borderRadius: '8px',
                        background: activeTab === item.tabName ? 'white' : item.gradient,
                        fontSize: '12px'
                      }}
                    >
                      <AnimatedCounter target={item.count} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards (only for tasks tab) */}
      {statsItems.length > 0 && (
        <div>
          <h6 className="text-muted mb-3 fw-bold" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>STATISTICS</h6>
          <div className="card shadow-sm border-0" style={{ borderRadius: '12px' }}>
            <ul className="list-group list-group-flush">
              {statsItems.map((item, index) => (
                <li
                  key={index}
                  className={`list-group-item d-flex justify-content-between align-items-center ${styles.taskItem}`}
                  onClick={() => handleItemClick(item)}
                  style={{ padding: '12px 16px', fontSize: '14px' }}
                >
                  <div>
                    <FontAwesomeIcon icon={item.icon} className="me-2 text-muted" size="sm" />
                    <span className="fw-medium">{item.title}</span>
                  </div>
                  <span className={`badge rounded-pill ${styles.taskBadge}`} style={{ fontSize: '11px' }}>
                    <AnimatedCounter target={item.count} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelCard;