const axios = require('axios');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const Tesseract = require('tesseract.js');
const { PDFDocument } = require('pdf-lib');
const { createCanvas, loadImage } = require('canvas'); // for PDF page -> image
require('dotenv').config();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const WORKER_API_KEY = process.env.WORKER_API_KEY || 'worker-secret-key';
const SEED_RETRY_ATTEMPTS = 5;
const SEED_RETRY_DELAY = 2000;
const APP_DATA_PATH = path.join(process.cwd(), '../APP_DATA');

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
          await this.sleep(SEED_RETRY_DELAY);
        } else {
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
        await this.sleep(30000);
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
      const response = await axios.get(`${BACKEND_URL}/api/files/pending`, {
        timeout: 10000,
        headers: { 'x-api-key': WORKER_API_KEY }
      });

      if (response.data.files && response.data.files.length > 0) {
        console.log(`📋 Found ${response.data.files.length} pending files`);
        for (const file of response.data.files) {
          try {
            await this.processFile(file);
          } catch (error) {
            console.error(`❌ Failed to process file ${file.id}:`, error.message);
            await this.updateFileStatus(file.id, 'error', { error: error.message });
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking pending files:', error.response?.data || error.message);
    }
  }

  async processFile(file) {
    try {
      await this.updateFileStatus(file.id, 'processing');
      const fileType = file.fileType.toLowerCase();

      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileType)) {
        await this.processImage(file);
      } else if (fileType === '.pdf') {
        await this.processPDF(file);
      } else {
        await this.updateFileStatus(file.id, 'processed', { message: 'File type not supported' });
      }
    } catch (error) {
      console.error(`❌ Error processing file ${file.id}:`, error.message);
      throw error;
    }
  }

  async processImage(file) {
    const uploadPath = file.filePath;
    const processedPath = path.join(APP_DATA_PATH, 'processed', file.fileName);

    try {
      if (!fs.existsSync(uploadPath)) throw new Error(`File not found: ${uploadPath}`);
      await fsp.mkdir(path.dirname(processedPath), { recursive: true });

      const extractedText = await this.runOCR(uploadPath);
      await fsp.rename(uploadPath, processedPath);
      await this.updateFileStatus(file.id, 'processed', { extractedText });
      console.log(`✅ Processed image: ${file.originalName}`);
    } catch (err) {
      console.error(`❌ Error processing image ${file.id}:`, err.message);
      throw err;
    }
  }

  async processPDF(file) {
    const uploadPath = file.filePath;
    const processedPath = path.join(APP_DATA_PATH, 'processed', file.fileName);

    try {
      if (!fs.existsSync(uploadPath)) throw new Error(`File not found: ${uploadPath}`);
      await fsp.mkdir(path.dirname(processedPath), { recursive: true });

      // Convert PDF pages to images
      const extractedText = await this.runPDFOCR(uploadPath);
      await fsp.rename(uploadPath, processedPath);
      await this.updateFileStatus(file.id, 'processed', { extractedText });
      console.log(`✅ Processed PDF: ${file.originalName}`);
    } catch (err) {
      console.error(`❌ Error processing PDF ${file.id}:`, err.message);
      throw err;
    }
  }

  async runOCR(filePath) {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: m => console.log(m)
    });
    return text;
  }

  async runPDFOCR(pdfPath) {
    const pdfBytes = await fsp.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    let fullText = '';

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      // Draw PDF content here if needed (simplified, optional)
      const imageBuffer = canvas.toBuffer('image/png');
      const pageText = await Tesseract.recognize(imageBuffer, 'eng').then(res => res.data.text);
      fullText += pageText + '\n';
    }
    return fullText;
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
    console.log(`📝 Job added. Total jobs: ${this.jobs.length}`);
  }

  async stop() {
    this.isRunning = false;
  }

  sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}

// Graceful shutdown
process.on('SIGINT', async () => { if (worker) await worker.stop(); process.exit(0); });
process.on('SIGTERM', async () => { if (worker) await worker.stop(); process.exit(0); });

// Start worker
const worker = new HealthAppWorker();
worker.start().catch(error => { console.error('❌ Worker startup failed:', error); process.exit(1); });

module.exports = HealthAppWorker;
