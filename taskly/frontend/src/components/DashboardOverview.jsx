import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faClock, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const DashboardOverview = ({ tasks }) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate stats
  const tasksToday = tasks.filter(task => task.due_date === today);
  const overdueTasks = tasks.filter(task => {
    if (!task.due_date || task.status === 'Completed') return false;
    return new Date(task.due_date) < new Date(today);
  });
  
  const completedThisWeek = tasks.filter(task => {
    if (task.status !== 'Completed') return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(task.updated_at || task.created_at) >= weekAgo;
  });

  const inProgress = tasks.filter(task => task.status === 'In Progress');

  const stats = [
    {
      title: "Due Today",
      count: tasksToday.length,
      icon: faCalendarDay,
      color: "primary",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "Overdue",
      count: overdueTasks.length,
      icon: faExclamationTriangle,
      color: "danger",
      gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)"
    },
    {
      title: "In Progress",
      count: inProgress.length,
      icon: faClock,
      color: "warning",
      gradient: "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)"
    },
    {
      title: "Completed This Week",
      count: completedThisWeek.length,
      icon: faCheckCircle,
      color: "success",
      gradient: "linear-gradient(135deg, #26de81 0%, #20bf6b 100%)"
    }
  ];

  return (
    <div className="mb-4">
      <h5 className="mb-3 fw-bold text-dark">📊 My Dashboard</h5>
      <div className="row g-3">
        {stats.map((stat, index) => (
          <div key={index} className="col-md-3 col-sm-6">
            <div 
              className="card border-0 shadow-sm h-100"
              style={{
                background: stat.gradient,
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
              }}
            >
              <div className="card-body p-4 text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50 mb-1 fw-normal">{stat.title}</h6>
                    <h2 className="fw-bold mb-0">{stat.count}</h2>
                  </div>
                  <div className="fs-1 opacity-50">
                    <FontAwesomeIcon icon={stat.icon} />
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="mt-3">
                  <div className="progress bg-white bg-opacity-20" style={{ height: '4px', borderRadius: '2px' }}>
                    <div 
                      className="progress-bar bg-white" 
                      style={{ 
                        width: `${Math.min((stat.count / Math.max(tasks.length, 1)) * 100, 100)}%`,
                        transition: 'width 1s ease-in-out'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;