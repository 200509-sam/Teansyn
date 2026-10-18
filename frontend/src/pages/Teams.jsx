import React, { useState, useEffect } from 'react';
import { teamAPI } from '../services/api';
import TeamCard from '../components/TeamCard';
import Modal from '../components/Modal';
import { Users, PlusCircle, AlertCircle, Layers } from 'lucide-react';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
  });

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await teamAPI.getAll();
      setTeams(data);
    } catch (err) {
      setError(err.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTeam.name.trim()) {
      setCreateError('Team name is required');
      return;
    }

    setCreateLoading(true);
    setCreateError('');

    try {
      const created = await teamAPI.create(newTeam);
      setTeams([created, ...teams]);
      setIsModalOpen(false);
      setNewTeam({ name: '', description: '' });
      fetchTeams(); // refresh to get aggregated counts
    } catch (err) {
      setCreateError(err.message || 'Failed to create team');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
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
            Teams & Workspaces
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Collaborate on shared tasks and track team assignments
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <PlusCircle size={18} />
          <span>Create New Team</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading your teams...</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Users size={28} />
          </div>
          <div className="empty-state-title">No teams yet</div>
          <div className="empty-state-desc">
            Create your first team to invite colleagues, assign tasks, and monitor project workflows.
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <PlusCircle size={16} />
            <span>Create your first team</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {teams.map((team) => (
            <TeamCard key={team._id} team={team} />
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCreateError('');
        }}
        title="Create a New Team"
      >
        {createError && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={16} />
            <span>{createError}</span>
          </div>
        )}

        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="teamName">
              Team Name *
            </label>
            <input
              id="teamName"
              type="text"
              className="form-input"
              placeholder="e.g. AI Innovators, Backend Core, Mobile App"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="teamDescription">
              Description
            </label>
            <textarea
              id="teamDescription"
              className="form-textarea"
              placeholder="Brief description of the team's purpose and scope..."
              value={newTeam.description}
              onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
              rows={3}
            />
          </div>

          <div
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '1.25rem',
            }}
          >
            <strong>Note:</strong> You will automatically be assigned as the <strong>Admin</strong> of this team and can invite additional teammates using their registered email.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={createLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createLoading}
            >
              {createLoading ? 'Creating Team...' : 'Create Team'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teams;
