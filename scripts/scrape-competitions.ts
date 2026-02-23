import { BaseScraper } from './base-scraper';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/server/db/schema';

const BASE_URL = "https://www.csts.cz/api/1/";
const TYPE = 'competitions';

class CompetitionScraper extends BaseScraper {
  constructor() {
    super({
      type: TYPE,
      baseUrl: BASE_URL,
      processScriptName: 'process-competitions.ts'
    });
  }

  private async markEventAsProcessed(eventId: number): Promise<void> {
    try {
      await this.db
        .update(schema.event)
        .set({ is_processed: true })
        .where(eq(schema.event.id, eventId));
      console.log(`✅ Marked event ${eventId} as processed`);
    } catch (error) {
      console.error(`❌ Error marking event ${eventId} as processed:`, error);
      throw error;
    }
  }

  async scrape(): Promise<void> {
    console.log('🚀 Starting competition scraping...');

    const unprocessedEvents = await this.db
      .select()
      .from(schema.event)
      .where(eq(schema.event.is_processed, false));

    console.log(`Found ${unprocessedEvents.length} unprocessed events`);

    if (unprocessedEvents.length === 0) {
      console.log('ℹ️ No unprocessed events found');
      return;
    }

    let successfulScrapes = 0;

    for (const eventRecord of unprocessedEvents) {
      try {
        const competition_id = eventRecord.event_id;
        const url = `${BASE_URL}events/${competition_id}/${TYPE}`;

        console.log(`🔍 Processing event ID: ${eventRecord.id}, Competition ID: ${competition_id}`);
        console.log(`📅 Event: ${eventRecord.title} (${eventRecord.date_from})`);

        const data = await this.getData(url);

        if (data && data.length > 0) {
          await this.saveDataToLog(url, data, `competition ID: ${competition_id}`);
          console.log(`✅ Scraped and saved ${data.length} competition results for competition ID: ${competition_id}`);
          successfulScrapes++;
        } else {
          console.log(`ℹ️ No competition data received for competition ID: ${competition_id}`);
          await this.saveDataToLog(url, [], `competition ID: ${competition_id}`);
        }

        await this.markEventAsProcessed(eventRecord.id);

        if (eventRecord !== unprocessedEvents[unprocessedEvents.length - 1]) {
          console.log('⏱️ Waiting 1 minute before processing next event...');
          await this.wait(this.config.rateLimit!);
        }

      } catch (eventError) {
        console.error(`❌ Error processing event ${eventRecord.id}:`, eventError);
      }
    }

    console.log('✅ Competition scraping completed');

    if (successfulScrapes > 0) {
      try {
        await this.runProcessScript();
      } catch (processError) {
        console.error('❌ Error running process-competitions.ts:', processError);
        console.log('⚠️ Competition scraping completed but processing failed');
      }
    } else {
      console.log('ℹ️ No new competition data to process');
    }
  }
}

const scraper = new CompetitionScraper();
scraper.execute();
