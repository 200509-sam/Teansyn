import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskAPI } from '../services/api';
import {
  Users,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await taskAPI.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Calculating dashboard statistics...</p>
      </div>
    );
  }

  const totalTasks = stats?.totalTasks || 0;
  const completedTasks = stats?.completedTasks || 0;
  const inProgressTasks = stats?.inProgressTasks || 0;
  const todoTasks = stats?.todoTasks || 0;
  const overdueTasks = stats?.overdueTasks || 0;
  const totalTeams = stats?.totalTeams || 0;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Welcome, {user?.name || 'Collaborator'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Here is what's happening across your teams and projects today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/teams" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <Users size={16} />
            <span>Manage Teams</span>
          </Link>
          <Link to="/tasks/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <PlusCircle size={16} />
            <span>Create Task</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Dynamic Statistics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Total Teams */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Teams
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800 }}>{totalTeams}</div>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckSquare size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Tasks
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800 }}>{totalTasks}</div>
          </div>
        </div>

        {/* In Progress */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              In Progress
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800 }}>{inProgressTasks}</div>
          </div>
        </div>

        {/* Completed */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Completed
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800 }}>{completedTasks}</div>
          </div>
        </div>

        {/* Overdue */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Overdue
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: overdueTasks > 0 ? 'var(--danger)' : 'inherit' }}>
              {overdueTasks}
            </div>
          </div>
        </div>
      </div>

      {/* Task Summary & Project Health Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Task Distribution Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Task Status Breakdown</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {completionRate}% Completed
            </span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              height: '10px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              display: 'flex',
              marginBottom: '1.5rem',
            }}
          >
            {totalTasks > 0 ? (
              <>
                <div
                  style={{
                    width: `${(completedTasks / totalTasks) * 100}%`,
                    backgroundColor: 'var(--success)',
                  }}
                  title={`Completed: ${completedTasks}`}
                />
                <div
                  style={{
                    width: `${(inProgressTasks / totalTasks) * 100}%`,
                    backgroundColor: 'var(--primary)',
                  }}
                  title={`In Progress: ${inProgressTasks}`}
                />
                <div
                  style={{
                    width: `${(todoTasks / totalTasks) * 100}%`,
                    backgroundColor: 'var(--text-subtle)',
                  }}
                  title={`To Do: ${todoTasks}`}
                />
              </>
            ) : (
              <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
            )}
          </div>

          {/* Breakdown Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--text-subtle)' }} />
                <span>To Do</span>
              </div>
              <span style={{ fontWeight: 700 }}>{todoTasks}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                <span>In Progress</span>
              </div>
              <span style={{ fontWeight: 700 }}>{inProgressTasks}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                <span>Completed</span>
              </div>
              <span style={{ fontWeight: 700 }}>{completedTasks}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--danger)' }} />
                <span>Overdue (Needs Attention)</span>
              </div>
              <span style={{ fontWeight: 700, color: overdueTasks > 0 ? 'var(--danger)' : 'inherit' }}>
                {overdueTasks}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Collaboration Overview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <TrendingUp size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Workflow Efficiency</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              TeamSync tracks workflow velocity across active teams. Assigned tasks and status changes automatically sync in real-time.
            </p>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                My Assigned Workload
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                {stats?.myAssignedTasksCount || 0}{' '}
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  tasks allocated directly to you
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/tasks" className="btn btn-secondary btn-sm" style={{ flex: 1, textDecoration: 'none' }}>
              <span>View Kanban Board</span>
              <ArrowRight size={14} />
            </Link>
            <Link to="/profile" className="btn btn-secondary btn-sm" style={{ flex: 1, textDecoration: 'none' }}>
              <span>My Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Tasks</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Latest activity across your active projects
            </p>
          </div>

          <Link to="/tasks" style={{ fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>View All Tasks</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {stats?.recentTasks && stats.recentTasks.length > 0 ? (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Team</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{task.title}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)' }}>{task.team?.name || 'General'}</span>
                    </td>
                    <td>
                      <span>{task.assignedTo?.name || 'Unassigned'}</span>
                    </td>
                    <td>
                      <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge badge-status-${task.status.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <CheckSquare size={28} />
            </div>
            <div className="empty-state-title">No tasks found</div>
            <div className="empty-state-desc">
              Create your first team task to track progress and collaborate with teammates.
            </div>
            <Link to="/tasks/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <PlusCircle size={16} />
              <span>Create Task to Get Started</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
