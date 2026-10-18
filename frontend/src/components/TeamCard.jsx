import React from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckSquare, ShieldCheck, ArrowRight } from 'lucide-react';

const TeamCard = ({ team }) => {
  const memberCount = team.members ? team.members.length : 0;
  const isOwnerOrAdmin = team.currentUserRole === 'Admin';

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        gap: '1.25rem',
      }}
    >
      <div>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span
            className={`badge ${
              isOwnerOrAdmin ? 'badge-role-admin' : 'badge-role-member'
            }`}
          >
            {isOwnerOrAdmin ? <ShieldCheck size={12} /> : null}
            <span>{team.currentUserRole || 'Member'}</span>
          </span>

          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Users size={14} />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </span>
        </div>

        {/* Team Name */}
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          {team.name}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {team.description || 'No description provided for this team.'}
        </p>
      </div>

      {/* Footer Metrics & Action Link */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <CheckSquare size={14} color="var(--primary)" />
          <span>{team.totalTasks || 0} tasks</span>
        </div>

        <Link
          to={`/teams/${team._id}`}
          className="btn btn-secondary btn-sm"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <span>View Team</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default TeamCard;
