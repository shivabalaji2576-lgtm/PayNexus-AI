const express = require('express');
const router = express.Router();
const { getAuditLogs, getAgentActions, getSystemStats } = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

router.get('/audit-logs', getAuditLogs);
router.get('/agent-actions', getAgentActions);
router.get('/stats', getSystemStats);

module.exports = router;
