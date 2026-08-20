const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with PayNexus Demo Data (Neon Cloud)...');
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@paypilot.ai' },
    update: {},
    create: {
      email: 'admin@paypilot.ai',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create merchant user
  const merchantPassword = await bcrypt.hash('merchant123', 10);
  const merchantUser = await prisma.user.upsert({
    where: { email: 'merchant@example.com' },
    update: {},
    create: {
      email: 'merchant@example.com',
      name: 'Demo Merchant',
      password: merchantPassword,
      role: 'MERCHANT',
    },
  });

  // Create merchant profile
  let merchant = await prisma.merchant.findUnique({
    where: { userId: merchantUser.id }
  });
  
  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: {
        userId: merchantUser.id,
        businessName: 'Acme Corp',
      }
    });
  }

  const txCount = await prisma.transaction.count({
    where: { merchantId: merchant.id }
  });

  if (txCount === 0) {
    const transactionsData = [
      {
        merchantId: merchant.id,
        orderId: 'DEMO-ORD-1001',
        amount: 1500.00,
        currency: 'INR',
        paymentMethod: 'UPI',
        status: 'SUCCESS',
        customerReference: 'demo_cust_101'
      },
      {
        merchantId: merchant.id,
        orderId: 'DEMO-ORD-1002',
        amount: 4500.00,
        currency: 'INR',
        paymentMethod: 'CREDIT_CARD',
        status: 'FAILED',
        customerReference: 'demo_cust_102',
        failureReason: 'INSUFFICIENT_FUNDS',
        riskStatus: 'LOW'
      },
      {
        merchantId: merchant.id,
        orderId: 'DEMO-ORD-1003',
        amount: 12000.00,
        currency: 'INR',
        paymentMethod: 'DEBIT_CARD',
        status: 'FAILED',
        customerReference: 'demo_cust_103',
        failureReason: 'BANK_SERVER_ERROR',
        riskStatus: 'LOW'
      },
      {
        merchantId: merchant.id,
        orderId: 'DEMO-ORD-1004',
        amount: 8000.00,
        currency: 'INR',
        paymentMethod: 'CREDIT_CARD',
        status: 'FAILED',
        customerReference: 'demo_cust_104',
        failureReason: 'HIGH_RISK_TRANSACTION',
        riskStatus: 'HIGH'
      }
    ];

    for (const txData of transactionsData) {
      const tx = await prisma.transaction.create({ data: txData });
      
      // Payment Attempts
      if (tx.status === 'FAILED') {
        await prisma.paymentAttempt.create({
          data: {
            transactionId: tx.id,
            status: 'FAILED',
            errorMessage: tx.failureReason,
            gatewayId: 'demo_gw_' + Math.floor(Math.random() * 100000)
          }
        });
        
        // Add Risk Event for the high risk one
        if (tx.riskStatus === 'HIGH') {
          await prisma.riskEvent.create({
            data: {
              transactionId: tx.id,
              riskScore: 0.89,
              reasons: 'Multiple failures in short duration, suspicious IP',
              status: 'OPEN'
            }
          });
        }
      }

      // Add a refund example to a successful transaction
      if (tx.orderId === 'DEMO-ORD-1001') {
        await prisma.refund.create({
          data: {
            transactionId: tx.id,
            amount: 1500.00,
            currency: 'INR',
            status: 'COMPLETED',
            reason: 'Customer requested cancellation'
          }
        });
      }
    }
  }

  // Seed AI Demo Actions and Audit Logs
  const firstFailedTx = await prisma.transaction.findFirst({
    where: { merchantId: merchant.id, status: 'FAILED' }
  });

  if (firstFailedTx) {
    const existingAction = await prisma.agentAction.findFirst({
      where: { transactionId: firstFailedTx.id }
    });

    if (!existingAction) {
      await prisma.agentAction.create({
        data: {
          transactionId: firstFailedTx.id,
          toolName: 'createRefundRecommendation',
          inputParams: JSON.stringify({ reason: 'Demo AI generated refund recommendation' }),
          status: 'PENDING',
          authorizationRequired: true
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: merchantUser.id,
          action: 'PROPOSE_REFUND_DEMO',
          toolUsed: 'createRefundRecommendation',
          transactionId: firstFailedTx.id,
          status: 'PENDING_APPROVAL',
          authorizationRequired: true
        }
      });
      
      await prisma.recommendation.create({
        data: {
          transactionId: firstFailedTx.id,
          type: 'RETRY',
          description: 'Demo Recommendation: This transaction is highly recoverable via standard retry flow.',
          confidence: 0.95,
          status: 'OPEN'
        }
      });
    }
  }

  // Create a Notification
  const existingNotif = await prisma.notification.findFirst({
    where: { userId: merchantUser.id }
  });

  if (!existingNotif) {
    await prisma.notification.create({
      data: {
        userId: merchantUser.id,
        title: 'Welcome to PayPilot AI',
        message: 'Your intelligent payment operations platform is ready.'
      }
    });
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
