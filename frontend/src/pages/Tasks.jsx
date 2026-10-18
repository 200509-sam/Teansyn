import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskAPI, teamAPI } from '../services/api';
import TaskBoard from '../components/TaskBoard';
import Modal from '../components/Modal';
import {
  CheckSquare,
  PlusCircle,
  Search,
  Filter,
  Kanban,
  List,
  AlertCircle,
  X,
} from 'lucide-react';

const Tasks = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState(searchParams.get('team') || '');
  const [assignedFilter, setAssignedFilter] = useState('');

  // Edit task modal
  const [editingTask, setEditingTask] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Fetch teams for filter dropdown
  useEffect(() => {
    const fetchTeamsList = async () => {
      try {
        const teamsData = await teamAPI.getAll();
        setTeams(teamsData);
      } catch (err) {
        console.warn('Failed to load teams list', err.message);
      }
    };
    fetchTeamsList();
  }, []);

  // Fetch tasks with active filters
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;
      if (teamFilter) filters.team = teamFilter;
      if (assignedFilter) filters.assignedTo = assignedFilter;
      if (searchTerm) filters.search = searchTerm;

      const data = await taskAPI.getAll(filters);
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTasks();
    }, 250);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, priorityFilter, teamFilter, assignedFilter]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updated = await taskAPI.update(taskId, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === taskId ? updated : t)));
    } catch (err) {
      alert(err.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskAPI.delete(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim()) {
      setEditError('Task title cannot be empty');
      return;
    }

    setEditLoading(true);
    setEditError('');

    try {
      const updated = await taskAPI.update(editingTask._id, {
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
        priority: editFormData.priority,
        status: editFormData.status,
        dueDate: editFormData.dueDate ? new Date(editFormData.dueDate).toISOString() : null,
      });

      setTasks(tasks.map((t) => (t._id === editingTask._id ? updated : t)));
      setEditingTask(null);
    } catch (err) {
      setEditError(err.message || 'Failed to update task');
    } finally {
      setEditLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setTeamFilter('');
    setAssignedFilter('');
  };

  const hasActiveFilters =
    searchTerm || statusFilter || priorityFilter || teamFilter || assignedFilter;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Task Board
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage task progress, update statuses, and filter team work items
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* View Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '0.2rem',
            }}
          >
            <button
              onClick={() => setViewMode('kanban')}
              className="btn btn-sm"
              style={{
                backgroundColor: viewMode === 'kanban' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'kanban' ? '#fff' : 'var(--text-muted)',
              }}
              title="Kanban Board View"
            >
              <Kanban size={16} />
              <span className="view-toggle-text">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="btn btn-sm"
              style={{
                backgroundColor: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'list' ? '#fff' : 'var(--text-muted)',
              }}
              title="Table List View"
            >
              <List size={16} />
              <span className="view-toggle-text">List</span>
            </button>
          </div>

          <Link to="/tasks/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <PlusCircle size={18} />
            <span>Create Task</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.85rem',
            alignItems: 'center',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-subtle)',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Team Filter */}
          <select
            className="form-select"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
          >
            <option value="">All Teams</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            className="form-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Assignment Filter */}
          <select
            className="form-select"
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
          >
            <option value="">All Assignees</option>
            <option value="me">Assigned to Me</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>

        {/* Clear filters action */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} matching filters
            </span>
            <button
              onClick={resetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: 'var(--primary)',
                fontWeight: 600,
              }}
            >
              <X size={14} />
              <span>Clear filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Task View */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CheckSquare size={28} />
          </div>
          <div className="empty-state-title">No tasks found</div>
          <div className="empty-state-desc">
            {hasActiveFilters
              ? 'No tasks match your current filter criteria. Try adjusting or clearing your filters.'
              : 'Create a task to get started.'}
          </div>
          {hasActiveFilters ? (
            <button onClick={resetFilters} className="btn btn-secondary">
              Reset Filters
            </button>
          ) : (
            <Link to="/tasks/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <PlusCircle size={16} />
              <span>Create Task</span>
            </Link>
          )}
        </div>
      ) : viewMode === 'kanban' ? (
        <TaskBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onEditTask={openEditModal}
          onDeleteTask={handleDeleteTask}
          currentUserId={user?._id}
        />
      ) : (
        /* List View */
        <div className="card">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Team</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{task.title}</span>
                      {task.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {task.description}
                        </p>
                      )}
                    </td>
                    <td>{task.team?.name || 'General'}</td>
                    <td>{task.assignedTo?.name || 'Unassigned'}</td>
                    <td>
                      <span className={`badge badge-priority-${(task.priority || 'medium').toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="form-select"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => openEditModal(task)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.6rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.3rem 0.6rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task Details"
      >
        {editError && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={16} />
            <span>{editError}</span>
          </div>
        )}

        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="editTitle">
              Title *
            </label>
            <input
              id="editTitle"
              type="text"
              className="form-input"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editDesc">
              Description
            </label>
            <textarea
              id="editDesc"
              className="form-textarea"
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="editPriority">
                Priority
              </label>
              <select
                id="editPriority"
                className="form-select"
                value={editFormData.priority}
                onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="editStatus">
                Status
              </label>
              <select
                id="editStatus"
                className="form-select"
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editDueDate">
              Due Date
            </label>
            <input
              id="editDueDate"
              type="date"
              className="form-input"
              value={editFormData.dueDate}
              onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditingTask(null)}
              disabled={editLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={editLoading}
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
