# PayNexus AI

An intelligent AI Agent for payment operations, built for the Razorpay AI Buildathon.

## Overview
PayNexus AI helps merchants understand and resolve payment-related operational problems. It leverages an LLM to analyze transactions, detect failure patterns, and recommend recovery actions with human-in-the-loop security.

## Technology Stack
- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router, Recharts
- **Backend:** Node.js, Express.js
- **Database:** Neon PostgreSQL with Prisma ORM 
- **AI Integration:** OpenAI Node SDK (Configurable for multiple providers via API Key/Base URL)

## Requirements
- Node.js v20+
- A Neon PostgreSQL Database

## Local Setup

### 1. Database Configuration
1. Ensure your Neon database is active.
2. Navigate to the `server` directory and install dependencies:
   ```bash
   cd server
   npm install
   ```
3. Create a `.env` file in the `server` directory and add your `DATABASE_URL` (your Neon connection string) and `JWT_SECRET`. Do **NOT** commit this file to GitHub!
4. Push the database schema and seed the initial data:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

### 2. Backend Server
1. Navigate to the `server` directory.
2. Edit the `.env` file to add your `AI_API_KEY`.
3. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Client
1. Navigate to the `client` directory in a new terminal:
   ```bash
   cd client
   npm install
   ```
2. Create a `.env` file in the `client` directory and set the API URL to point to your local backend (you can copy `.env.example`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

## Demo Credentials
- **Merchant Account:** `merchant@example.com` / `merchant123`
- **Admin Account:** `admin@paynexus.ai` / `admin123`

## AI Agent Capabilities
The AI Operations Agent uses function calling to interact with the database safely:
- `getTransaction(id)`
- `searchTransactions(filters)`
- `analyzeFailure(id)`
- `createRefundRecommendation(id)` - Requires explicit human approval.

## Security
- No direct database manipulation by the LLM.
- All sensitive actions require Merchant or Admin approval via the `AgentAction` queue.
- Full audit logging of all AI activities.
