const express = require('express');
const router = express.Router();
const { getDashboardMetrics, getTransactions, getTransactionById } = require('../controllers/transaction.controller');
const { protect, merchant } = require('../middleware/auth');

router.use(protect, merchant);

router.get('/dashboard', getDashboardMetrics);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);

module.exports = router;
