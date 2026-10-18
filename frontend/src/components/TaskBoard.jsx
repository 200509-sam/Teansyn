import React from 'react';
import TaskCard from './TaskCard';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';

const TaskBoard = ({ tasks, onStatusChange, onEditTask, onDeleteTask, currentUserId }) => {
  const columns = [
    {
      id: 'To Do',
      title: 'To Do',
      icon: Circle,
      color: '#94a3b8',
      tasks: tasks.filter((t) => t.status === 'To Do'),
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      icon: Clock,
      color: '#6366f1',
      tasks: tasks.filter((t) => t.status === 'In Progress'),
    },
    {
      id: 'Completed',
      title: 'Completed',
      icon: CheckCircle2,
      color: '#10b981',
      tasks: tasks.filter((t) => t.status === 'Completed'),
    },
  ];

  return (
    <div className="kanban-grid">
      {columns.map((col) => {
        const Icon = col.icon;
        return (
          <div key={col.id} className="kanban-column">
            {/* Column Header */}
            <div className="kanban-column-header">
              <div className="kanban-column-title" style={{ color: col.color }}>
                <Icon size={16} />
                <span>{col.title}</span>
              </div>
              <span className="kanban-count">{col.tasks.length}</span>
            </div>

            {/* Column Tasks */}
            <div className="kanban-cards-container">
              {col.tasks.length === 0 ? (
                <div
                  style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-subtle)',
                    fontSize: '0.85rem',
                    border: '1px dashed rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  No tasks in {col.title}
                </div>
              ) : (
                col.tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onStatusChange={onStatusChange}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    canDelete={
                      task.createdBy &&
                      (task.createdBy._id === currentUserId || task.createdBy === currentUserId)
                    }
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoard;
