require('dotenv').config();

console.log('🚀 Health App Worker starting...');

// Basic worker setup
class HealthAppWorker {
  constructor() {
    this.isRunning = false;
    this.jobs = [];
  }

  start() {
    this.isRunning = true;
    console.log('✅ Worker started successfully');
    this.processJobs();
  }

  stop() {
    this.isRunning = false;
    console.log('⏹️ Worker stopped');
  }

  addJob(job) {
    this.jobs.push(job);
    console.log(`📝 Job added: ${job.type}`);
  }

  async processJobs() {
    while (this.isRunning) {
      if (this.jobs.length > 0) {
        const job = this.jobs.shift();
        await this.processJob(job);
      }
      // Wait a bit before checking for new jobs
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async processJob(job) {
    try {
      console.log(`🔄 Processing job: ${job.type}`);
      
      // Simulate job processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`✅ Job completed: ${job.type}`);
    } catch (error) {
      console.error(`❌ Job failed: ${job.type}`, error);
    }
  }
}

// Start the worker
const worker = new HealthAppWorker();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  worker.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  worker.stop();
  process.exit(0);
});

// Start the worker
worker.start();

// Add some sample jobs
setTimeout(() => {
  worker.addJob({ type: 'health-check', data: { timestamp: new Date().toISOString() } });
}, 2000);

setTimeout(() => {
  worker.addJob({ type: 'data-sync', data: { source: 'external-api' } });
}, 5000);
