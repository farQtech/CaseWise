const axios = require('axios');
const fs = require('fs');           // for existsSync, accessSync, etc.
const fsp = require('fs').promises;  // for mkdir, rename, etc.
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const WORKER_API_KEY = process.env.WORKER_API_KEY || 'worker-secret-key';
const SEED_RETRY_ATTEMPTS = 5;
const SEED_RETRY_DELAY = 2000; // 2 seconds
const APP_DATA_PATH = path.join(process.cwd(), '../APP_DATA');

// Debug environment variables
console.log('🔧 Worker environment variables:');
console.log('  - BACKEND_URL:', BACKEND_URL);
console.log('  - WORKER_API_KEY:', WORKER_API_KEY);
console.log('  - NODE_ENV:', process.env.NODE_ENV);

class HealthAppWorker {
  constructor() {
    this.isRunning = false;
    this.jobs = [];
  }

  async start() {
    console.log('🚀 Health App Worker starting...');
    this.isRunning = true;

    try {
      await this.seedAdminUser();
      await this.runWorkerLoop();
    } catch (error) {
      console.error('❌ Worker failed to start:', error.message);
      process.exit(1);
    }
  }

  async seedAdminUser() {
    console.log('🌱 Attempting to seed admin user...');
    for (let attempt = 1; attempt <= SEED_RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`📡 Seeding attempt ${attempt}/${SEED_RETRY_ATTEMPTS}...`);
        const response = await axios.post(`${BACKEND_URL}/api/auth/seed`, {}, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.status === 200) {
          console.log('✅ Admin user seeded successfully');
          console.log('👤 Credentials:', response.data.credentials);
          return true;
        }
      } catch (error) {
        console.log(`⚠️  Seeding attempt ${attempt} failed:`, error.message);
        if (attempt < SEED_RETRY_ATTEMPTS) {
          console.log(`⏳ Retrying in ${SEED_RETRY_DELAY / 1000} seconds...`);
          await this.sleep(SEED_RETRY_DELAY);
        } else {
          console.error('❌ Failed to seed admin user after all attempts');
          throw new Error('Seeding failed');
        }
      }
    }
  }

  async runWorkerLoop() {
    console.log('🔄 Worker loop started');
    while (this.isRunning) {
      try {
        await this.checkBackendHealth();
        await this.processJobs();
        await this.sleep(30000); // 30 seconds
      } catch (error) {
        console.error('❌ Worker loop error:', error.message);
        await this.sleep(5000);
      }
    }
  }

  async checkBackendHealth() {
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
      if (response.status === 200) console.log('💚 Backend health check: OK');
    } catch (error) {
      console.warn('⚠️  Backend health check failed:', error.message);
    }
  }

  async processJobs() {
    try {
      await this.processPendingFiles();
      if (this.jobs.length > 0) console.log(`📋 Processing ${this.jobs.length} pending jobs...`);
    } catch (error) {
      console.error('❌ Error processing jobs:', error.message);
    }
  }

  async processPendingFiles() {
    try {
      console.log('📁 Checking for pending files to process...');
      console.log(`🔑 Using API key: ${WORKER_API_KEY}`);
      console.log(`🌐 Backend URL: ${BACKEND_URL}`);

      const response = await axios.get(`${BACKEND_URL}/api/files/pending`, {
        timeout: 10000,
        headers: { 'x-api-key': WORKER_API_KEY }
      });

      console.log('📡 Response received:', response.status, response.data);

      if (response.data.files && response.data.files.length > 0) {
        console.log(`📋 Found ${response.data.files.length} pending files to process`);

        for (const file of response.data.files) {
          try {
            console.log(`🔄 Processing file: ${file.originalName} (ID: ${file.id})`);
            console.log(`📁 File path: ${file.filePath}`);
            console.log(`📄 File type: ${file.fileType}`);
            await this.processFile(file);
          } catch (error) {
            console.error(`❌ Failed to process file ${file.id}:`, error.message);
            await this.updateFileStatus(file.id, 'error', { error: error.message });
          }
        }
      } else {
        console.log('✅ No pending files to process');
      }
    } catch (error) {
      console.error('❌ Error checking pending files:', error.response?.data || error.message);
    }
  }

  async processFile(file) {
    console.log(`🔄 Processing file: ${file.originalName} (${file.id})`);
    try {
      await this.updateFileStatus(file.id, 'processing');
      const fileType = file.fileType.toLowerCase();

      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileType)) {
        await this.processImage(file);
      } else if (fileType === '.pdf') {
        await this.processPDF(file);
      } else {
        console.log(`⚠️  Unknown file type: ${fileType}`);
        await this.updateFileStatus(file.id, 'processed', { message: 'File type not supported' });
        return;
      }

      console.log(`✅ File processed successfully: ${file.originalName}`);
    } catch (error) {
      console.error(`❌ Error processing file ${file.id}:`, error.message);
      throw error;
    }
  }

  async processImage(file) {
    console.log(`🖼️  Processing image for OCR: ${file.originalName}`);
    const uploadPath = file.filePath;
    const processedPath = path.join(APP_DATA_PATH, 'processed', file.fileName);

    try {
      await fs.access(uploadPath);
      await fsp.mkdir(path.dirname(processedPath), { recursive: true });

      // Run Python OCR
      const extractedText = await this.runPythonOCR(uploadPath);
      console.log(`✅ OCR text extracted: ${extractedText.slice(0, 100)}...`);

      // Move processed file
      await fsp.rename(uploadPath, processedPath);

      // Update status
      await this.updateFileStatus(file.id, 'processed', { extractedText });

    } catch (error) {
      console.error(`❌ Error processing image ${file.id}:`, error.message);
      throw error;
    }
  }

  async processPDF(file) {
    console.log(`📄 Processing PDF for OCR: ${file.originalName}`);
    const uploadPath = file.filePath;
    const processedPath = path.join(APP_DATA_PATH, 'processed', file.fileName);

    try {
      await fs.access(uploadPath);
      await fsp.mkdir(path.dirname(processedPath), { recursive: true });

      // Run Python OCR
      const extractedText = await this.runPythonOCR(uploadPath);
      console.log(`✅ OCR text extracted: ${extractedText.slice(0, 100)}...`);

      // Move processed file
      await fsp.rename(uploadPath, processedPath);

      // Update status
      await this.updateFileStatus(file.id, 'processed', { extractedText });

    } catch (error) {
      console.error(`❌ Error processing PDF ${file.id}:`, error.message);
      throw error;
    }
  }

  runPythonOCR(filePath) {
  return new Promise(async (resolve, reject) => {
    try {
      const venvPath = path.join(process.cwd(), '.venv_worker');
      const pythonPath = process.platform === 'win32'
        ? path.join(venvPath, 'Scripts', 'python.exe')
        : path.join(venvPath, 'bin', 'python');

      // 1️⃣ Create venv if it doesn't exist
      if (!fs.existsSync(venvPath)) {
        console.log('🌱 Creating Python virtual environment...');
        await new Promise((res, rej) => {
          const venv = spawn('python3', ['-m', 'venv', '.venv_worker'], { stdio: 'inherit' });
          venv.on('exit', code => code === 0 ? res() : rej(new Error('Failed to create venv')));
        });
      }

      // 2️⃣ Install required Python packages
      console.log('📦 Installing Python dependencies...');
      await new Promise((res, rej) => {
        const pipInstall = spawn(pythonPath, ['-m', 'pip', 'install', '--upgrade', 'pip', 'pytesseract', 'pdf2image', 'Pillow'], { stdio: 'inherit' });
        pipInstall.on('exit', code => code === 0 ? res() : rej(new Error('Failed to install Python dependencies')));
      });

      // 3️⃣ Run OCR script
      console.log(`🔄 Running OCR script on file: ${filePath}`);
      const pyProcess = spawn(pythonPath, ['ocr_extractor.py', filePath]);

      let output = '';
      let errorOutput = '';

      pyProcess.stdout.on('data', (data) => output += data.toString());
      pyProcess.stderr.on('data', (data) => errorOutput += data.toString());

      pyProcess.on('close', (code) => {
        if (code === 0) resolve(output.trim());
        else reject(new Error(`Python OCR failed (code ${code}): ${errorOutput}`));
      });

    } catch (err) {
      reject(err);
    }
  });
}

  async updateFileStatus(fileId, status, metadata = {}) {
    try {
      await axios.patch(`${BACKEND_URL}/api/files/${fileId}/status`, { status, metadata }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json', 'x-api-key': WORKER_API_KEY }
      });
    } catch (error) {
      console.error(`❌ Failed to update file status for ${fileId}:`, error.message);
    }
  }

  async addJob(job) {
    this.jobs.push(job);
    console.log(`📝 Job added to queue. Total jobs: ${this.jobs.length}`);
  }

  async stop() {
    console.log('🛑 Stopping worker...');
    this.isRunning = false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Graceful shutdown
process.on('SIGINT', async () => { if (worker) await worker.stop(); process.exit(0); });
process.on('SIGTERM', async () => { if (worker) await worker.stop(); process.exit(0); });

// Start worker
const worker = new HealthAppWorker();
worker.start().catch(error => { console.error('❌ Worker startup failed:', error); process.exit(1); });

module.exports = HealthAppWorker;
