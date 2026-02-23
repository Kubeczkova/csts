import type { Handle } from '@sveltejs/kit';
import { initScheduler, stopScheduler } from '$lib/server/scheduler';

let schedulerInitialized = false;

if (!schedulerInitialized) {
  initScheduler()
    .then(() => {
      schedulerInitialized = true;
      console.log('✅ Scheduler initialized successfully');
    })
    .catch((error) => {
      console.error('❌ Failed to initialize scheduler:', error);
    });
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

export const handle: Handle = async ({ event, resolve }) => {
  return await resolve(event);
};

