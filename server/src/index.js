const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: DATABASE_URL is missing in environment variables.');
  console.error('Please configure your Neon PostgreSQL connection string in the .env file.');
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Basic route
app.get('/', (req, res) => {
  res.send('PayPilot API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
