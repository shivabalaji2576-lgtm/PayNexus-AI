const prisma = require('../utils/prisma');

// Tool definitions for OpenAI function calling
const toolsDefinition = [
  {
    type: 'function',
    function: {
      name: 'getTransaction',
      description: 'Retrieves detailed information about a specific transaction by its ID.',
      parameters: {
        type: 'object',
        properties: {
          transactionId: {
            type: 'string',
            description: 'The unique identifier of the transaction.'
          }
        },
        required: ['transactionId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'searchTransactions',
      description: 'Searches database transactions using filters like status or amount.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['SUCCESS', 'FAILED', 'PENDING'], description: 'Filter by transaction status' },
          limit: { type: 'integer', description: 'Number of transactions to return (max 20)', default: 10 }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'analyzeFailure',
      description: 'Analyzes payment failure information and returns related context.',
      parameters: {
        type: 'object',
        properties: {
          transactionId: { type: 'string' }
        },
        required: ['transactionId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'createRefundRecommendation',
      description: 'Creates a refund recommendation for a failed or disputed transaction. This requires user authorization.',
      parameters: {
        type: 'object',
        properties: {
          transactionId: { type: 'string' },
          reason: { type: 'string', description: 'Reason for the refund' }
        },
        required: ['transactionId', 'reason']
      }
    }
  }
];

// Tool implementations
const toolHandlers = {
  getTransaction: async ({ transactionId }, merchantId) => {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { paymentAttempts: true }
    });
    if (!tx) return { error: 'Transaction not found' };
    if (tx.merchantId !== merchantId) return { error: 'Not authorized for this transaction' };
    return tx;
  },
  searchTransactions: async ({ status, limit = 10 }, merchantId) => {
    const transactions = await prisma.transaction.findMany({
      where: {
        merchantId,
        ...(status ? { status } : {})
      },
      take: Math.min(limit, 50),
      orderBy: { timestamp: 'desc' }
    });
    return { count: transactions.length, transactions };
  },
  analyzeFailure: async ({ transactionId }, merchantId) => {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { paymentAttempts: true }
    });
    if (!tx || tx.merchantId !== merchantId) return { error: 'Transaction not found' };
    
    // Find similar failures for the merchant in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const similarFailures = await prisma.transaction.count({
      where: {
        merchantId,
        status: 'FAILED',
        failureReason: tx.failureReason,
        timestamp: { gte: sevenDaysAgo }
      }
    });

    return {
      transaction: tx,
      analysis: {
        similarFailuresCountLast7Days: similarFailures,
        commonCauses: tx.failureReason === 'INSUFFICIENT_FUNDS' ? 'Customer account does not have enough balance.' :
                      tx.failureReason === 'HIGH_RISK_TRANSACTION' ? 'Flagged by risk engine.' : 'Gateway or bank error.'
      }
    };
  },
  createRefundRecommendation: async ({ transactionId, reason }, merchantId, user) => {
    // This is a sensitive action. We create a pending AgentAction requiring authorization.
    const action = await prisma.agentAction.create({
      data: {
        transactionId,
        toolName: 'createRefundRecommendation',
        inputParams: JSON.stringify({ reason }),
        status: 'PENDING',
        authorizationRequired: true
      }
    });

    // Also log the audit intent
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PROPOSE_REFUND',
        toolUsed: 'createRefundRecommendation',
        transactionId,
        status: 'PENDING_APPROVAL',
        authorizationRequired: true
      }
    });

    return {
      status: 'PENDING_AUTHORIZATION',
      actionId: action.id,
      message: 'Refund recommendation created and requires human authorization.'
    };
  }
};

module.exports = {
  toolsDefinition,
  toolHandlers
};
