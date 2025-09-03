import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as farHeart, faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { faList, faClock, faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './TaskFilterCard.module.css';

const TaskFilterCard = ({ activeFilter, onFilterChange, taskCounts }) => {

  let taskItems = ["All", "Important", "Favorites", "Done", "Due Soon"];
  // let taskItemCounts = [10, 5, 3, 8, 2];

  // Use actual icons instead of string names
  const taskIcons = [faList, farStar, farHeart, faSquareCheck, faClock];

  return (
    <div className="card shadow-sm border-0">
      <ul className="list-group list-group-flush">
        {
          taskItems.map((item, index) => ( // Changed 'task' to 'item' to avoid confusion with task object
            <li
              key={index}
              // 3. Add active style based on activeFilter
              className={`list-group-item d-flex justify-content-between align-items-center ${styles.taskItem} ${activeFilter === item ? styles.activeFilter : ''}`}
              // 4. Call onFilterChange when clicked
              onClick={() => onFilterChange(item)}
            >
              <div>
                <FontAwesomeIcon icon={taskIcons[index]} className="me-2" />
                {item} {/* Display the item name */}
              </div>
              {/* 5. Use dynamic counts from taskCounts prop */}
              <span className={`badge rounded-pill ${styles.taskBadge}`}>{taskCounts[item]}</span>
            </li>
          ))
        }
      </ul>
    </div>
  );
};

export default TaskFilterCard;