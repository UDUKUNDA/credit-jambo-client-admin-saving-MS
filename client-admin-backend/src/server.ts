import express from 'express';
import cors from 'cors';
import { connectDB } from './db/config';
import { securityHeaders, authLimiter, apiLimiter } from './middlewares/security';
import authRoutes from './routes/client/auth';
import accountRoutes from './routes/client/account';
import adminRoutes from './routes/admin';

// Import models to register associations
import './db/models/User';
import './db/models/Device';
import './db/models/Account';
import './db/models/Transaction';
import { seedAdminUser } from './bootstrap/seedAdmin'; // Add seeder import

const app = express();

// Security middlewares
app.use(securityHeaders);
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Savings Management Backend'
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDB();
    // Seed a default admin user if missing
    await seedAdminUser();
    app.listen(PORT, () => {
      console.log(`Savings Management Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;