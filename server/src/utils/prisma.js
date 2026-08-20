const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
// Using standard Prisma connection pattern, reads from process.env.DATABASE_URL automatically
const prisma = new PrismaClient();

module.exports = prisma;
