const path = require('path');

module.exports = {
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
  WORKER_API_KEY: process.env.WORKER_API_KEY || 'worker-secret-key',
  SEED_RETRY_ATTEMPTS: 5,
  SEED_RETRY_DELAY: 2000,
  APP_DATA_PATH: path.join(process.cwd(), '../APP_DATA'),

  LOG: {
    WORKER_ENV: '🔧 Worker environment variables:',
    WORKER_START: '🚀 Health App Worker starting...',
    WORKER_FAILED_START: '❌ Worker failed to start:',
    SEED_ADMIN: '🌱 Attempting to seed admin user...',
    SEED_SUCCESS: '✅ Admin user seeded successfully',
    CREDENTIALS: '👤 Credentials:',
    SEED_ATTEMPT_FAILED: '⚠️  Seeding attempt',
    WORKER_LOOP_START: '🔄 Worker loop started',
    BACKEND_HEALTH_OK: '💚 Backend health check: OK',
    BACKEND_HEALTH_FAIL: '⚠️  Backend health check failed:',
    PROCESSING_PENDING: '📋 Processing',
    JOBS_PENDING: '📋 Found',
    PROCESS_IMAGE_SUCCESS: '✅ Processed image:',
    PROCESS_PDF_SUCCESS: '✅ Processed PDF:',
    FILE_NOT_FOUND: 'File not found:',
    OCR_FAILED: '⚠️ PDF text extraction failed, fallback to raw OCR text:',
    CASE_NOTE_CREATED: '✅ Case note created for patient',
    CASE_NOTE_FAILED: '❌ Failed to create case note:',
    FILE_STATUS_FAILED: '❌ Failed to update file status for',
    JOB_ADDED: '📝 Job added. Total jobs:',
    ERROR_PROCESSING_FILE: '❌ Error processing file',
    ERROR_PROCESSING_IMAGE: '❌ Error processing image',
    ERROR_PROCESSING_PDF: '❌ Error processing PDF',
    ERROR_PROCESSING_JOBS: '❌ Error processing jobs:',
    ERROR_WORKER_LOOP: '❌ Worker loop error:',
  },

  STATUS: {
    PROCESSING: 'processing',
    PROCESSED: 'processed',
    ERROR: 'error',
    DRAFT: 'draft',
    FILE_TYPE_NOT_SUPPORTED: 'File type not supported',
  },

  OCR: {
    FAILED_TO_EXTRACT: 'No Data found',
    IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  },

  HTTP: {
    TIMEOUT_SHORT: 5000,
    TIMEOUT_LONG: 10000,
    JSON_HEADER: { 'Content-Type': 'application/json' },
  }
};
