const express = require('express');
const router = express.Router();
const { chat, getConversations, getConversationMessages, confirmAgentAction } = require('../controllers/ai.controller');
const { protect, merchant } = require('../middleware/auth');

router.use(protect, merchant);

router.post('/chat', chat);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationMessages);
router.post('/agent/confirm', confirmAgentAction);

module.exports = router;
