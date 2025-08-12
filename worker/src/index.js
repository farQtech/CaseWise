const axios = require('axios');
require('dotenv').config();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const SEED_RETRY_ATTEMPTS = 5;
const SEED_RETRY_DELAY = 2000; // 2 seconds

class HealthAppWorker {
  constructor() {
    this.isRunning = false;
    this.jobs = [];
  }

  async start() {
    console.log('🚀 Health App Worker starting...');
    this.isRunning = true;

    try {
      // First, ensure admin user is seeded
      await this.seedAdminUser();
      
      // Start the main worker loop
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
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
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
        // Check backend health
        await this.checkBackendHealth();
        
        // Process any pending jobs (placeholder for future OCR tasks)
        await this.processJobs();
        
        // Wait before next iteration
        await this.sleep(30000); // 30 seconds
      } catch (error) {
        console.error('❌ Worker loop error:', error.message);
        await this.sleep(5000); // Wait 5 seconds before retrying
      }
    }
  }

  async checkBackendHealth() {
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, {
        timeout: 5000
      });
      
      if (response.status === 200) {
        console.log('💚 Backend health check: OK');
      }
    } catch (error) {
      console.warn('⚠️  Backend health check failed:', error.message);
    }
  }

  async processJobs() {
    // Placeholder for future OCR job processing
    if (this.jobs.length > 0) {
      console.log(`📋 Processing ${this.jobs.length} pending jobs...`);
      // Future OCR processing logic will go here
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

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  if (worker) {
    await worker.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  if (worker) {
    await worker.stop();
  }
  process.exit(0);
});

// Start the worker
const worker = new HealthAppWorker();
worker.start().catch(error => {
  console.error('❌ Worker startup failed:', error);
  process.exit(1);
});

module.exports = HealthAppWorker;

