const axios = require('axios');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
require('dotenv').config();

const C = require('./constants');

class HealthAppWorker {
  constructor() {
    this.isRunning = false;
    this.jobs = [];
  }

  async start() {
    console.log(C.LOG.WORKER_START);
    this.isRunning = true;
    console.log(C.LOG.WORKER_ENV);
    console.log('  - BACKEND_URL:', C.BACKEND_URL);
    console.log('  - WORKER_API_KEY:', C.WORKER_API_KEY);
    console.log('  - NODE_ENV:', process.env.NODE_ENV);

    try {
      await this.performSystemCleanup();
      await this.seedAdminUser();
      await this.runWorkerLoop();
    } catch (error) {
      console.error(C.LOG.WORKER_FAILED_START, error.message);
      process.exit(1);
    }
  }

  async performSystemCleanup() {
    console.log('🧹 Performing system cleanup on startup...');
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await axios.post(`${C.BACKEND_URL}/api/cleanup`, {}, {
          timeout: C.HTTP.TIMEOUT_LONG,
          headers: { ...C.HTTP.JSON_HEADER, 'x-api-key': C.WORKER_API_KEY }
        });
        
        if (response.status === 200) {
          console.log('✅ System cleanup completed successfully');
          console.log('📋 Cleanup result:', response.data.message);
          return true;
        }
      } catch (error) {
        console.log(`⚠️ Cleanup attempt ${attempt} failed:`, error.message);
        if (attempt < 3) {
          console.log('🔄 Retrying cleanup in 5 seconds...');
          await this.sleep(5000);
        } else {
          console.log('❌ System cleanup failed after 3 attempts, continuing...');
        }
      }
    }
  }

  async seedAdminUser() {
    console.log(C.LOG.SEED_ADMIN);
    for (let attempt = 1; attempt <= C.SEED_RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await axios.post(`${C.BACKEND_URL}/api/auth/seed`, {}, {
          timeout: C.HTTP.TIMEOUT_LONG,
          headers: C.HTTP.JSON_HEADER
        });
        if (response.status === 200) {
          console.log(C.LOG.SEED_SUCCESS);
          console.log(C.LOG.CREDENTIALS, response.data.credentials);
          return true;
        }
      } catch (error) {
        console.log(`${C.LOG.SEED_ATTEMPT_FAILED} ${attempt} failed:`, error.message);
        if (attempt < C.SEED_RETRY_ATTEMPTS) await this.sleep(C.SEED_RETRY_DELAY);
        else throw new Error('Seeding failed');
      }
    }
  }

  async runWorkerLoop() {
    console.log(C.LOG.WORKER_LOOP_START);
    while (this.isRunning) {
      try {
        await this.checkBackendHealth();
        await this.processJobs();
        await this.sleep(30000);
      } catch (error) {
        console.error(C.LOG.ERROR_WORKER_LOOP, error.message);
        await this.sleep(5000);
      }
    }
  }

  async checkBackendHealth() {
    try {
      const response = await axios.get(`${C.BACKEND_URL}/health`, { timeout: C.HTTP.TIMEOUT_SHORT });
      if (response.status === 200) console.log(C.LOG.BACKEND_HEALTH_OK);
    } catch (error) {
      console.warn(C.LOG.BACKEND_HEALTH_FAIL, error.message);
    }
  }

  async processJobs() {
    try {
      await this.processPendingFiles();
      if (this.jobs.length > 0) console.log(`${C.LOG.PROCESSING_PENDING} ${this.jobs.length} pending jobs...`);
    } catch (error) {
      console.error(C.LOG.ERROR_PROCESSING_JOBS, error.message);
    }
  }

  async processPendingFiles() {
    try {
      const response = await axios.get(`${C.BACKEND_URL}/api/files/pending`, {
        timeout: C.HTTP.TIMEOUT_LONG,
        headers: { ...C.HTTP.JSON_HEADER, 'x-api-key': C.WORKER_API_KEY }
      });

      if (response.data.files && response.data.files.length > 0) {
        console.log(`${C.LOG.JOBS_PENDING} ${response.data.files.length} pending files`);
        for (const file of response.data.files) {
          try { await this.processFile(file); }
          catch (error) {
            console.error(`${C.LOG.ERROR_PROCESSING_FILE} ${file.id}:`, error.message);
            await this.updateFileStatus(file.id, C.STATUS.ERROR, { error: error.message });
          }
        }
      }
    } catch (error) {
      console.error(C.LOG.ERROR_PROCESSING_JOBS, error.response?.data || error.message);
    }
  }

  async processFile(file) {
    await this.updateFileStatus(file.id, C.STATUS.PROCESSING);
    const fileType = file.fileType.toLowerCase();

    if (C.OCR.IMAGE_EXTENSIONS.includes(fileType)) await this.processImage(file);
    else if (fileType === '.pdf') await this.processPDF(file);
    else await this.updateFileStatus(file.id, C.STATUS.PROCESSED, { message: C.STATUS.FILE_TYPE_NOT_SUPPORTED });
  }

  async processImage(file) {
    const uploadPath = file.filePath;
    const processedPath = path.join(C.APP_DATA_PATH, 'processed', file.fileName);

    try {
      if (!fs.existsSync(uploadPath)) throw new Error(`${C.LOG.FILE_NOT_FOUND} ${uploadPath}`);
      await fsp.mkdir(path.dirname(processedPath), { recursive: true });

      const extractedText = await this.runOCR(uploadPath);

      let ocrData;
      try { ocrData = JSON.parse(extractedText); }
      catch { ocrData = { notes: extractedText }; }

      await this.createCaseNote(file.patientId, ocrData, [file.fileName]);
      await fsp.rename(uploadPath, processedPath);
      await this.updateFileStatus(file.id, C.STATUS.PROCESSED, { extractedText });
      console.log(`${C.LOG.PROCESS_IMAGE_SUCCESS} ${file.originalName}`);
    } catch (err) {
      console.error(`${C.LOG.ERROR_PROCESSING_IMAGE} ${file.id}:`, err.message);
      throw err;
    }
  }

  async processPDF(file) {
    const uploadPath = file.filePath;
    const processedPath = path.join(C.APP_DATA_PATH, 'processed', file.fileName);

    try {
      if (!fs.existsSync(uploadPath)) throw new Error(`${C.LOG.FILE_NOT_FOUND} ${uploadPath}`);
      await fsp.mkdir(path.dirname(processedPath), { recursive: true });

      let extractedText = '';
      try {
        const pdfBytes = await fsp.readFile(uploadPath);
        const data = await pdfParse(pdfBytes);
        extractedText = data.text;
      } catch (err) {
        console.warn(C.LOG.OCR_FAILED, err.message);
      }

      await this.createCaseNote(file.patientId, extractedText, [file.fileName]);
      await fsp.rename(uploadPath, processedPath);
      await this.updateFileStatus(file.id, C.STATUS.PROCESSED, { extractedText });
      console.log(`${C.LOG.PROCESS_PDF_SUCCESS} ${file.originalName}`);
    } catch (err) {
      console.error(`${C.LOG.ERROR_PROCESSING_PDF} ${file.id}:`, err.message);
      throw err;
    }
  }

  async runOCR(filePath) {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', { logger: m => console.log(m) });
    return text;
  }

  parseOCRText(ocrText) {
    const lines = ocrText.split('\n').map(l => l.trim()).filter(Boolean);
    let diagnosis = '', prescription = '', notes = '';

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (/(prescri|prescrip|prescrig)/.test(lowerLine)) prescription = line.replace(/.*(prescri|prescrip|prescrig)[:\s]*/i, '').trim();
      else if (/(clinical\s*note|notes)/.test(lowerLine)) notes = line.replace(/.*(clinical\s*note|notes)[:\s]*/i, '').trim();
      else if (!diagnosis) diagnosis = line;
    }

    return { diagnosis, prescription, notes };
  }

  async createCaseNote(patientId, ocrData, attachments) {
    try {
      const { diagnosis, prescription, notes } = this.parseOCRText(ocrData.notes || ocrData);
      const payload = {
        patientId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        doctor: 'System upload',
        diagnosis: diagnosis || C.OCR.FAILED_TO_EXTRACT,
        prescription: prescription || C.OCR.FAILED_TO_EXTRACT,
        notes: notes || C.OCR.FAILED_TO_EXTRACT,
        attachments: Array.isArray(attachments) ? attachments : [],
        status: C.STATUS.DRAFT
      };

      const response = await axios.post(
        `${C.BACKEND_URL}/api/notes/patient/${patientId}`,
        payload,
        { timeout: C.HTTP.TIMEOUT_LONG, headers: { ...C.HTTP.JSON_HEADER, 'x-api-key': C.WORKER_API_KEY } }
      );

      console.log(`${C.LOG.CASE_NOTE_CREATED} ${patientId}:`, response.data.caseNote.id);
      return response.data.caseNote;

    } catch (error) {
      console.error(C.LOG.CASE_NOTE_FAILED, error.response?.data || error.message);
      throw error;
    }
  }

  async updateFileStatus(fileId, status, metadata = {}) {
    try {
      await axios.patch(`${C.BACKEND_URL}/api/files/${fileId}/status`, { status, metadata }, {
        timeout: C.HTTP.TIMEOUT_LONG,
        headers: { ...C.HTTP.JSON_HEADER, 'x-api-key': C.WORKER_API_KEY }
      });
    } catch (error) {
      console.error(`${C.LOG.FILE_STATUS_FAILED} ${fileId}:`, error.message);
    }
  }

  async addJob(job) {
    this.jobs.push(job);
    console.log(`${C.LOG.JOB_ADDED} ${this.jobs.length}`);
  }

  async stop() { this.isRunning = false; }
  sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}

// Graceful shutdown
process.on('SIGINT', async () => { if (worker) await worker.stop(); process.exit(0); });
process.on('SIGTERM', async () => { if (worker) await worker.stop(); process.exit(0); });

// Start worker
const worker = new HealthAppWorker();
worker.start().catch(error => { console.error(C.LOG.WORKER_FAILED_START, error); process.exit(1); });

module.exports = HealthAppWorker;
