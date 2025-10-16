const express = require('express');
const { getProfiles, createProfile } = require('../controllers/profileController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/profiles
router.get('/profiles', authMiddleware, getProfiles);

// POST /api/profiles
router.post('/profiles', authMiddleware, createProfile);

module.exports = router;