import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  PlusCircle,
  User,
  X,
  Layers,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Teams', path: '/teams', icon: Users },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Create Task', path: '/tasks/create', icon: PlusCircle },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 90,
          }}
          className="mobile-backdrop"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 95,
          transition: 'transform 0.25s ease',
        }}
        className={`app-sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      >
        {/* Sidebar Header */}
        <div
          style={{
            height: 'var(--navbar-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={22} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
              Workspace
            </span>
          </div>

          <button
            onClick={onClose}
            className="btn-icon mobile-close-btn"
            style={{ display: 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1.25rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          <div
            style={{
              padding: '0 0.65rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-subtle)',
              letterSpacing: '0.05em',
            }}
          >
            Main Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} color={isActive ? 'var(--primary)' : 'currentColor'} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div
          style={{
            padding: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              TeamSync Platform
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              SDE Collaboration Suite
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
