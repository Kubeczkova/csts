import { pgTable, date, serial, integer, boolean, text } from 'drizzle-orm/pg-core';

export const log = pgTable('log', {
	id: serial('id').primaryKey(),
	x_created: date('x_created').notNull(),
	type: text('type'),
	url: text('url').notNull(),
	request: text('request').notNull(),
	is_processed: boolean('is_processed').notNull().default(false),
});

export const event = pgTable('event', {
	id: serial('id').primaryKey(),
	event_id: integer('event_id').notNull(),
	date_from: date('date_from').notNull(),
	date_to: date('date_to').notNull(),
	title: text('title').notNull(),
	location: text('location').notNull(),
	is_processed: boolean('is_processed').notNull().default(false),
	log_id: text('log_id').notNull(),
});

export const participant = pgTable('participant', {
	id: serial('id').primaryKey(),
	competition_id: text('competition_id').notNull(),
	club: text('club'),
	first: text('first').notNull(),
	second: text('second').notNull(),
	ranking: text('ranking').notNull(),
	ranking_to: text('ranking_to').notNull(),
});

export const competition = pgTable('competition', {
	id: serial('id').primaryKey(),
	event_id: text('event_id').notNull(),
	competition_id: text('competition_id').notNull(),
	is_processed: boolean('is_processed').notNull().default(false),
	age: text('age'),
	discipline: text('discipline'),
	series: text('series'),
	type: text('type'),
	from_class: text('from_class'),
});

export const enums = pgTable('enums', {
	id: serial('id').primaryKey(),
	type: text('type').notNull(),
	enum_id: text('enum_id').notNull(),
	value: text('value').notNull(),
});