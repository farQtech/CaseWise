import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { initDatabase } from './database/schema';
import { UserModel } from './models/User';
import { FileModel } from './models/File';
import { createAuthRoutes } from './routes/auth';
import { createFileRoutes } from './routes/files';
import { authMiddleware, requireRole, AuthenticatedRequest } from './middleware/auth';
import { NoteModel } from './models/Note';
import { createNotesRoutes } from './routes/notes';

dotenv.config();

// Debug environment variables
console.log('🔧 Backend environment variables:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - PORT:', process.env.PORT);
console.log('  - WORKER_API_KEY:', process.env.WORKER_API_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database and models
let userModel: UserModel | null = null;
let fileModel: FileModel | null = null;
let noteModel: NoteModel | null = null;

const initializeApp = async () => {
  try {
    const db = await initDatabase();
    userModel = new UserModel(db);
    fileModel = new FileModel(db);
    noteModel = new NoteModel(db);
    
    // Note: Admin user seeding is now handled by the worker service
    console.log('✅ Database and models initialized');
    console.log('🌱 Admin user seeding handled by worker service');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (public)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'health-app-backend',
    version: '1.0.0'
  });
});

// Authentication routes (public)
app.use('/api/auth', (req, res, next) => {
  if (!userModel) {
    return res.status(503).json({ error: 'Service not ready' });
  }
  const authRouter = createAuthRoutes(userModel);
  authRouter(req, res, next);
});

// File routes
app.use('/api/files', (req, res, next) => {
  if (!fileModel || !userModel) {
    return res.status(503).json({ error: 'Service not ready' });
  }
  
  
  const fileRouter = createFileRoutes(fileModel, userModel);
  fileRouter(req, res, next);
});

// Note routes
app.use('/api/notes', (req, res, next) => {
  if (!noteModel || !userModel) {
    return res.status(503).json({ error: 'Service not ready' });
  }
  
  
  const fileRouter = createNotesRoutes(noteModel, userModel);
  fileRouter(req, res, next);
});


// Protected API routes (everything else under /api)
app.use('/api', (req, res, next) => {
  if (!userModel) {
    return res.status(503).json({ error: 'Service not ready' });
  }
  const auth = authMiddleware(userModel);
  auth(req, res, next);
});

// Protected status endpoint
app.get('/api/status', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    message: 'Health App Backend is running',
    version: '1.0.0',
    user: req.user
  });
});

// Admin-only endpoint example
app.get('/api/admin/users', 
  requireRole(['admin']), 
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // This would typically fetch all users from the database
      res.json({
        message: 'Admin endpoint accessed successfully',
        user: req.user,
        data: 'Protected admin data would be here'
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Protected health metrics endpoint
app.get('/api/health-metrics', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    message: 'Health metrics endpoint',
    user: req.user,
    metrics: {
      heartRate: 72,
      bloodPressure: '120/80',
      temperature: 98.6,
      oxygenSaturation: 98,
      stepsToday: 8432,
      sleepQuality: 85
    }
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  await initializeApp();
  
  app.listen(PORT, () => {
    console.log(`🚀 Health App Backend server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    console.log(`🔗 API status: http://localhost:${PORT}/api/status`);
    console.log(`👤 Admin credentials: admin@casewise.com / admin`);
    console.log(`🌱 Seeding handled by worker service`);
  });
};

startServer().catch(console.error);
