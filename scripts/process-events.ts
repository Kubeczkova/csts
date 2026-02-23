import { BaseProcessor } from './base-processor';
import * as schema from '../src/lib/server/db/schema';
import type { EventData } from './types';

class EventProcessor extends BaseProcessor<EventData> {
  constructor() {
    super({
      type: 'competition_events',
      name: 'Event'
    });
  }

  protected async processItem(eventData: EventData, logEntry: typeof schema.log.$inferSelect): Promise<void> {
    await this.db.insert(schema.event).values({
      event_id: eventData.eventId,
      date_from: eventData.dateFrom,
      date_to: eventData.dateTo,
      title: eventData.eventTitle,
      location: eventData.location,
      log_id: logEntry.id.toString()
    });

    console.log(`✅ Saved event: ${eventData.eventTitle}`);
  }
}

const processor = new EventProcessor();
processor.execute();
