import { json } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '$lib/server/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL);
const db = drizzle(client, { schema });

export async function GET() {
  try {
    const today = new Date();
    const dateFrom = new Date(today);
    dateFrom.setDate(dateFrom.getDate() - 7);
    const dateFromStr = dateFrom.toISOString().split('T')[0];

    const clubs = await db
      .selectDistinct({ club: schema.participant.club })
      .from(schema.participant)
      .innerJoin(schema.competition, eq(schema.participant.competition_id, schema.competition.competition_id))
      .innerJoin(schema.event, eq(schema.competition.event_id, sql`cast(${schema.event.event_id} as text)`))
      .where(
        and(
          gte(schema.event.date_from, dateFromStr),
          sql`${schema.participant.club} IS NOT NULL`
        )
      )
      .orderBy(schema.participant.club);

    const clubNames = clubs.map(c => c.club).filter(club => club !== null);

    return json({
      success: true,
      clubs: clubNames
    });
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return json(
      {
        success: false,
        error: 'Failed to fetch clubs'
      },
      { status: 500 }
    );
  }
}
