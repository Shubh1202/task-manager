const BASE_URL = '/api';

/**
 * Universal fetch wrapper that manages headers, JWT auth, and error parsing.
 * All API responses now follow the shape:
 *   { success, message, data: { ... }, meta?: { ... } }
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('tm_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    // On 401, clear the stored session and dispatch a logout event
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('tm_token');
      localStorage.removeItem('tm_user');
      window.dispatchEvent(new Event('auth-logout'));
    }
    const error = new Error(json.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.errors = json.errors || [];
    error.data = json;
    throw error;
  }

  // Return the `data` payload from the standardized ApiResponse
  return json.data !== undefined ? json.data : json;
}

// ─── Authentication API ──────────────────────────────────────────────────────
export const authApi = {
  /**
   * Login with email and password.
   * Returns: { token, user }
   */
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  /**
   * Get current authenticated user.
   * Returns: { user }
   */
  getMe: () => request('/auth/me')
};

// ─── Task Management API ─────────────────────────────────────────────────────
export const taskApi = {
  /**
   * Get tasks list with optional filters.
   * Returns: { tasks }
   */
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
    if (params.assignedTo && params.assignedTo !== 'all') query.append('assignedTo', params.assignedTo);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/tasks${queryString}`);
  },

  /**
   * Get a single task by ID.
   * Returns: { task }
   */
  getTaskById: (id) => request(`/tasks/${id}`),

  /**
   * Create a new task (Admin only).
   * Returns: { task }
   */
  createTask: (taskData) =>
    request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    }),

  /**
   * Admin updates full task details.
   * Returns: { task }
   */
  updateTask: (id, taskData) =>
    request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    }),

  /**
   * Employee updates status and progress notes.
   * Returns: { task }
   */
  updateTaskByEmployee: (id, updateData) =>
    request(`/tasks/${id}/employee-update`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    }),

  /**
   * Quick status update for task.
   * Returns: { task }
   */
  updateTaskStatus: (id, status) =>
    request(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  /**
   * Delete a task (Admin only).
   */
  deleteTask: (id) =>
    request(`/tasks/${id}`, {
      method: 'DELETE'
    })
};

// ─── Employee / User Management API (Admin only) ─────────────────────────────
export const userApi = {
  /**
   * Get list of all employees.
   * Returns: { employees }
   */
  getEmployees: () => request('/users/employees'),

  /**
   * Create a new employee profile.
   * Returns: { employee }
   */
  createEmployee: (employeeData) =>
    request('/users/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData)
    }),

  /**
   * Remove an employee profile.
   */
  deleteEmployee: (id) =>
    request(`/users/employees/${id}`, {
      method: 'DELETE'
    })
};
