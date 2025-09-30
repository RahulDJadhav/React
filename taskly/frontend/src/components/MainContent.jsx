import React from 'react';
import CategoryControls from './CategoryControls';
import TodoListCard from './TodoListCard';

const MainContent = ({
  tasks,
  onDelete,
  onEdit,
  onDone,
  onToggleFavorite,
  onToggleImportant,
  activeFilter,     // keep this
  onChangeStatus,
  currentUserId,
}) => {
  const filteredTasks = tasks.filter(task => {
    // Exclude completed tasks from all filters except 'Completed'
    if (activeFilter !== 'Completed' && !!task.is_done) return false;
    // Exclude cancelled tasks from all filters except 'Cancelled'
    if (activeFilter !== 'Cancelled' && task.status === 'Cancelled') return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Completed') return !!task.is_done;
    if (activeFilter === 'Important') return !!task.is_important;
    if (activeFilter === 'Favorites') return !!task.is_favorite;
    if (activeFilter === 'Cancelled') return task.status === 'Cancelled';

    if (activeFilter === 'Due Soon') {
      if (!task.due_date) return false;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      sevenDaysFromNow.setHours(23, 59, 59, 999);
      const taskDueDate = new Date(task.due_date); taskDueDate.setHours(0, 0, 0, 0);
      return taskDueDate >= today && taskDueDate <= sevenDaysFromNow;
    }
    return true;
  });

  return (
    <div className="row">
      <div className="col-12">
        <CategoryControls />
        <TodoListCard
          userId={currentUserId}
          data={filteredTasks}
          onEdit={onEdit}
          onDelete={onDelete}
          onDone={onDone}
          onToggleFavorite={onToggleFavorite}
          onToggleImportant={onToggleImportant}
          activeFilter={activeFilter}
          onChangeStatus={onChangeStatus}
        />
      </div>
    </div>
  );
};

export default MainContent;
