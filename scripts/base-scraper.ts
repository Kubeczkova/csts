import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema';
import { config } from 'dotenv';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { ScraperConfig } from './types';

config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}


export abstract class BaseScraper {
  protected client: postgres.Sql;
  protected db: ReturnType<typeof drizzle>;
  protected config: ScraperConfig;

  constructor(config: ScraperConfig) {
    this.config = {
      rateLimit: 60000, // default 1 minute
      ...config
    };
    this.client = postgres.default(process.env.DATABASE_URL!);
    this.db = drizzle(this.client, { schema });
  }

  protected async getData(url: string): Promise<any[] | null> {
    console.log(`Fetching data from: ${url}`);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          console.log("Resource not found (404).");
          return null;
        } else if (response.status === 429) {
          console.log("Too many requests (429). Waiting 60 seconds...");
          await this.wait(60000);
          return this.getData(url);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();

      return this.parseResponse(data);

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch/parse JSON response: ${error.message}`);
      }
      throw new Error(`Failed to fetch/parse JSON response: ${error}`);
    }
  }

  protected parseResponse(data: any): any[] | null {
    if (Array.isArray(data) && data.length > 0 && data[0].entity) {
      console.log(`Found ${data.length} entities`);
      return data;
    }

    // Check if response has a collection property
    if (data && data.collection) {
      console.log(`Found ${data.collection.length} items in collection`);
      return data.collection;
    }

    // If data is an array
    if (Array.isArray(data)) {
      console.log(`Found ${data.length} items in direct array`);
      return data;
    }

    // If data exists but is not an array, wrap it
    if (data) {
      console.log('Found single object, wrapping in array');
      return [data];
    }

    console.log('No data found in response');
    return null;
  }

  protected async saveDataToLog(url: string, data: any, identifier?: string): Promise<void> {
    try {
      await this.db.insert(schema.log).values({
        type: this.config.type,
        x_created: new Date().toISOString().split('T')[0],
        url: url,
        request: JSON.stringify(data),
        is_processed: false
      });

      const idMsg = identifier ? ` for ${identifier}` : '';
      console.log(`✅ Data saved to log table successfully${idMsg}`);
    } catch (error) {
      console.error('❌ Error saving data to log:', error);
      throw error;
    }
  }

  protected async runProcessScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🔄 Starting ${this.config.processScriptName}...`);

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const scriptPath = join(__dirname, this.config.processScriptName);

      const child = spawn('tsx', [scriptPath], {
        stdio: 'inherit',
        env: process.env
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${this.config.processScriptName} completed successfully`);
          resolve();
        } else {
          console.error(`❌ ${this.config.processScriptName} failed with exit code ${code}`);
          reject(new Error(`${this.config.processScriptName} failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        console.error(`❌ Error running ${this.config.processScriptName}:`, error);
        reject(error);
      });
    });
  }

  protected async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected async close(): Promise<void> {
    await this.client.end();
  }

  abstract scrape(): Promise<void>;

  async execute(): Promise<void> {
    try {
      await this.scrape();
      console.log(`🎉 ${this.config.type} scraping completed successfully`);
      process.exit(0);
    } catch (error) {
      console.error(`💥 ${this.config.type} scraping failed:`, error);
      process.exit(1);
    } finally {
      await this.close();
    }
  }
}

