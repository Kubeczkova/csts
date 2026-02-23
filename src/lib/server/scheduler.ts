import { PgBoss } from 'pg-boss';
import type { Job } from 'pg-boss';
import { execSync } from 'child_process';
import path from 'path';

let bossInstance: PgBoss | null = null;


export async function initScheduler(): Promise<PgBoss> {
  if (bossInstance) {
    return bossInstance;
  }

  const connectionString = process.env.DATABASE_URL;

  const boss = new PgBoss({
    connectionString,
    schema: 'pgboss',
  });

  boss.on('error', (error: Error) => {
    console.error('❌ pg-boss error:', error);
  });

  await boss.start();
  console.log('✅ pg-boss scheduler started');

  bossInstance = boss;

  await setupScheduledJobs(boss);

  return boss;
}

async function setupScheduledJobs(boss: PgBoss): Promise<void> {
  await boss.createQueue('scrape-events-weekly');
  await boss.createQueue('scrape-competitions-weekly');
  await boss.createQueue('scrape-results-weekly');
  console.log('✅ Queues created');

  await registerJobHandlers(boss);

  await boss.schedule(
    'scrape-events-weekly',
    '0 0 * * 1',
    null,
    { tz: 'Europe/Prague' }
  );

  await boss.schedule(
    'scrape-competitions-weekly',
    '5 0 * * 1',
    null,
    { tz: 'Europe/Prague' }
  );

  await boss.schedule(
    'scrape-results-weekly',
    '0 3 * * 1',
    null,
    { tz: 'Europe/Prague' }
  );

  console.log('📅 Scheduled jobs configured:');
  console.log('  - scrape-events-weekly: Every Monday at 00:00');
  console.log('  - scrape-competitions-weekly: Every Monday at 00:05');
  console.log('  - scrape-results-weekly: Every Monday at 03:00');
}

async function registerJobHandlers(boss: PgBoss): Promise<void> {
  await boss.work('scrape-events-weekly', async (_jobs: Job[]) => {
    console.log('🚀 Running scheduled job: scrape-events-weekly');
    try {
      const projectRoot = path.resolve(process.cwd());
      const scriptPath = path.join(projectRoot, 'scripts', 'scrape-events.ts');

      execSync(`tsx ${scriptPath}`, {
        cwd: projectRoot,
        stdio: 'inherit',
        env: { ...process.env }
      });

      console.log('✅ scrape-events-weekly completed successfully');
    } catch (error) {
      console.error('❌ scrape-events-weekly failed:', error);
      throw error;
    }
  });

  await boss.work('scrape-competitions-weekly', async (_jobs: Job[]) => {
    console.log('🚀 Running scheduled job: scrape-competitions-weekly');
    try {
      const projectRoot = path.resolve(process.cwd());
      const scriptPath = path.join(projectRoot, 'scripts', 'scrape-competitions.ts');

      execSync(`tsx ${scriptPath}`, {
        cwd: projectRoot,
        stdio: 'inherit',
        env: { ...process.env }
      });

      console.log('✅ scrape-competitions-weekly completed successfully');
    } catch (error) {
      console.error('❌ scrape-competitions-weekly failed:', error);
      throw error;
    }
  });

  await boss.work('scrape-results-weekly', async (_jobs: Job[]) => {
    console.log('🚀 Running scheduled job: scrape-results-weekly');
    try {
      const projectRoot = path.resolve(process.cwd());
      const scriptPath = path.join(projectRoot, 'scripts', 'scrape-results.ts');

      execSync(`tsx ${scriptPath}`, {
        cwd: projectRoot,
        stdio: 'inherit',
        env: { ...process.env }
      });

      console.log('✅ scrape-results-weekly completed successfully');
    } catch (error) {
      console.error('❌ scrape-results-weekly failed:', error);
      throw error;
    }
  });

  console.log('✅ Job handlers registered');
}

export async function stopScheduler(): Promise<void> {
  if (bossInstance) {
    await bossInstance.stop();
    bossInstance = null;
    console.log('🛑 pg-boss scheduler stopped');
  }
}

export function getScheduler(): PgBoss | null {
  return bossInstance;
}

