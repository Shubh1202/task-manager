const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Admin creates a new employee profile
 * @route   POST /api/users/employees
 * @access  Private (Admin only)
 */
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !name.trim()) {
      return next(ApiError.badRequest('Employee name is required.'));
    }

    if (!email || !email.trim()) {
      return next(ApiError.badRequest('Employee email is required.'));
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return next(ApiError.badRequest('Please provide a valid email address.'));
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return next(ApiError.conflict('A user with this email address already exists.'));
    }

    // Use provided password or fall back to default (min 6 chars required by model)
    const userPassword = password && password.trim() ? password.trim() : 'Emp@123456';

    const employee = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: userPassword,
      role: 'employee'
    });

    const employeeData = {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      createdAt: employee.createdAt
    };

    return ApiResponse.created({ employee: employeeData }, 'Employee profile created successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all employees (for admin assignment dropdown & employee management)
 * @route   GET /api/users/employees
 * @access  Private (Admin only)
 */
const getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'employee' })
      .select('-password')
      .sort({ createdAt: -1 });

    return ApiResponse.ok(
      { employees },
      'Employees retrieved successfully.',
      { count: employees.length }
    ).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single employee by ID
 * @route   GET /api/users/employees/:id
 * @access  Private (Admin only)
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findOne({ _id: req.params.id, role: 'employee' }).select('-password');

    if (!employee) {
      return next(ApiError.notFound('Employee not found.'));
    }

    return ApiResponse.ok({ employee }, 'Employee retrieved successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete employee profile (Admin only)
 * @route   DELETE /api/users/employees/:id
 * @access  Private (Admin only)
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findOneAndDelete({ _id: req.params.id, role: 'employee' });

    if (!employee) {
      return next(ApiError.notFound('Employee not found or already removed.'));
    }

    return ApiResponse.ok(null, 'Employee profile removed successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  deleteEmployee
};
