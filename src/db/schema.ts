import {
  pgTable,
  serial,
  text,
  integer,
  real,
  boolean,
  timestamp,
  date,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Profile / exam settings (single row, acts as the control center config)
// ---------------------------------------------------------------------------
export const examProfile = pgTable("exam_profile", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").default("Future Band 9"),
  examDate: date("exam_date"),
  targetBand: real("target_band").default(9),
  currentListening: real("current_listening").default(0),
  currentReading: real("current_reading").default(0),
  currentWriting: real("current_writing").default(0),
  currentSpeaking: real("current_speaking").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Roadmap: phases + tasks (the full A-Z study plan)
// ---------------------------------------------------------------------------
export const roadmapPhases = pgTable("roadmap_phases", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
  colorTag: varchar("color_tag", { length: 20 }).default("violet"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const roadmapTasks = pgTable("roadmap_tasks", {
  id: serial("id").primaryKey(),
  phaseId: integer("phase_id").references(() => roadmapPhases.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  skill: varchar("skill", { length: 20 }).default("general"), // listening/reading/writing/speaking/vocab/general
  status: varchar("status", { length: 20 }).default("todo"), // todo/in_progress/done
  priority: varchar("priority", { length: 10 }).default("medium"), // low/medium/high
  orderIndex: integer("order_index").notNull().default(0),
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Daily study log / streak tracker
// ---------------------------------------------------------------------------
export const dailyLogs = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  logDate: date("log_date").notNull(),
  skill: varchar("skill", { length: 20 }).notNull(),
  minutesSpent: integer("minutes_spent").default(0),
  notes: text("notes"),
  mood: varchar("mood", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Mistake log
// ---------------------------------------------------------------------------
export const mistakes = pgTable("mistakes", {
  id: serial("id").primaryKey(),
  skill: varchar("skill", { length: 20 }).notNull(),
  questionType: text("question_type"),
  description: text("description").notNull(),
  correction: text("correction"),
  source: text("source"),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Vocabulary bank + spaced repetition progress
// ---------------------------------------------------------------------------
export const vocabulary = pgTable("vocabulary", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  meaning: text("meaning").notNull(),
  banglaMeaning: text("bangla_meaning"),
  example: text("example"),
  synonym: text("synonym"),
  partOfSpeech: varchar("part_of_speech", { length: 30 }),
  topic: varchar("topic", { length: 60 }).default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vocabularyProgress = pgTable("vocabulary_progress", {
  id: serial("id").primaryKey(),
  vocabId: integer("vocab_id").references(() => vocabulary.id, { onDelete: "cascade" }).notNull(),
  box: integer("box").default(1), // leitner box 1-5
  timesCorrect: integer("times_correct").default(0),
  timesWrong: integer("times_wrong").default(0),
  nextReviewDate: date("next_review_date"),
  lastReviewedAt: timestamp("last_reviewed_at"),
});

// ---------------------------------------------------------------------------
// Writing lab submissions
// ---------------------------------------------------------------------------
export const writingSubmissions = pgTable("writing_submissions", {
  id: serial("id").primaryKey(),
  taskType: varchar("task_type", { length: 10 }).default("task2"), // task1 / task2
  prompt: text("prompt"),
  essayText: text("essay_text").notNull(),
  wordCount: integer("word_count").default(0),
  bandOverall: real("band_overall"),
  bandTa: real("band_ta"),
  bandCc: real("band_cc"),
  bandLr: real("band_lr"),
  bandGr: real("band_gr"),
  feedback: jsonb("feedback"),
  rewriteText: text("rewrite_text"),
  engine: varchar("engine", { length: 10 }).default("heuristic"), // heuristic / ai
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Speaking lab sessions
// ---------------------------------------------------------------------------
export const speakingSessions = pgTable("speaking_sessions", {
  id: serial("id").primaryKey(),
  part: varchar("part", { length: 10 }).default("part1"), // part1/part2/part3
  question: text("question"),
  transcript: text("transcript").notNull(),
  durationSeconds: integer("duration_seconds").default(0),
  wordsPerMinute: real("words_per_minute"),
  fillerCount: integer("filler_count").default(0),
  bandOverall: real("band_overall"),
  feedback: jsonb("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Mock test score history + band calculator + file evidence
// ---------------------------------------------------------------------------
export const mockTests = pgTable("mock_tests", {
  id: serial("id").primaryKey(),
  source: text("source").default("Cambridge"), // Cambridge / Engnovate / Other
  bookOrSet: text("book_or_set"),
  testNumber: text("test_number"),
  skill: varchar("skill", { length: 20 }).notNull(), // listening/reading/writing/speaking
  rawScore: integer("raw_score"),
  totalQuestions: integer("total_questions"),
  band: real("band"),
  dateTaken: date("date_taken"),
  notes: text("notes"),
  attachmentUrl: text("attachment_url"),
  attachmentType: varchar("attachment_type", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Resource library (saved fb videos, websites, tips)
// ---------------------------------------------------------------------------
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url"),
  category: varchar("category", { length: 30 }).default("link"), // video/article/tool/tip
  notes: text("notes"),
  skill: varchar("skill", { length: 20 }).default("general"),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Diagnostic test attempts
// ---------------------------------------------------------------------------
export const diagnosticAttempts = pgTable("diagnostic_attempts", {
  id: serial("id").primaryKey(),
  skill: varchar("skill", { length: 20 }).notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  bandEstimate: real("band_estimate"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
