import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskAPI } from '../services/api';
import {
  User,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Circle,
  LogOut,
  AlertCircle,
  CheckSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const data = await taskAPI.getAll({ assignedTo: 'me' });
      setMyTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to load assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updated = await taskAPI.update(taskId, { status: newStatus });
      setMyTasks(myTasks.map((t) => (t._id === taskId ? updated : t)));
    } catch (err) {
      alert(err.message || 'Failed to update task status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const completedCount = myTasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = myTasks.filter((t) => t.status === 'In Progress').length;
  const todoCount = myTasks.filter((t) => t.status === 'To Do').length;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2rem',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {user?.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <Mail size={15} />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} className="btn btn-secondary">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Task Assignment Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Assigned To Me
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{myTasks.length}</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            To Do
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#94a3b8' }}>{todoCount}</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <div style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            In Progress
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>{inProgressCount}</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <div style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Completed
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>{completedCount}</div>
        </div>
      </div>

      {/* Assigned Tasks Roster */}
      <div className="card">
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>My Assigned Tasks</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            All active tasks assigned to your account across all team workspaces
          </p>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)' }}>Loading your workload...</p>
          </div>
        ) : myTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <CheckSquare size={28} />
            </div>
            <div className="empty-state-title">No assigned tasks</div>
            <div className="empty-state-desc">
              You currently do not have any tasks assigned to you.
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Team</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {myTasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{task.title}</span>
                    </td>
                    <td>{task.team?.name || 'General'}</td>
                    <td>
                      <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
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
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
