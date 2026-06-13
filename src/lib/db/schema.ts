import { pgTable, serial, integer, text, varchar, timestamp, unique } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const searchHistory = pgTable('search_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  keyword: varchar('keyword', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const quranVerses = pgTable('quran_verses', {
  id: serial('id').primaryKey(),
  surah: integer('surah').notNull(),
  ayah: integer('ayah').notNull(),
  arabic: text('arabic').notNull(),
  translation: text('translation').notNull(),
  surahName: varchar('surah_name', { length: 100 }),
}, (table) => ({
  uniqueSurahAyah: unique().on(table.surah, table.ayah),
}));

export const tafsir = pgTable('tafsir', {
  id: serial('id').primaryKey(),
  verseId: integer('verse_id').notNull().references(() => quranVerses.id, { onDelete: 'cascade' }),
  source: varchar('source', { length: 100 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const bookmarks = pgTable('bookmarks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  verseId: integer('verse_id').notNull().references(() => quranVerses.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueUserVerse: unique().on(table.userId, table.verseId),
}));

// HADITS
export const hadithBooks = pgTable('hadith_books', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique(),
  nameArabic: varchar('name_arabic', { length: 100 }),
  nameIndonesian: varchar('name_indonesian', { length: 100 }),
  totalHadith: integer('total_hadith'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const hadiths = pgTable('hadiths', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id').notNull().references(() => hadithBooks.id, { onDelete: 'cascade' }),
  number: integer('number').notNull(),
  chapter: varchar('chapter', { length: 255 }),
  arabic: text('arabic').notNull(),
  narrator: varchar('narrator', { length: 255 }),
  source: varchar('source', { length: 255 }),
}, (table) => ({
  uniqueBookNumber: unique().on(table.bookId, table.number),
}));

export const hadithTranslations = pgTable('hadith_translations', {
  id: serial('id').primaryKey(),
  hadithId: integer('hadith_id').notNull().references(() => hadiths.id, { onDelete: 'cascade' }),
  language: varchar('language', { length: 10 }).notNull(),
  translator: varchar('translator', { length: 100 }),
  text: text('text').notNull(),
  source: varchar('source', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const hadithGradings = pgTable('hadith_gradings', {
  id: serial('id').primaryKey(),
  hadithId: integer('hadith_id').notNull().references(() => hadiths.id, { onDelete: 'cascade' }),
  scholar: varchar('scholar', { length: 100 }).notNull(),
  grade: varchar('grade', { length: 50 }).notNull(),
  reference: varchar('reference', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// TOPICS
export const topics = pgTable('topics', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  image: varchar('image', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const topicRelations = pgTable('topic_relations', {
  id: serial('id').primaryKey(),
  topicId: integer('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
  contentType: varchar('content_type', { length: 50 }).notNull(),
  contentId: integer('content_id').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});