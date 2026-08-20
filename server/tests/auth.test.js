const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { protect, admin, merchant } = require('../src/middleware/auth');
const prisma = require('../src/utils/prisma');

jest.mock('../src/utils/prisma', () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

const app = express();
app.use(express.json());

// Dummy routes for testing middleware
app.get('/api/test/protect', protect, (req, res) => {
  res.status(200).json({ message: 'Protected route accessed', user: req.user });
});

app.get('/api/test/admin', protect, admin, (req, res) => {
  res.status(200).json({ message: 'Admin route accessed' });
});

app.get('/api/test/merchant', protect, merchant, (req, res) => {
  res.status(200).json({ message: 'Merchant route accessed' });
});

describe('Auth Middleware', () => {
  const JWT_SECRET = 'test_secret';
  
  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/test/protect');
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Not authorized, no token');
    });

    it('should return 401 if token is invalid', async () => {
      const res = await request(app)
        .get('/api/test/protect')
        .set('Authorization', 'Bearer invalidtoken123');
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Not authorized, token failed');
    });

    it('should return 401 if token is expired', async () => {
      // Create an expired token manually
      const expiredToken = jwt.sign({ id: 'user1', role: 'MERCHANT' }, JWT_SECRET, { expiresIn: '-1s' });
      
      const res = await request(app)
        .get('/api/test/protect')
        .set('Authorization', `Bearer ${expiredToken}`);
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Not authorized, token failed');
    });

    it('should allow access if token is valid', async () => {
      const validToken = jwt.sign({ id: 'user1', role: 'MERCHANT' }, JWT_SECRET, { expiresIn: '1h' });
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        email: 'test@example.com',
        role: 'MERCHANT',
        name: 'Test User'
      });

      const res = await request(app)
        .get('/api/test/protect')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Protected route accessed');
    });
  });

  describe('Role-based authorization', () => {
    it('should reject unauthorized role for admin route', async () => {
      const merchantToken = jwt.sign({ id: 'user2', role: 'MERCHANT' }, JWT_SECRET, { expiresIn: '1h' });
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'user2',
        role: 'MERCHANT'
      });

      const res = await request(app)
        .get('/api/test/admin')
        .set('Authorization', `Bearer ${merchantToken}`);
      
      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toBe('Not authorized as an admin');
    });

    it('should allow authorized admin', async () => {
      const adminToken = jwt.sign({ id: 'admin1', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' });
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'admin1',
        role: 'ADMIN'
      });

      const res = await request(app)
        .get('/api/test/admin')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Admin route accessed');
    });

    it('should allow merchant for merchant route', async () => {
      const merchantToken = jwt.sign({ id: 'merch1', role: 'MERCHANT' }, JWT_SECRET, { expiresIn: '1h' });
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'merch1',
        role: 'MERCHANT'
      });

      const res = await request(app)
        .get('/api/test/merchant')
        .set('Authorization', `Bearer ${merchantToken}`);
      
      expect(res.statusCode).toEqual(200);
    });
  });
});
