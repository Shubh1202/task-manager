const User = require('../models/User');

const seedDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const defaultAdmin = {
        name: process.env.ADMIN_DEFAULT_NAME || 'System Administrator',
        email: process.env.ADMIN_DEFAULT_EMAIL || 'admin@taskmanager.com',
        password: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123',
        role: 'admin'
      };

      const created = await User.create(defaultAdmin);
      console.log('------------------------------------------------------------');
      console.log(' [BOOTSTRAP] Default Admin Account Created Successfully:');
      console.log(` Email   : ${created.email}`);
      console.log('------------------------------------------------------------');
    }
  } catch (error) {
    console.error(`[Admin Seed Error]: ${error.message}`);
  }
};

module.exports = seedDefaultAdmin;
