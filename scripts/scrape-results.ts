import { BaseScraper } from './base-scraper';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/server/db/schema';

const BASE_URL = "https://www.csts.cz/api/1/";
const TYPE = 'result';

class ResultScraper extends BaseScraper {
  constructor() {
    super({
      type: TYPE,
      baseUrl: BASE_URL,
      processScriptName: 'process-results.ts'
    });
  }

  private async markCompetitionAsProcessed(competitionId: number): Promise<void> {
    try {
      await this.db
        .update(schema.competition)
        .set({ is_processed: true })
        .where(eq(schema.competition.id, competitionId));
      console.log(`✅ Marked competition ${competitionId} as processed`);
    } catch (error) {
      console.error(`❌ Error marking competition ${competitionId} as processed:`, error);
      throw error;
    }
  }

  async scrape(): Promise<void> {
    console.log('🚀 Starting results scraping...');

    const unprocessedCompetitions = await this.db
      .select()
      .from(schema.competition)
      .where(eq(schema.competition.is_processed, false));

    console.log(`Found ${unprocessedCompetitions.length} unprocessed competitions`);

    if (unprocessedCompetitions.length === 0) {
      console.log('ℹ️ No unprocessed competitions found');
      return;
    }

    let successfulScrapes = 0;

    for (const competitionRecord of unprocessedCompetitions) {
      try {
        const competition_id = competitionRecord.competition_id;
        const url = `${BASE_URL}competitions/${competition_id}/${TYPE}`;

        console.log(`🔍 Processing competition DB ID: ${competitionRecord.id}, Competition ID: ${competition_id}`);
        console.log(`📊 Event ID: ${competitionRecord.event_id}`);

        const data = await this.getData(url);

        if (data && data.length > 0) {
          console.log(`📋 Retrieved ${data.length} result entries`);
          await this.saveDataToLog(url, data, `competition ID: ${competition_id}`);
          console.log(`✅ Scraped and saved ${data.length} results for competition ID: ${competition_id}`);
          successfulScrapes++;

          await this.markCompetitionAsProcessed(competitionRecord.id);
        } else {
          console.log(`ℹ️ No result data received for competition ID: ${competition_id}`);
          await this.saveDataToLog(url, [], `competition ID: ${competition_id}`);
        }

        if (competitionRecord !== unprocessedCompetitions[unprocessedCompetitions.length - 1]) {
          console.log('⏱️ Waiting 1 minute before processing next competition...');
          await this.wait(this.config.rateLimit!);
        }

      } catch (competitionError) {
        console.error(`❌ Error processing competition ${competitionRecord.id}:`, competitionError);
      }
    }

    console.log('✅ Results scraping completed');

    if (successfulScrapes > 0) {
      try {
        await this.runProcessScript();
      } catch (processError) {
        console.error('❌ Error running process-results.ts:', processError);
        console.log('⚠️ Results scraping completed but processing failed');
      }
    } else {
      console.log('ℹ️ No new result data to process');
    }
  }
}

const scraper = new ResultScraper();
scraper.execute();
