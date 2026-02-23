import { BaseProcessor } from './base-processor';
import * as schema from '../src/lib/server/db/schema';
import type { ResultEntity } from './types';

class ResultProcessor extends BaseProcessor<ResultEntity> {
  constructor() {
    super({
      type: 'result',
      name: 'Result'
    });
  }

  protected async processItem(resultData: ResultEntity): Promise<void> {
    const entity = resultData.entity;
    const competitionId = entity.competitionId.toString();

    console.log(`📊 Processing competition ${competitionId} with ${entity.competitors.length} competitors`);

    for (const competitor of entity.competitors) {
      try {
        const firstDancer = competitor.competitor.name1 + ' ' + competitor.competitor.surname1;
        const secondDancer = competitor.competitor.name2 && competitor.competitor.surname2
          ? competitor.competitor.name2 + ' ' + competitor.competitor.surname2
          : '';

        await this.db.insert(schema.participant).values({
          competition_id: competitionId,
          club: competitor.club,
          first: firstDancer,
          second: secondDancer,
          ranking: competitor.ranking.toString(),
          ranking_to: competitor.rankingTo.toString(),
        });

        const participantDisplay = secondDancer
          ? `${firstDancer} & ${secondDancer}`
          : firstDancer;
        console.log(`✅ Saved participant: ${participantDisplay} (Ranking: ${competitor.ranking})`);
      } catch (participantError) {
        console.error(`❌ Error saving participant ${competitor.competitor.name1} ${competitor.competitor.surname1}:`, participantError);
      }
    }
  }
}

const processor = new ResultProcessor();
processor.execute();
