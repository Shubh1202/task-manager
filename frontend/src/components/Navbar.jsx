import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LogOut, Shield, User, Plus, Users } from 'lucide-react';

export const Navbar = ({ onOpenNewTask, onOpenNewEmployee, onOpenEmployeeList }) => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <CheckSquare size={16} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
            Task Manager
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            v1.0
          </span>
        </div>
      </div>

      {/* Admin Action Shortcuts */}
      {isAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            id="nav-create-task-btn"
            className="btn btn-primary btn-sm"
            onClick={onOpenNewTask}
          >
            <Plus size={14} />
            <span>Create Task</span>
          </button>
          <button
            id="nav-create-emp-btn"
            className="btn btn-secondary btn-sm"
            onClick={onOpenNewEmployee}
          >
            <Plus size={14} />
            <span>Add Employee</span>
          </button>
          <button
            id="nav-view-emp-btn"
            className="btn btn-secondary btn-sm"
            onClick={onOpenEmployeeList}
          >
            <Users size={14} />
            <span>Employees</span>
          </button>
        </div>
      )}

      {/* User profile & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-pill)',
            background: isAdmin ? '#3730a3' : '#075985',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', lineHeight: '1.2' }}>
              {user?.name || 'User'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className={`badge ${isAdmin ? 'badge-role-admin' : 'badge-role-employee'}`} style={{ height: '16px', fontSize: '9px', padding: '0 4px' }}>
                {user?.role}
              </span>
              <span>{user?.email}</span>
            </span>
          </div>
        </div>

        <button
          id="logout-btn"
          className="btn btn-secondary btn-sm"
          onClick={logout}
          style={{ height: '28px', padding: '0 8px', color: 'var(--text-secondary)' }}
          title="Sign Out"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
