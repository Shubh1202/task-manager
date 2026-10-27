require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./src/config/db');
const seedDefaultAdmin = require('./src/utils/seedAdmin');
const apiRoutes = require('./src/routes/index');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Task Manager Backend API',
    version: '1.0.0'
  });
});

app.use('/api', apiRoutes);


// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect Database and start listening
connectDB().then(() => {
  seedDefaultAdmin().then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] Server is running on port ${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    });
  });
});

module.exports = app;
