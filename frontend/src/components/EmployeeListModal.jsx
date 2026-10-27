import React from 'react';
import { X, Plus, Trash2, Mail } from 'lucide-react';

export const EmployeeListModal = ({ isOpen, onClose, employees = [], onDeleteEmployee, onOpenCreateEmployee }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
              Employees
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              {employees.length} registered {employees.length === 1 ? 'employee' : 'employees'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                onClose();
                onOpenCreateEmployee();
              }}
            >
              <Plus size={13} />
              <span>Add Employee</span>
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {employees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '13px', margin: '0 0 12px 0' }}>No employees registered yet.</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                onClose();
                onOpenCreateEmployee();
              }}
            >
              <Plus size={13} />
              <span>Add Employee</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
            {employees.map((emp) => (
              <div
                key={emp._id}
                id={`emp-row-${emp._id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-pill)',
                    background: '#1e293b',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '12px'
                  }}>
                    {emp.name ? emp.name[0].toUpperCase() : 'E'}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {emp.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={11} />
                        {emp.email}
                      </span>
                      {emp.createdAt && (
                        <span>• Added {new Date(emp.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  id={`btn-del-emp-${emp._id}`}
                  className="btn btn-danger btn-sm"
                  onClick={() => onDeleteEmployee(emp._id)}
                  title="Remove Employee"
                  style={{ height: '26px', padding: '0 8px' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
