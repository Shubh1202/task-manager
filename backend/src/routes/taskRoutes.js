const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskByEmployee,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

// All task routes require authentication
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(restrictTo('admin'), createTask);

router.route('/:id')
  .get(getTaskById)
  .put(restrictTo('admin'), updateTask)
  .delete(restrictTo('admin'), deleteTask);

// Status and description/notes updates for employee or admin
router.patch('/:id/employee-update', updateTaskByEmployee);
router.patch('/:id/status', updateTaskStatus);

module.exports = router;
