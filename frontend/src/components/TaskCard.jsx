import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, Edit2, Trash2, MessageSquare } from 'lucide-react';

const STATUS_MAP = {
  pending: { label: 'Pending', className: 'badge-pending' },
  'in-progress': { label: 'In Progress', className: 'badge-in-progress' },
  completed: { label: 'Completed', className: 'badge-completed' },
  'on-hold': { label: 'On Hold', className: 'badge-on-hold' }
};

const PRIORITY_MAP = {
  low: { label: 'Low', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
  medium: { label: 'Medium', color: '#d97706', bg: 'rgba(217, 119, 6, 0.08)' },
  high: { label: 'High', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' }
};

export const TaskCard = ({ task, onEdit, onDelete, onEmployeeUpdate, onQuickStatusChange }) => {
  const { isAdmin, user } = useAuth();

  const isAssignedToCurrent = task.assignedTo?._id === user?.id || task.assignedTo?._id === user?._id;
  const statusInfo = STATUS_MAP[task.status] || { label: task.status, className: 'badge-pending' };
  const priorityInfo = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;

  return (
    <div
      className="card-surface"
      id={`task-card-${task._id}`}
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px'
      }}
    >
      <div>
        {/* Top Meta: Status and Priority */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span className={`badge ${statusInfo.className}`}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
            {statusInfo.label}
          </span>

          <span style={{
            fontSize: '11px',
            fontWeight: '500',
            color: priorityInfo.color,
            background: priorityInfo.bg,
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)'
          }}>
            {priorityInfo.label} Priority
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          lineHeight: '1.4',
          marginBottom: '6px'
        }}>
          {task.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
          marginBottom: '12px',
          whiteSpace: 'pre-wrap'
        }}>
          {task.description}
        </p>

        {/* Employee Notes / Progress Update */}
        {task.employeeNotes && (
          <div style={{
            background: 'var(--bg-input)',
            borderLeft: '2px solid var(--primary)',
            padding: '8px 10px',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '500', color: 'var(--primary)', marginBottom: '2px' }}>
              <MessageSquare size={12} />
              <span>Progress Note:</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              {task.employeeNotes}
            </p>
          </div>
        )}
      </div>

      <div>
        {/* Assignment & Meta Details */}
        <div style={{
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <User size={13} color="var(--text-muted)" />
              <span>Assigned:</span>
            </span>
            <span style={{ fontWeight: '500', color: isAssignedToCurrent ? 'var(--primary)' : 'var(--text-primary)' }}>
              {isAssignedToCurrent ? 'You' : task.assignedTo?.name || 'Unassigned'}
            </span>
          </div>

          {task.dueDate && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={13} color="var(--text-muted)" />
                <span>Due Date:</span>
              </span>
              <span style={{ color: 'var(--text-primary)' }}>
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Actions Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          {/* Quick status dropdown */}
          <select
            id={`quick-status-${task._id}`}
            value={task.status}
            onChange={(e) => onQuickStatusChange(task._id, e.target.value)}
            className="form-select"
            style={{
              height: '28px',
              padding: '0 8px',
              fontSize: '12px',
              width: 'auto',
              background: 'var(--bg-subtle)'
            }}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Employee Action: Update progress and notes */}
            {!isAdmin && isAssignedToCurrent && (
              <button
                id={`btn-emp-update-${task._id}`}
                className="btn btn-secondary btn-sm"
                onClick={() => onEmployeeUpdate(task)}
                style={{ height: '28px', padding: '0 8px', fontSize: '12px' }}
              >
                <Edit2 size={12} />
                <span>Update</span>
              </button>
            )}

            {/* Admin Actions: Edit task or Delete */}
            {isAdmin && (
              <>
                <button
                  id={`btn-admin-edit-${task._id}`}
                  className="btn btn-secondary btn-sm"
                  onClick={() => onEdit(task)}
                  style={{ height: '28px', padding: '0 8px', fontSize: '12px' }}
                  title="Edit task details"
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </button>
                <button
                  id={`btn-admin-delete-${task._id}`}
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(task._id)}
                  style={{ height: '28px', padding: '0 8px', fontSize: '12px' }}
                  title="Delete task"
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
