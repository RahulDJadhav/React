import React from "react";
import Profile from "./Profile";
import TaskFilterCard from "./TaskFilterCard";
import styles from "./Sidebar.module.css";
const Sidebar = ({ activeFilter, onFilterChange, taskCounts, showAdminPanel, user, onUserUpdate }) => {
  return (
    <div className={styles.sidebar}>
      <Profile user={user} onUserUpdate={onUserUpdate} />
      {!showAdminPanel && (
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
