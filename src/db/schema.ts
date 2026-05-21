import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
};

const createdAtOnly = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .default(sql`now()`),
};

// ─── exercises ───────────────────────────────────────────────────────────────

export const exercises = pgTable('exercises', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  ...timestamps,
});

// ─── workouts ────────────────────────────────────────────────────────────────

export const workouts = pgTable(
  'workouts',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: text('user_id').notNull(),
    name: text('name'),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    ...timestamps,
  },
  (table) => [
    index('workouts_user_id_started_at_idx').on(table.userId, table.startedAt),
  ]
);

// ─── workout_exercises ───────────────────────────────────────────────────────

export const workoutExercises = pgTable(
  'workout_exercises',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    workoutId: uuid('workout_id')
      .notNull()
      .references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    order: integer('order').notNull().default(0),
    ...createdAtOnly,
  },
  (table) => [
    index('workout_exercises_workout_id_idx').on(table.workoutId),
  ]
);

// ─── sets ────────────────────────────────────────────────────────────────────

export const sets = pgTable(
  'sets',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    workoutExerciseId: uuid('workout_exercise_id')
      .notNull()
      .references(() => workoutExercises.id, { onDelete: 'cascade' }),
    setNumber: integer('set_number').notNull(),
    weight: numeric('weight', { precision: 6, scale: 2 }),
    reps: integer('reps'),
    ...createdAtOnly,
  },
  (table) => [
    index('sets_workout_exercise_id_idx').on(table.workoutExerciseId),
  ]
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout: one(workouts, {
    fields: [workoutExercises.workoutId],
    references: [workouts.id],
  }),
  exercise: one(exercises, {
    fields: [workoutExercises.exerciseId],
    references: [exercises.id],
  }),
  sets: many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

// ─── TypeScript types ─────────────────────────────────────────────────────────

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;

export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;
