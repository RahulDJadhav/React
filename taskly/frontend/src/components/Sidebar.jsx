import React from "react";
import Profile from "./Profile";
import TaskFilterCard from "./TaskFilterCard";
import styles from "./Sidebar.module.css";
const Sidebar = ({ activeFilter, onFilterChange, taskCounts, showAdminPanel }) => {
  return (
    <div className={styles.sidebar}>
      <Profile />
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
