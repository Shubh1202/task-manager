const Task = require('../models/Task');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const VALID_STATUSES = ['pending', 'in-progress', 'completed', 'on-hold'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

/**
 * @desc    Create a new task assigned to an employee
 * @route   POST /api/tasks
 * @access  Private (Admin only)
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    if (!title || !title.trim()) {
      return next(ApiError.badRequest('Task title is required.'));
    }
    if (!description || !description.trim()) {
      return next(ApiError.badRequest('Task description is required.'));
    }
    if (!assignedTo) {
      return next(ApiError.badRequest('Please assign the task to an employee.'));
    }

    // Validate that the assignee exists and is an employee
    const employee = await User.findById(assignedTo);
    if (!employee || employee.role !== 'employee') {
      return next(ApiError.badRequest('Assigned user does not exist or is not an employee.'));
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return next(ApiError.badRequest(`Invalid priority. Allowed values: ${VALID_PRIORITIES.join(', ')}.`));
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      status: 'pending'
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    return ApiResponse.created({ task: populatedTask }, 'Task created and assigned successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get tasks:
 *            - Admin sees ALL tasks (with optional filters)
 *            - Employee sees ONLY tasks assigned to them
 * @route   GET /api/tasks
 * @access  Private (Admin and Employee)
 */
const getTasks = async (req, res, next) => {
  try {
    const query = {};

    // Role-based access filtering
    if (req.user.role === 'employee') {
      query.assignedTo = req.user._id;
    } else if (req.query.assignedTo) {
      // Admin: optional filter by specific employee
      query.assignedTo = req.query.assignedTo;
    }

    // Optional status filter
    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      query.status = req.query.status;
    }

    // Optional priority filter
    if (req.query.priority && VALID_PRIORITIES.includes(req.query.priority)) {
      query.priority = req.query.priority;
    }

    // Optional full-text search on title and description
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    return ApiResponse.ok(
      { tasks },
      'Tasks retrieved successfully.',
      { count: tasks.length }
    ).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!task) {
      return next(ApiError.notFound('Task not found.'));
    }

    // Employees can only view tasks assigned to them
    if (req.user.role === 'employee' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('Access denied. You can only view tasks assigned to you.'));
    }

    return ApiResponse.ok({ task }, 'Task retrieved successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin updates full task details
 * @route   PUT /api/tasks/:id
 * @access  Private (Admin only)
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(ApiError.notFound('Task not found.'));
    }

    const { title, description, assignedTo, status, priority, dueDate, employeeNotes } = req.body;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return next(ApiError.badRequest(`Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}.`));
      }
      task.status = status;
    }

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return next(ApiError.badRequest(`Invalid priority. Allowed values: ${VALID_PRIORITIES.join(', ')}.`));
      }
      task.priority = priority;
    }

    if (dueDate !== undefined) task.dueDate = dueDate;
    if (employeeNotes !== undefined) task.employeeNotes = employeeNotes.trim();

    if (assignedTo !== undefined) {
      const employee = await User.findById(assignedTo);
      if (!employee || employee.role !== 'employee') {
        return next(ApiError.badRequest('Assigned user does not exist or is not an employee.'));
      }
      task.assignedTo = assignedTo;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    return ApiResponse.ok({ task: updatedTask }, 'Task updated successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Employee updates task status and/or progress notes
 * @route   PATCH /api/tasks/:id/employee-update
 * @access  Private (Employee or Admin)
 */
const updateTaskByEmployee = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(ApiError.notFound('Task not found.'));
    }

    // Employees can only update tasks assigned to them
    if (req.user.role === 'employee' && task.assignedTo.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('Access denied. You can only update tasks assigned to you.'));
    }

    const { status, employeeNotes, description } = req.body;

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return next(ApiError.badRequest(`Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}.`));
      }
      task.status = status;
    }

    if (employeeNotes !== undefined) {
      task.employeeNotes = employeeNotes.trim();
    }

    if (description !== undefined && description.trim() !== '') {
      task.description = description.trim();
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    return ApiResponse.ok({ task: updatedTask }, 'Task progress updated successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task status (Common endpoint for Admin or assigned Employee)
 * @route   PATCH /api/tasks/:id/status
 * @access  Private
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return next(ApiError.badRequest(`Please provide a valid status. Allowed values: ${VALID_STATUSES.join(', ')}.`));
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return next(ApiError.notFound('Task not found.'));
    }

    // Employees can only update status of tasks assigned to them
    if (req.user.role === 'employee' && task.assignedTo.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('Access denied. You can only update the status of tasks assigned to you.'));
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    return ApiResponse.ok({ task: updatedTask }, `Task status updated to "${status}".`).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private (Admin only)
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return next(ApiError.notFound('Task not found or already deleted.'));
    }

    return ApiResponse.ok(null, 'Task deleted successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskByEmployee,
  updateTaskStatus,
  deleteTask
};
