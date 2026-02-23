
export interface Participant {
  names: string;
  placement: string;
  url: string;
  highlight?: string;
}

export interface Competition {
  competitionId: string;
  age: string | null;
  discipline: string | null;
  from_class: string | null;
  participants: Participant[];
}

export interface EventResult {
  title: string;
  eventId: number;
  date: string;
  competitions: Competition[];
}

// API Response types
export interface ResultsApiResponse {
  results: EventResult[];
  filters: {
    club: string | null;
    time: string;
    dateFrom: string;
  };
}

export interface ClubsApiResponse {
  clubs: string[];
}

