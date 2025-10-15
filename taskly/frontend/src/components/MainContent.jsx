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
  activeFilter,
  onChangeStatus,
  currentUserId,
  globalSearchQuery,
  isLoadingTasks,
}) => {
  const filteredTasks = tasks.filter(task => {
    // First apply global search filter
    if (globalSearchQuery) {
      const query = globalSearchQuery.toLowerCase();
      const matchesSearch =
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.priority?.toLowerCase().includes(query) ||
        task.status?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Then apply sidebar filter
    switch (activeFilter) {
      case 'All':
        return true;
      case 'Completed':
        return task.is_done == 1;
      case 'Cancelled':
        return task.status === 'Cancelled';
      case 'On Hold':
        return task.status === 'On Hold';
      case 'In Progress':
        return task.status === 'In Progress';
      case 'Open':
        return task.status === 'Open';
      case 'Important':
        return task.is_important == 1 && task.is_done != 1 && task.status !== 'Cancelled';
      case 'Favorites':
        return task.is_favorite == 1 && task.is_done != 1 && task.status !== 'Cancelled';
      case 'Due Soon':
        if (!task.due_date || task.is_done == 1 || task.status === 'Cancelled') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);
        sevenDaysFromNow.setHours(23, 59, 59, 999);
        const taskDueDate = new Date(task.due_date);
        taskDueDate.setHours(0, 0, 0, 0);
        return taskDueDate >= today && taskDueDate <= sevenDaysFromNow;
      default:
        return true;
    }
  });

  return (
    <div className="row">
      <div className="col-12">
        {globalSearchQuery && (
          <div className="alert alert-info mb-3">
            <strong>Search Results:</strong> Found {filteredTasks.length} task(s) for "{globalSearchQuery}"
          </div>
        )}
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
          isLoadingTasks={isLoadingTasks}
        />
      </div>
    </div>
  );
};

export default MainContent;
