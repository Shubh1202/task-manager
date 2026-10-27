import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const EmployeeUpdateModal = ({ isOpen, onClose, task, onSubmit }) => {
  const [status, setStatus] = useState('pending');
  const [employeeNotes, setEmployeeNotes] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setStatus(task.status || 'pending');
      setEmployeeNotes(task.employeeNotes || '');
      setDescription(task.description || '');
      setError('');
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await onSubmit(task._id, {
        status,
        employeeNotes,
        description
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
              Update Task
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              {task.title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontSize: '12px',
            color: '#f87171',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Status Dropdown */}
          <div className="form-group">
            <label className="form-label" htmlFor="emp-update-status">Task Status</label>
            <select
              id="emp-update-status"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>

          {/* Employee Progress Notes / Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="emp-update-notes">Progress Notes</label>
            <textarea
              id="emp-update-notes"
              className="form-textarea"
              value={employeeNotes}
              onChange={(e) => setEmployeeNotes(e.target.value)}
              placeholder="Add your status update, blockers, or notes here..."
              rows={3}
            />
          </div>

          {/* Optional Task Description Amendment */}
          <div className="form-group">
            <label className="form-label" htmlFor="emp-update-desc">Task Description</label>
            <textarea
              id="emp-update-desc"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task instructions..."
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" id="btn-submit-emp-update" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? 'Saving...' : 'Save Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
