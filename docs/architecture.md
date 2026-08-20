# PayPilot AI Architecture

## Overview
PayPilot AI is a production-style fintech platform that leverages LLMs for intelligent payment operations. It follows a client-server architecture with human-in-the-loop security controls for sensitive operations.

## Technology Stack
- **Frontend:** React, Vite, Tailwind CSS v4, React Router, Recharts, Lucide React
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (with Prisma ORM)
- **AI Integration:** OpenAI Node SDK (configurable for Gemini/Anthropic via proxies/baseURL)

## AI Agent Workflow
The AI Operations Agent strictly follows a predefined workflow:
1. **User Request:** "Investigate transaction TXN123"
2. **Intent Detection:** The LLM decides which tools are needed.
3. **Tool Execution:** The backend runs the predefined tool (e.g. `getTransaction(TXN123)`).
4. **Data Retrieval:** Data is fetched from PostgreSQL.
5. **AI Reasoning:** The LLM analyzes the data context and provides an explanation or recommendation.
6. **Authorization (If Needed):** If the LLM proposes a sensitive action (e.g. \`createRefundRecommendation\`), the backend creates a pending \`AgentAction\` requiring human authorization.
7. **Audit Log:** Every execution is logged in the `AuditLog` table.

## Database Schema Highlights
- `User` and `Merchant` for multi-tenant data segmentation.
- `Transaction` and `PaymentAttempt` for recording financial activities.
- `AIConversation` and `AIMessage` to persist the AI context.
- `AgentAction` to persist pending/completed tool calls that require human review.
- `AuditLog` for compliance and visibility.
