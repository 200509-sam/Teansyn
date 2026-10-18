import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { teamAPI, taskAPI } from '../services/api';
import Modal from '../components/Modal';
import TaskCard from '../components/TaskCard';
import {
  Users,
  UserPlus,
  Trash2,
  Edit,
  Shield,
  UserCheck,
  CheckSquare,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

const TeamDetails = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [addMemberRole, setAddMemberRole] = useState('Member');
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [addMemberError, setAddMemberError] = useState('');

  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError('');
      const [teamData, tasksData] = await Promise.all([
        teamAPI.getById(teamId),
        taskAPI.getAll({ team: teamId }),
      ]);
      setTeam(teamData);
      setEditName(teamData.name);
      setEditDescription(teamData.description || '');
      setTasks(tasksData);
    } catch (err) {
      setError(err.message || 'Failed to load team details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addMemberEmail.trim()) {
      setAddMemberError('Please enter user email');
      return;
    }

    setAddMemberLoading(true);
    setAddMemberError('');

    try {
      await teamAPI.addMember(teamId, {
        email: addMemberEmail.trim(),
        role: addMemberRole,
      });
      setActionSuccess('Member successfully added to team!');
      setIsAddMemberOpen(false);
      setAddMemberEmail('');
      setTimeout(() => setActionSuccess(''), 4000);
      fetchTeamData();
    } catch (err) {
      setAddMemberError(err.message || 'Could not add member');
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this team?`)) {
      return;
    }

    try {
      await teamAPI.removeMember(teamId, userId);
      setActionSuccess(`${memberName} removed from the team`);
      setTimeout(() => setActionSuccess(''), 4000);
      fetchTeamData();
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    }
  };

  const handleEditTeam = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditError('Team name cannot be empty');
      return;
    }

    setEditLoading(true);
    setEditError('');

    try {
      const updated = await teamAPI.update(teamId, {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      setTeam({ ...team, name: updated.name, description: updated.description });
      setIsEditTeamOpen(false);
      setActionSuccess('Team details updated successfully!');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setEditError(err.message || 'Failed to update team');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    setDeleteLoading(true);
    try {
      await teamAPI.delete(teamId);
      navigate('/teams', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to delete team');
      setDeleteConfirmOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

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
      fetchTeamData(); // update member assigned task count
    } catch (err) {
      alert(err.message || 'Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading team workspace...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <AlertCircle size={40} color="var(--danger)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Unable to access team</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          {error || 'The requested team does not exist or you do not have permission to view it.'}
        </p>
        <Link to="/teams" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Teams</span>
        </Link>
      </div>
    );
  }

  const isAdmin = team.currentUserRole === 'Admin';

  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/teams"
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
          <span>Back to all teams</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="alert alert-success" role="alert">
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Team Header Card */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{team.name}</h1>
              <span
                className={`badge ${
                  isAdmin ? 'badge-role-admin' : 'badge-role-member'
                }`}
              >
                {isAdmin ? <Shield size={12} /> : null}
                <span>Your Role: {team.currentUserRole}</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '750px', lineHeight: 1.5 }}>
              {team.description || 'No description provided.'}
            </p>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setIsEditTeamOpen(true)}
                className="btn btn-secondary btn-sm"
              >
                <Edit size={14} />
                <span>Edit Team</span>
              </button>
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="btn btn-danger btn-sm"
              >
                <Trash2 size={14} />
                <span>Delete Team</span>
              </button>
            </div>
          )}
        </div>

        {/* Team Metadata Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            Created by: <strong style={{ color: 'var(--text-main)' }}>{team.owner?.name}</strong> ({team.owner?.email})
          </div>
          <div>
            Total Roster: <strong style={{ color: 'var(--text-main)' }}>{team.members.length}</strong>
          </div>
          <div>
            Active Tasks: <strong style={{ color: 'var(--text-main)' }}>{tasks.length}</strong>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Team Members</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Roster of collaborators participating in this team
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <UserPlus size={16} />
              <span>Add Member by Email</span>
            </button>
          )}
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Assigned Tasks</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {team.members.map((member) => {
                const memberId = member.user?._id;
                const isTeamOwner = team.owner?._id === memberId;

                return (
                  <tr key={memberId || Math.random()}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                          }}
                        >
                          {member.user?.name ? member.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span style={{ fontWeight: 600 }}>{member.user?.name || 'Unknown User'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)' }}>{member.user?.email}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          member.role === 'Admin' ? 'badge-role-admin' : 'badge-role-member'
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: member.assignedTasksCount > 0 ? 'var(--primary)' : 'var(--text-subtle)',
                        }}
                      >
                        {member.assignedTasksCount} {member.assignedTasksCount === 1 ? 'task' : 'tasks'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        {isTeamOwner ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                            Owner (Protected)
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRemoveMember(memberId, member.user?.name)}
                            className="btn btn-danger btn-sm"
                            title="Remove member from team"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Tasks Section */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Team Tasks</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              All tasks assigned within this workspace
            </p>
          </div>

          <Link
            to={`/tasks/create?teamId=${teamId}`}
            className="btn btn-primary btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <PlusCircle size={16} />
            <span>Create Team Task</span>
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <CheckSquare size={28} />
            </div>
            <div className="empty-state-title">No tasks for this team yet</div>
            <div className="empty-state-desc">
              Create and assign tasks to your team members to kick off project progress.
            </div>
            <Link
              to={`/tasks/create?teamId=${teamId}`}
              className="btn btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <PlusCircle size={16} />
              <span>Create Task</span>
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
                canDelete={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => {
          setIsAddMemberOpen(false);
          setAddMemberError('');
        }}
        title="Add Team Member"
      >
        {addMemberError && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={16} />
            <span>{addMemberError}</span>
          </div>
        )}

        <form onSubmit={handleAddMember}>
          <div className="form-group">
            <label className="form-label" htmlFor="memberEmail">
              Registered User Email *
            </label>
            <input
              id="memberEmail"
              type="email"
              className="form-input"
              placeholder="e.g. teammate@example.com"
              value={addMemberEmail}
              onChange={(e) => setAddMemberEmail(e.target.value)}
              required
              autoFocus
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
              The user must already have registered an account on TeamSync with this email.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="memberRole">
              Role in Team
            </label>
            <select
              id="memberRole"
              className="form-select"
              value={addMemberRole}
              onChange={(e) => setAddMemberRole(e.target.value)}
            >
              <option value="Member">Member (Can view, create & update status)</option>
              <option value="Admin">Admin (Can manage roster, tasks & team info)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddMemberOpen(false)}
              disabled={addMemberLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={addMemberLoading}
            >
              {addMemberLoading ? 'Adding Member...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Team Modal */}
      <Modal
        isOpen={isEditTeamOpen}
        onClose={() => {
          setIsEditTeamOpen(false);
          setEditError('');
        }}
        title="Edit Team Details"
      >
        {editError && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={16} />
            <span>{editError}</span>
          </div>
        )}

        <form onSubmit={handleEditTeam}>
          <div className="form-group">
            <label className="form-label" htmlFor="editTeamName">
              Team Name *
            </label>
            <input
              id="editTeamName"
              type="text"
              className="form-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editTeamDesc">
              Description
            </label>
            <textarea
              id="editTeamDesc"
              className="form-textarea"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditTeamOpen(false)}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Team Deletion"
      >
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-main)' }}>{team.name}</strong>?
          This will permanently delete this team and all <strong style={{ color: 'var(--danger)' }}>{tasks.length} associated tasks</strong>.
          This action cannot be undone.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleteLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDeleteTeam}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TeamDetails;
