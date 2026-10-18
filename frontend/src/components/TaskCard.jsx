import React, { useState } from 'react';
import { Calendar, User, Clock, AlertTriangle, MoreVertical, Trash2, Edit3 } from 'lucide-react';

const TaskCard = ({ task, onStatusChange, onEdit, onDelete, canDelete = false, canEdit = true }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleStatusSelect = async (newStatus) => {
    if (newStatus === task.status) return;
    setIsUpdating(true);
    try {
      await onStatusChange(task._id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'Completed';

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      className="card"
      style={{
        padding: '1.15rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-card)',
        border: isOverdue ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        position: 'relative',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Top Header: Team Badge & Priority & Options */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {task.team && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {task.team.name || 'Team'}
            </span>
          )}

          <span
            className={`badge badge-priority-${(task.priority || 'medium').toLowerCase()}`}
          >
            {task.priority || 'Medium'}
          </span>
        </div>

        {/* Action dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            onClick={() => setShowMenu(!showMenu)}
            style={{ padding: '0.25rem' }}
            title="Options"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)',
                minWidth: '130px',
                zIndex: 40,
                overflow: 'hidden',
              }}
            >
              {canEdit && onEdit && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(task);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    textAlign: 'left',
                  }}
                  className="btn-menu-item"
                >
                  <Edit3 size={14} />
                  <span>Edit Details</span>
                </button>
              )}

              {canDelete && onDelete && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(task._id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.8rem',
                    color: 'var(--danger)',
                    textAlign: 'left',
                  }}
                  className="btn-menu-item"
                >
                  <Trash2 size={14} />
                  <span>Delete Task</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Title & Description */}
      <div>
        <h4
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            marginBottom: '0.35rem',
            color: task.status === 'Completed' ? 'var(--text-muted)' : 'var(--text-main)',
            textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </h4>
        {task.description && (
          <p
            style={{
              fontSize: '0.825rem',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {task.description}
          </p>
        )}
      </div>

      {/* Due Date & Overdue Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.775rem' }}>
        {formattedDueDate && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: isOverdue ? 'var(--danger)' : 'var(--text-muted)',
              fontWeight: isOverdue ? 700 : 500,
            }}
          >
            <Calendar size={13} />
            <span>Due {formattedDueDate}</span>
          </span>
        )}

        {isOverdue && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              color: 'var(--danger)',
              fontSize: '0.725rem',
              fontWeight: 700,
            }}
          >
            <AlertTriangle size={12} />
            <span>Overdue</span>
          </span>
        )}
      </div>

      {/* Bottom Footer: Assignee & Status Quick Switch */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.75rem',
          marginTop: '0.25rem',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 'var(--radius-full)',
              backgroundColor: task.assignedTo ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.1)',
              color: task.assignedTo ? 'var(--primary)' : 'var(--text-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {task.assignedTo ? task.assignedTo.name.charAt(0).toUpperCase() : <User size={13} />}
          </div>
          <span
            style={{
              fontSize: '0.8rem',
              color: task.assignedTo ? 'var(--text-main)' : 'var(--text-subtle)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
          </span>
        </div>

        {/* Quick Status Select */}
        <div style={{ flexShrink: 0 }}>
          <select
            value={task.status}
            disabled={isUpdating}
            onChange={(e) => handleStatusSelect(e.target.value)}
            style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
