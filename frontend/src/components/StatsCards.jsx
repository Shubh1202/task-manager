import React from 'react';
import { Layers, Clock, CheckCircle2, PauseCircle, PlayCircle } from 'lucide-react';

export const StatsCards = ({ tasks = [], currentFilter = 'all', onSelectFilter }) => {
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const onHold = tasks.filter((t) => t.status === 'on-hold').length;

  const items = [
    {
      id: 'all',
      label: 'All Tasks',
      count: total,
      icon: Layers,
      color: 'var(--text-secondary)'
    },
    {
      id: 'pending',
      label: 'Pending',
      count: pending,
      icon: Clock,
      color: 'var(--status-pending)'
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      count: inProgress,
      icon: PlayCircle,
      color: 'var(--status-inprogress)'
    },
    {
      id: 'completed',
      label: 'Completed',
      count: completed,
      icon: CheckCircle2,
      color: 'var(--status-completed)'
    },
    {
      id: 'on-hold',
      label: 'On Hold',
      count: onHold,
      icon: PauseCircle,
      color: 'var(--status-onhold)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '12px',
      marginBottom: '20px'
    }}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentFilter === item.id;

        return (
          <button
            key={item.id}
            id={`stat-card-${item.id}`}
            type="button"
            onClick={() => onSelectFilter(item.id)}
            style={{
              background: isActive ? 'var(--bg-subtle)' : 'var(--bg-surface)',
              border: `1px solid ${isActive ? 'var(--border-strong)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              transition: 'background-color 120ms ease, border-color 120ms ease',
              outline: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                {item.label}
              </span>
              <Icon size={14} style={{ color: item.color }} />
            </div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.2' }}>
              {item.count}
            </div>
          </button>
        );
      })}
    </div>
  );
};
