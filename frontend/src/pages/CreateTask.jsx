import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { teamAPI, taskAPI } from '../services/api';
import {
  CheckSquare,
  Users,
  Calendar,
  AlertCircle,
  ArrowLeft,
  PlusCircle,
} from 'lucide-react';

const CreateTask = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTeamId = searchParams.get('teamId') || '';

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    team: initialTeamId,
    assignedTo: '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch all user teams
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoadingTeams(true);
        const data = await teamAPI.getAll();
        setTeams(data);

        // Pre-select team if provided in query param or pick the first team
        if (initialTeamId && data.some((t) => t._id === initialTeamId)) {
          setFormData((prev) => ({ ...prev, team: initialTeamId }));
        } else if (data.length > 0 && !formData.team) {
          setFormData((prev) => ({ ...prev, team: data[0]._id }));
        }
      } catch (err) {
        setError(err.message || 'Failed to load teams');
      } finally {
        setLoadingTeams(false);
      }
    };

    loadTeams();
  }, [initialTeamId]);

  // When selected team changes, fetch team details to get member roster
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!formData.team) {
        setSelectedTeam(null);
        return;
      }
      try {
        const teamDetail = await teamAPI.getById(formData.team);
        setSelectedTeam(teamDetail);
        // Clear assignment if current assignee is not in newly selected team
        if (
          formData.assignedTo &&
          !teamDetail.members.some((m) => m.user && m.user._id === formData.assignedTo)
        ) {
          setFormData((prev) => ({ ...prev, assignedTo: '' }));
        }
      } catch (err) {
        console.warn('Failed to load team roster for task assignment', err.message);
      }
    };

    loadTeamMembers();
  }, [formData.team]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!formData.team) {
      setError('Please select a team for this task');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        team: formData.team,
        assignedTo: formData.assignedTo || null,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };

      await taskAPI.create(payload);
      navigate('/tasks');
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTeams) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading teams and members...</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <div className="empty-state-icon" style={{ margin: '0 auto 1.5rem' }}>
          <Users size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          No Teams Available
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
          Tasks in TeamSync must belong to a team. Create a team first to start adding and assigning workflow tasks.
        </p>
        <Link to="/teams" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <PlusCircle size={16} />
          <span>Go to Teams & Create One</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/tasks"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Tasks</span>
        </Link>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Create New Task
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Define actionable work items, assign responsibilities, and set deadlines
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="taskTitle">
              Task Title *
            </label>
            <input
              id="taskTitle"
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Design API architecture for notification service"
              value={formData.title}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="taskDescription">
              Description
            </label>
            <textarea
              id="taskDescription"
              name="description"
              className="form-textarea"
              placeholder="Provide background context, requirements, acceptance criteria, or links..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {/* Team and Assignee Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Team Picker */}
            <div className="form-group">
              <label className="form-label" htmlFor="teamSelect">
                Team Workspace *
              </label>
              <select
                id="teamSelect"
                name="team"
                className="form-select"
                value={formData.team}
                onChange={handleChange}
                required
              >
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Member Assignee */}
            <div className="form-group">
              <label className="form-label" htmlFor="assignedToSelect">
                Assignee
              </label>
              <select
                id="assignedToSelect"
                name="assignedTo"
                className="form-select"
                value={formData.assignedTo}
                onChange={handleChange}
              >
                <option value="">Unassigned</option>
                {selectedTeam?.members?.map((m) => (
                  <option key={m.user?._id || Math.random()} value={m.user?._id}>
                    {m.user?.name} ({m.user?.email}) - {m.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority, Status, Due Date Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {/* Priority */}
            <div className="form-group">
              <label className="form-label" htmlFor="prioritySelect">
                Priority
              </label>
              <select
                id="prioritySelect"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label" htmlFor="statusSelect">
                Initial Status
              </label>
              <select
                id="statusSelect"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="dueDateInput">
                Due Date
              </label>
              <input
                id="dueDateInput"
                type="date"
                name="dueDate"
                className="form-input"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem',
              marginTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1.5rem',
            }}
          >
            <Link to="/tasks" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <span>Creating Task...</span>
              ) : (
                <>
                  <CheckSquare size={18} />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
