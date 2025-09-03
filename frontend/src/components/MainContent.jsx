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
}) => {
  const filteredTasks = tasks.filter(task => {
    if (activeFilter !== 'Done' && !!task.is_done) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Done') return !!task.is_done;
    if (activeFilter === 'Important') return !!task.is_important;
    if (activeFilter === 'Favorites') return !!task.is_favorite;

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
          data={filteredTasks}
          onEdit={onEdit}
          onDelete={onDelete}
          onDone={onDone}
          onToggleFavorite={onToggleFavorite}
          onToggleImportant={onToggleImportant}
        />
      </div>
    </div>
  );
};

export default MainContent;
