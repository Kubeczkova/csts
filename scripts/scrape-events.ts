import { BaseScraper } from './base-scraper';

const FROM_TIME = '2026-02-10';
const TO_TIME = '2026-02-16';
const BASE_URL = "https://www.csts.cz/api/1/";
const TYPE = 'competition_events';

class EventScraper extends BaseScraper {
  readonly url: string;

  constructor() {
    super({
      type: TYPE,
      baseUrl: BASE_URL,
      processScriptName: 'process-events.ts'
    });
    this.url = `${BASE_URL}${TYPE}?from=${FROM_TIME}&to=${TO_TIME}`;
  }

  async scrape(): Promise<void> {
    console.log('🚀 Starting event scraping...');

    const data = await this.getData(this.url);

    if (data && data.length > 0) {
      await this.saveDataToLog(this.url, data);
      console.log(`✅ Scraped and saved ${data.length} events to database`);

      // Immediately process the events after successful save
      try {
        await this.runProcessScript();
      } catch (processError) {
        console.error('❌ Error running process-events.ts:', processError);
        console.log('⚠️ Event scraping completed but processing failed');
      }
    } else {
      console.log('ℹ️ No data received from API');
    }
  }
}

const scraper = new EventScraper();
scraper.execute();
