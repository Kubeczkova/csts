import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema';
import { config } from 'dotenv';
import { eq, and } from 'drizzle-orm';
import type { ProcessorConfig } from './types';

config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

export abstract class BaseProcessor<T> {
  protected client: postgres.Sql;
  protected db: ReturnType<typeof drizzle>;
  protected config: ProcessorConfig;

  protected constructor(config: ProcessorConfig) {
    this.config = config;
    this.client = postgres.default(process.env.DATABASE_URL!);
    this.db = drizzle(this.client, { schema });
  }

  protected async getUnprocessedLogs(): Promise<Array<typeof schema.log.$inferSelect>> {
    return await this.db
      .select()
      .from(schema.log)
      .where(and(eq(schema.log.is_processed, false), eq(schema.log.type, this.config.type)));
  }

  protected parseLogData(logEntry: typeof schema.log.$inferSelect): T[] {
    try {
      return JSON.parse(logEntry.request) as T[];
    } catch (error) {
      console.error(`❌ Error parsing log entry ${logEntry.id}:`, error);
      throw error;
    }
  }

  protected async markLogAsProcessed(logId: number): Promise<void> {
    try {
      await this.db
        .update(schema.log)
        .set({ is_processed: true })
        .where(eq(schema.log.id, logId));
      console.log(`✅ Marked log entry ${logId} as processed`);
    } catch (error) {
      console.error(`❌ Error marking log entry ${logId} as processed:`, error);
      throw error;
    }
  }

  protected async close(): Promise<void> {
    await this.client.end();
  }

  protected abstract processItem(item: T, logEntry: typeof schema.log.$inferSelect): Promise<void>;

  async process(): Promise<void> {
    try {
      console.log(`🚀 Starting ${this.config.name} processing...`);

      const unprocessedLogs = await this.getUnprocessedLogs();
      console.log(`Found ${unprocessedLogs.length} unprocessed ${this.config.type} log entries`);

      for (const logEntry of unprocessedLogs) {
        try {
          const dataArray = this.parseLogData(logEntry);
          console.log(`Processing log entry ${logEntry.id} with ${dataArray.length} items`);

          for (const item of dataArray) {
            try {
              await this.processItem(item, logEntry);
            } catch (itemError) {
              console.error(`❌ Error processing item:`, itemError);
            }
          }
          await this.markLogAsProcessed(logEntry.id);

        } catch (parseError) {
          console.error(`❌ Error processing log entry ${logEntry.id}:`, parseError);
        }
      }

      console.log(`✅ ${this.config.name} processing completed`);

    } catch (error) {
      console.error(`❌ Error in ${this.config.name} processing:`, error);
      throw error;
    } finally {
      await this.close();
    }
  }

  async execute(): Promise<void> {
    try {
      await this.process();
      console.log(`🎉 ${this.config.name} processing completed successfully`);
      process.exit(0);
    } catch (error) {
      console.error(`💥 ${this.config.name} processing failed:`, error);
      process.exit(1);
    }
  }
}

