const prisma = require('../utils/prisma');

const getDashboardMetrics = async (req, res) => {
  try {
    const merchantId = req.user.merchant?.id;
    if (!merchantId) {
      return res.status(403).json({ message: 'User is not a merchant' });
    }

    const totalTransactions = await prisma.transaction.count({
      where: { merchantId }
    });

    const successfulTransactions = await prisma.transaction.count({
      where: { merchantId, status: 'SUCCESS' }
    });

    const failedTransactions = await prisma.transaction.count({
      where: { merchantId, status: 'FAILED' }
    });

    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

    // Get simple daily trend
    const recentTransactions = await prisma.transaction.findMany({
      where: { merchantId },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    res.json({
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      successRate: successRate.toFixed(2),
      recentTransactions
    });

  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const merchantId = req.user.merchant?.id;
    if (!merchantId) {
      return res.status(403).json({ message: 'User is not a merchant' });
    }

    const { status, limit = 50, offset = 0, search } = req.query;

    const where = { merchantId };
    
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search } },
        { orderId: { contains: search } },
        { customerReference: { contains: search } }
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      take: Number(limit),
      skip: Number(offset),
      orderBy: { timestamp: 'desc' },
      include: {
        paymentAttempts: true
      }
    });

    const total = await prisma.transaction.count({ where });

    res.json({
      transactions,
      total,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const merchantId = req.user.merchant?.id;
    if (!merchantId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: {
        paymentAttempts: true,
        recommendations: true,
        supportCases: true,
        agentActions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (req.user.role !== 'ADMIN' && transaction.merchantId !== merchantId) {
      return res.status(403).json({ message: 'Not authorized to view this transaction' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardMetrics,
  getTransactions,
  getTransactionById
};
