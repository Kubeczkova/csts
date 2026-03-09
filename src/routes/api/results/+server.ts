import { json } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '$lib/server/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import type { EventResult } from '$lib/types';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL);
const db = drizzle(client, { schema });


export async function GET({ url }: { url: URL }) {
  try {
    const clubFilter = url.searchParams.get('club');
    const timeFilter = url.searchParams.get('time') || 'week';

    const today = new Date();
    const dateFrom = new Date(today);
    const dateTo = new Date(today);

    if (timeFilter === 'month') {
      dateFrom.setMonth(dateFrom.getMonth() - 1);
    } else {
      dateFrom.setDate(dateFrom.getDate() - 7);
    }

    const dateFromStr = dateFrom.toISOString().split('T')[0];
    const dateToStr = dateTo.toISOString().split('T')[0];

    const query = db
      .select({
        eventTitle: schema.event.title,
        eventId: schema.event.event_id,
        eventDate: schema.event.date_from,
        participantFirst: schema.participant.first,
        participantSecond: schema.participant.second,
        participantRanking: schema.participant.ranking,
        participantRankingTo: schema.participant.ranking_to,
        participantClub: schema.participant.club,
        competitionId: schema.competition.competition_id,
        competitionAge: schema.competition.age,
        competitionDiscipline: schema.competition.discipline,
        competitionFromClass: schema.competition.from_class
      })
      .from(schema.participant)
      .innerJoin(schema.competition, eq(schema.participant.competition_id, schema.competition.competition_id))
      .innerJoin(schema.event, eq(schema.competition.event_id, sql`cast(${schema.event.event_id} as text)`))
      .where(
        and(
          gte(schema.event.date_from, dateFromStr),
          sql`${schema.event.date_from} <= ${dateToStr}`,
          clubFilter ? eq(schema.participant.club, clubFilter) : undefined
        )
      )
      .orderBy(schema.event.date_from, sql`CAST(${schema.participant.ranking} AS INTEGER)`);

    const results = await query;

    const groupedResults: Record<string, EventResult> = {};

    for (const row of results) {
      const eventKey = `${row.eventId}`;

      if (!groupedResults[eventKey]) {
        groupedResults[eventKey] = {
          title: row.eventTitle || 'Unknown Event',
          eventId: row.eventId || 0,
          date: row.eventDate || '',
          competitions: []
        };
      }

      let competition = groupedResults[eventKey].competitions.find(
        c => c.competitionId === row.competitionId
      );

      if (!competition) {
        competition = {
          competitionId: row.competitionId,
          age: row.competitionAge,
          discipline: row.competitionDiscipline,
          from_class: row.competitionFromClass,
          participants: []
        };
        groupedResults[eventKey].competitions.push(competition);
      }

      const ranking = String(row.participantRanking).trim();
      competition.participants.push({
        names: row.participantSecond
          ? `${row.participantFirst} & ${row.participantSecond}`
          : row.participantFirst,
        placement: row.participantRanking,
        url: 'https://www.csts.cz/dancesport/vysledky_soutezi/event/' + row.eventId + '/competition/' + row.competitionId,
        highlight: ranking === '1' ? 'gold' : ranking === '2' ? 'silver' : ranking === '3' ? 'bronze' : undefined
      });
    }

    const eventsArray = Object.values(groupedResults).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    return json({
      results: eventsArray,
      filters: {
        club: clubFilter,
        time: timeFilter,
        dateFrom: dateFromStr
      }
    });
  } catch (error) {
    return json(
      {
        success: false,
        error: 'Failed to fetch results'
      },
      { status: 500 }
    );
  }
}
