export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  WORKER_API_KEY: process.env.WORKER_API_KEY || 'worker-secret-key'
};

export const LOG = {
  BACKEND_ENV: '🔧 Backend environment variables:',
  DB_INIT_SUCCESS: '✅ Database and models initialized',
  WORKER_SEED_INFO: '🌱 Admin user seeding handled by worker service',
  SERVER_START: '🚀 Health App Backend server running on port',
  HEALTH_CHECK_URL: '📊 Health check:',
  AUTH_URL: '🔐 Auth endpoints:',
  API_STATUS_URL: '🔗 API status:',
  ADMIN_CREDS: '👤 Admin credentials: admin@casewise.com / admin',
  SEED_WORKER_INFO: '🌱 Seeding handled by worker service',
  ERROR_INIT_DB: '❌ Failed to initialize database:'
};

export const STATUS = {
  OK: 'OK',
  SERVICE_NOT_READY: 'Service not ready',
  ERROR_GENERIC: 'Something went wrong!',
  ROUTE_NOT_FOUND: 'Route not found'
};

export const VERSION = '1.0.0';

export const HEALTH_MSG = {
  BACKEND_RUNNING: 'Health App Backend is running',
  ADMIN_ENDPOINT_ACCESS: 'Admin endpoint accessed successfully',
  METRICS_ENDPOINT: 'Health metrics endpoint'
};

export const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

export const HEADERS = ['Content-Type', 'Authorization', 'Cookie'];
