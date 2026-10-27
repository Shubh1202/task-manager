import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskApi, userApi } from '../services/api';
import { Navbar } from '../components/Navbar';
import { StatsCards } from '../components/StatsCards';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { EmployeeUpdateModal } from '../components/EmployeeUpdateModal';
import { CreateEmployeeModal } from '../components/CreateEmployeeModal';
import { EmployeeListModal } from '../components/EmployeeListModal';
import { Search, Plus, Filter, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const DashboardPage = () => {
  const { user, isAdmin } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [isEmpUpdateModalOpen, setIsEmpUpdateModalOpen] = useState(false);
  const [empUpdatingTask, setEmpUpdatingTask] = useState(null);

  const [isCreateEmpModalOpen, setIsCreateEmpModalOpen] = useState(false);
  const [isEmpListModalOpen, setIsEmpListModalOpen] = useState(false);

  const notify = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskApi.getTasks({
        status: statusFilter,
        priority: priorityFilter,
        assignedTo: assignedFilter,
        search: searchTerm
      });
      setTasks(res.tasks || []);
    } catch (err) {
      notify(err.message || 'Failed to fetch tasks.', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, assignedFilter, searchTerm]);

  const loadEmployees = useCallback(async () => {
    if (isAdmin) {
      try {
        const res = await userApi.getEmployees();
        setEmployees(res.employees || []);
      } catch (err) {
        console.error('Failed to load employees:', err);
      }
    }
  }, [isAdmin]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleSaveTask = async (formData) => {
    if (editingTask) {
      await taskApi.updateTask(editingTask._id, formData);
      notify('Task updated successfully.');
    } else {
      await taskApi.createTask(formData);
      notify('Task created and assigned.');
    }
    loadTasks();
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task? This action cannot be undone.')) {
      try {
        await taskApi.deleteTask(taskId);
        notify('Task deleted.');
        loadTasks();
      } catch (err) {
        notify(err.message || 'Failed to delete task.', 'error');
      }
    }
  };

  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      await taskApi.updateTaskStatus(taskId, newStatus);
      notify(`Status changed to ${newStatus}.`);
      loadTasks();
    } catch (err) {
      notify(err.message || 'Failed to update status.', 'error');
    }
  };

  const handleEmployeeProgressUpdate = async (taskId, updateData) => {
    await taskApi.updateTaskByEmployee(taskId, updateData);
    notify('Progress update saved.');
    loadTasks();
  };

  const handleCreateEmployee = async (empData) => {
    const res = await userApi.createEmployee(empData);
    notify(`Employee ${res.employee.name} created.`);
    loadEmployees();
  };

  const handleDeleteEmployee = async (empId) => {
    if (window.confirm('Remove this employee profile?')) {
      try {
        await userApi.deleteEmployee(empId);
        notify('Employee removed.');
        loadEmployees();
      } catch (err) {
        notify(err.message || 'Failed to remove employee.', 'error');
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 2000,
          background: toastMessage.type === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${toastMessage.type === 'error' ? '#ef4444' : '#10b981'}`,
          color: '#ffffff',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-modal)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: '500'
        }}>
          {toastMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onOpenNewTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenNewEmployee={() => setIsCreateEmpModalOpen(true)}
        onOpenEmployeeList={() => setIsEmpListModalOpen(true)}
      />

      {/* Main Content Area */}
      <div style={{ maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '24px' }}>
        {/* Page Title & Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                {isAdmin ? 'All Tasks' : 'My Assigned Tasks'}
              </h1>
              <span style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                padding: '1px 7px',
                borderRadius: 'var(--radius-pill)',
                fontWeight: '500'
              }}>
                {tasks.length}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {isAdmin
                ? 'Overview and management of organization tasks across all employees.'
                : 'Tasks assigned to you. Keep your statuses and progress notes updated.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              id="btn-refresh-tasks"
              className="btn btn-secondary btn-sm"
              onClick={() => loadTasks()}
              title="Refresh task list"
            >
              <RotateCw size={13} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>

            {isAdmin && (
              <button
                id="btn-main-create-task"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
              >
                <Plus size={14} />
                <span>New Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Metric Cards */}
        <StatsCards
          tasks={tasks}
          currentFilter={statusFilter}
          onSelectFilter={(st) => setStatusFilter(st)}
        />

        {/* Filter Toolbar */}
        <div className="card-surface" style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              id="task-search-input"
              className="form-input"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px', height: '34px', fontSize: '12px' }}
            />
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={13} color="var(--text-muted)" />
              <select
                id="filter-status-select"
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto', height: '34px', fontSize: '12px', padding: '0 8px' }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>

            <select
              id="filter-priority-select"
              className="form-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ width: 'auto', height: '34px', fontSize: '12px', padding: '0 8px' }}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            {isAdmin && (
              <select
                id="filter-employee-select"
                className="form-select"
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                style={{ width: 'auto', height: '34px', fontSize: '12px', padding: '0 8px' }}
              >
                <option value="all">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            )}

            {(statusFilter !== 'all' || priorityFilter !== 'all' || assignedFilter !== 'all' || searchTerm) && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setAssignedFilter('all');
                  setSearchTerm('');
                }}
                style={{ height: '34px', fontSize: '12px' }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Task Grid */}
        <main>
          {loading && tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="card-surface" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' }}>
                No tasks found
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 auto 16px auto', maxWidth: '360px' }}>
                {isAdmin
                  ? 'No tasks match the selected filters. You can create a new task to assign it to an employee.'
                  : 'You do not have any tasks matching these criteria.'}
              </p>
              {isAdmin && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                >
                  <Plus size={14} />
                  <span>Create Task</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px'
            }}>
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setIsTaskModalOpen(true);
                  }}
                  onDelete={handleDeleteTask}
                  onEmployeeUpdate={(t) => {
                    setEmpUpdatingTask(t);
                    setIsEmpUpdateModalOpen(true);
                  }}
                  onQuickStatusChange={handleQuickStatusChange}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Admin Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleSaveTask}
        initialData={editingTask}
        employees={employees}
      />

      {/* Employee Update Modal */}
      <EmployeeUpdateModal
        isOpen={isEmpUpdateModalOpen}
        onClose={() => setIsEmpUpdateModalOpen(false)}
        task={empUpdatingTask}
        onSubmit={handleEmployeeProgressUpdate}
      />

      {/* Admin Create Employee Modal */}
      <CreateEmployeeModal
        isOpen={isCreateEmpModalOpen}
        onClose={() => setIsCreateEmpModalOpen(false)}
        onCreated={handleCreateEmployee}
      />

      {/* Admin Employee List Modal */}
      <EmployeeListModal
        isOpen={isEmpListModalOpen}
        onClose={() => setIsEmpListModalOpen(false)}
        employees={employees}
        onDeleteEmployee={handleDeleteEmployee}
        onOpenCreateEmployee={() => setIsCreateEmpModalOpen(true)}
      />
    </div>
  );
};
