const prisma = require('../utils/prisma');

const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      take: 100
    });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAgentActions = async (req, res) => {
  try {
    const actions = await prisma.agentAction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        transaction: {
          select: { orderId: true, amount: true, currency: true, merchantId: true }
        }
      },
      take: 100
    });
    res.json(actions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSystemStats = async (req, res) => {
  try {
    const totalMerchants = await prisma.merchant.count();
    const totalTransactions = await prisma.transaction.count();
    const totalAgentActions = await prisma.agentAction.count();

    res.json({
      totalMerchants,
      totalTransactions,
      totalAgentActions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAuditLogs,
  getAgentActions,
  getSystemStats
};
