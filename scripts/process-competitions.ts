import { BaseProcessor } from './base-processor';
import * as schema from '../src/lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { CompetitionData } from './types';

class CompetitionProcessor extends BaseProcessor<CompetitionData> {
  constructor() {
    super({
      type: 'competitions',
      name: 'Competition'
    });
  }

  private async getEnumValue(type: string, enumId: number): Promise<string | null> {
    try {
      const result = await this.db
        .select()
        .from(schema.enums)
        .where(and(eq(schema.enums.type, type), eq(schema.enums.enum_id, enumId.toString())));

      return result.length > 0 ? result[0].value : null;
    } catch (error) {
      console.error(`❌ Error fetching enum value for type=${type}, enum_id=${enumId}:`, error);
      return null;
    }
  }

  protected async processItem(competitionData: CompetitionData): Promise<void> {
    const ageValue = competitionData.ageId
      ? await this.getEnumValue('ageId', competitionData.ageId)
      : null;
    const disciplineValue = competitionData.disciplineId
      ? await this.getEnumValue('disciplineId', competitionData.disciplineId)
      : null;
    const seriesValue = competitionData.seriesId
      ? await this.getEnumValue('seriesId', competitionData.seriesId)
      : null;
    const typeValue = competitionData.typeId
      ? await this.getEnumValue('typeId', competitionData.typeId)
      : null;
    const fromClassValue = competitionData.fromClassId
      ? await this.getEnumValue('fromClassId', competitionData.fromClassId)
      : null;

    await this.db.insert(schema.competition).values({
      event_id: competitionData.eventId.toString(),
      competition_id: competitionData.id.toString(),
      age: ageValue,
      discipline: disciplineValue,
      series: seriesValue,
      type: typeValue,
      from_class: fromClassValue
    });

    console.log(`✅ Saved competition: eventId=${competitionData.eventId}, id=${competitionData.id}, age=${ageValue}, discipline=${disciplineValue}, series=${seriesValue}, type=${typeValue}, from_class=${fromClassValue}`);
  }
}

const processor = new CompetitionProcessor();
processor.execute();
