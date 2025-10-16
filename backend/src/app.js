const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { initializeDatabase } = require('./config/database');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();

// Routes
app.use('/', routes);

module.exports = app;