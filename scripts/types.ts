
export interface ScraperConfig {
  type: string;
  baseUrl: string;
  processScriptName: string;
  rateLimit?: number;
}

export interface ProcessorConfig {
  type: string; // log type to process
  name: string; // processor name for logging
}

export interface EventData {
  eventId: number;
  dateFrom: string;
  dateTo: string;
  eventTitle: string;
  location: string;
}

export interface CompetitionData {
  id: number;
  eventId: number;
  eventCompId: number;
  dayOfEvent: number;
  fromClassId: number;
  ageId: number;
  competitorId: number;
  disciplineId: number;
  seriesId: number;
  typeId: number;
  checkinEnd: string;
  startFee: number;
  dances: string[];
  date: string;
}

export interface Competitor {
  competitorId: number;
  club: string;
  startNumber: number;
  ranking: number;
  rankingTo: number;
  competitor: {
    id: number;
    name1: string;
    name2: string;
    surname1: string;
    surname2: string;
    country: string;
    club: string;
  };
}

export interface ResultEntity {
  entity: {
    competitionId: number;
    type: string;
    competitors: Competitor[];
    rounds: Array<{
      round: string;
      dances: string[];
    }>;
  };
}

