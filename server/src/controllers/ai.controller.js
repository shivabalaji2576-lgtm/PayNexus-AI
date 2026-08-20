const { processChat } = require('../agents/operations.agent');
const prisma = require('../utils/prisma');

const chat = async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const response = await processChat(conversationId, message, req.user);
    
    res.json(response);
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await prisma.aIConversation.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await prisma.aIConversation.findUnique({
      where: { id, userId: req.user.id },
      include: { 
        messages: { 
          orderBy: { createdAt: 'asc' },
          // Don't expose raw tool calls/results to frontend if not necessary, but for a dev tool we might want it.
          // We will send everything for now.
        } 
      }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation.messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const confirmAgentAction = async (req, res) => {
  try {
    const { actionId, approved } = req.body;
    
    const action = await prisma.agentAction.findUnique({
      where: { id: actionId },
      include: { transaction: true }
    });

    if (!action) return res.status(404).json({ message: 'Action not found' });
    if (action.status !== 'PENDING') return res.status(400).json({ message: 'Action already processed' });

    // Validate ownership
    if (action.transaction && action.transaction.merchantId !== req.user.merchant?.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (approved) {
      // Execute the actual logic (e.g., call Razorpay API for refund)
      // Here we simulate the API call
      
      await prisma.agentAction.update({
        where: { id: actionId },
        data: { status: 'COMPLETED', authorizationGranted: true, result: JSON.stringify({ success: true, fakeGatewayResponse: 'rfnd_123' }) }
      });

      // Update Audit Log
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'EXECUTE_REFUND',
          toolUsed: action.toolName,
          transactionId: action.transactionId,
          status: 'SUCCESS',
          authorizationRequired: true,
          authorizationGranted: true
        }
      });

      res.json({ message: 'Action approved and executed successfully' });
    } else {
      await prisma.agentAction.update({
        where: { id: actionId },
        data: { status: 'REJECTED', authorizationGranted: false }
      });

      // Update Audit Log
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'REJECT_REFUND',
          toolUsed: action.toolName,
          transactionId: action.transactionId,
          status: 'REJECTED_BY_USER',
          authorizationRequired: true,
          authorizationGranted: false
        }
      });

      res.json({ message: 'Action rejected' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  chat,
  getConversations,
  getConversationMessages,
  confirmAgentAction
};
