#!/usr/bin/env tsx
import { initScheduler, stopScheduler } from '../src/lib/server/scheduler';

async function main() {
  console.log('🚀 Starting standalone scheduler...');

  try {
    await initScheduler();
    console.log('✅ Scheduler is running. Press Ctrl+C to stop.');
  } catch (error) {
    console.error('❌ Failed to start scheduler:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, stopping scheduler...');
  await stopScheduler();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, stopping scheduler...');
  await stopScheduler();
  process.exit(0);
});

main();

