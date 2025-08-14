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
import { ENV, LOG, STATUS, VERSION, HEALTH_MSG, METHODS, HEADERS } from './constants';

dotenv.config();

// Debug environment variables
console.log(LOG.BACKEND_ENV);
console.log('  - NODE_ENV:', ENV.NODE_ENV);
console.log('  - PORT:', ENV.PORT);
console.log('  - WORKER_API_KEY:', ENV.WORKER_API_KEY);

const app = express();
const PORT = ENV.PORT;

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
    
    console.log(LOG.DB_INIT_SUCCESS);
    console.log(LOG.WORKER_SEED_INFO);
  } catch (error) {
    console.error(LOG.ERROR_INIT_DB, error);
    process.exit(1);
  }
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: ENV.FRONTEND_URL,
  credentials: true,
  methods: METHODS,
  allowedHeaders: HEADERS
}));
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: STATUS.OK,
    timestamp: new Date().toISOString(),
    service: 'case-wise-backend',
    version: VERSION
  });
});

// Authentication routes
app.use('/api/auth', (req, res, next) => {
  if (!userModel) return res.status(503).json({ error: STATUS.SERVICE_NOT_READY });
  const authRouter = createAuthRoutes(userModel);
  authRouter(req, res, next);
});

// File routes
app.use('/api/files', (req, res, next) => {
  if (!fileModel || !userModel) return res.status(503).json({ error: STATUS.SERVICE_NOT_READY });
  const fileRouter = createFileRoutes(fileModel, userModel);
  fileRouter(req, res, next);
});

// Note routes
app.use('/api/notes', (req, res, next) => {
  if (!noteModel || !userModel) return res.status(503).json({ error: STATUS.SERVICE_NOT_READY });
  const noteRouter = createNotesRoutes(noteModel, userModel);
  noteRouter(req, res, next);
});

// Protected API routes
app.use('/api', (req, res, next) => {
  if (!userModel) return res.status(503).json({ error: STATUS.SERVICE_NOT_READY });
  const auth = authMiddleware(userModel);
  auth(req, res, next);
});

// Protected status endpoint
app.get('/api/status', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    message: HEALTH_MSG.BACKEND_RUNNING,
    version: VERSION,
    user: req.user
  });
});


// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: STATUS.ERROR_GENERIC });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: STATUS.ROUTE_NOT_FOUND });
});

// Start server
const startServer = async () => {
  await initializeApp();
  
  app.listen(PORT, () => {
    console.log(`${LOG.SERVER_START} ${PORT}`);
    console.log(`${LOG.HEALTH_CHECK_URL} http://localhost:${PORT}/health`);
    console.log(`${LOG.AUTH_URL} http://localhost:${PORT}/api/auth`);
    console.log(`${LOG.API_STATUS_URL} http://localhost:${PORT}/api/status`);
    console.log(LOG.ADMIN_CREDS);
    console.log(LOG.SEED_WORKER_INFO);
  });
};

startServer().catch(console.error);
