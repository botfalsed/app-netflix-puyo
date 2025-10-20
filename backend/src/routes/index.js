const express = require('express');
const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const contentRoutes = require('./contentRoutes');
const streamRoutes = require('./streamRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => res.json({ ok: true }));

// Mount auth routes
router.use('/api', authRoutes);

// Mount profile routes  
router.use('/api', profileRoutes);

// Mount content routes
router.use('/api/content', contentRoutes);

// Mount stream routes (MP4 transcoding)
router.use('/api/stream', streamRoutes);

module.exports = router;