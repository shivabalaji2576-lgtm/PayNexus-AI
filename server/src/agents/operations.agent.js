const { OpenAI } = require('openai');
const { toolsDefinition, toolHandlers } = require('../tools');
const prisma = require('../utils/prisma');

// Initialize OpenAI client
// We allow overriding the base URL to support multiple AI providers (OpenAI, Gemini via proxy, etc.)
const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY || 'dummy_key',
  baseURL: process.env.AI_BASE_URL || undefined,
});

const SYSTEM_PROMPT = `You are PayPilot AI, an intelligent agent for payment operations.
Your job is to help merchants understand their payment data, investigate failures, and propose actions.
Strict Rules:
- NEVER invent transaction information or payment status.
- NEVER claim an action was completed unless a tool confirms it.
- Clearly distinguish facts from predictions.
- If an action requires human confirmation (e.g. refunds), inform the user and wait for backend confirmation.
- Use the provided tools to query the database. Do not hallucinate database state.`;

const processChat = async (conversationId, userMessage, user) => {
  const merchantId = user.merchant?.id;
  if (!merchantId) throw new Error('User is not a merchant');

  // Fetch or create conversation history
  let conversation;
  if (conversationId) {
    conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    });
  } else {
    conversation = await prisma.aIConversation.create({
      data: { userId: user.id, title: userMessage.substring(0, 30) + '...' }
    });
  }

  // Build message array for LLM
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT }
  ];

  if (conversation?.messages) {
    conversation.messages.forEach(m => {
      if (m.role === 'tool') {
        messages.push({ role: 'tool', tool_call_id: m.toolCallId, content: m.content });
      } else if (m.role === 'assistant' && m.toolCalls) {
        messages.push({ role: 'assistant', content: m.content || null, tool_calls: JSON.parse(m.toolCalls) });
      } else {
        messages.push({ role: m.role, content: m.content });
      }
    });
  }

  // Add new user message
  messages.push({ role: 'user', content: userMessage });
  
  // Save user message to DB
  await prisma.aIMessage.create({
    data: {
      conversationId: conversation.id,
      role: 'user',
      content: userMessage
    }
  });

  // Call LLM
  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    messages,
    tools: toolsDefinition,
    tool_choice: 'auto',
  });

  const responseMessage = response.choices[0].message;

  // Handle Tool Calls
  if (responseMessage.tool_calls) {
    // Save assistant message with tool calls
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: responseMessage.content || '',
        toolCalls: JSON.stringify(responseMessage.tool_calls)
      }
    });

    messages.push(responseMessage);

    // Execute tools
    for (const toolCall of responseMessage.tool_calls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);
      
      let toolResult;
      try {
        if (toolHandlers[toolName]) {
          toolResult = await toolHandlers[toolName](toolArgs, merchantId, user);
        } else {
          toolResult = { error: `Tool ${toolName} not found` };
        }
      } catch (error) {
        toolResult = { error: error.message };
      }

      const stringifiedResult = JSON.stringify(toolResult);

      // Save tool result
      await prisma.aIMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'tool',
          content: stringifiedResult,
          toolCallId: toolCall.id
        }
      });

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: stringifiedResult
      });
    }

    // Call LLM again with tool results
    const secondResponse = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages
    });

    const finalMessage = secondResponse.choices[0].message;
    
    // Save final response
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: finalMessage.content
      }
    });

    return {
      conversationId: conversation.id,
      message: finalMessage.content,
      toolUsed: true
    };
  } else {
    // No tool calls, just save assistant message
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: responseMessage.content
      }
    });

    return {
      conversationId: conversation.id,
      message: responseMessage.content,
      toolUsed: false
    };
  }
};

module.exports = {
  processChat
};
