import React from "react";
import Profile from "./Profile";
import TaskFilterCard from "./TaskFilterCard";
import AdminPanelCard from "./AdminPanelCard";
import styles from "./Sidebar.module.css";

const Sidebar = ({ 
  activeFilter, 
  onFilterChange, 
  taskCounts, 
  showAdminPanel, 
  user, 
  onUserUpdate,
  // Admin panel props
  activeTab,
  setActiveTab,
  tasks,
  users,
  allTasks,
  handleApplyFilters
}) => {
  return (
    <div className={styles.sidebar}>
      <Profile user={user} onUserUpdate={onUserUpdate} />
      {showAdminPanel ? (
        <AdminPanelCard
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tasks={tasks}
          users={users}
          allTasks={allTasks}
          handleApplyFilters={handleApplyFilters}
        />
      ) : (
        <TaskFilterCard
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          taskCounts={taskCounts}
        />
      )}
    </div>
  );
};

export default Sidebar;
