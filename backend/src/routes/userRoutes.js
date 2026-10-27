const express = require('express');
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  deleteEmployee
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

// All employee management routes are restricted to Admin
router.use(protect);
router.use(restrictTo('admin'));

router.route('/employees')
  .post(createEmployee)
  .get(getEmployees);

router.route('/employees/:id')
  .get(getEmployeeById)
  .delete(deleteEmployee);

module.exports = router;
