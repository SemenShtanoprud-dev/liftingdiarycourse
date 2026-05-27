import { db } from '@/db';
import { workouts, workoutExercises, exercises } from '@/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

export async function createWorkout(params: {
  userId: string;
  name: string | null;
  startedAt: Date;
}) {
  const [workout] = await db
    .insert(workouts)
    .values({
      userId: params.userId,
      name: params.name,
      startedAt: params.startedAt,
    })
    .returning({ id: workouts.id });

  return workout;
}

export async function getWorkoutById(userId: string, workoutId: string) {
  const [workout] = await db
    .select({
      id: workouts.id,
      name: workouts.name,
      startedAt: workouts.startedAt,
    })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1);

  return workout ?? null;
}

export async function updateWorkout(params: {
  userId: string;
  workoutId: string;
  name: string | null;
  startedAt: Date;
}) {
  await db
    .update(workouts)
    .set({ name: params.name, startedAt: params.startedAt })
    .where(and(eq(workouts.id, params.workoutId), eq(workouts.userId, params.userId)));
}

export async function getWorkoutsForUserOnDate(userId: string, date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      exerciseName: exercises.name,
      exerciseOrder: workoutExercises.order,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, start),
        lt(workouts.startedAt, end)
      )
    )
    .orderBy(workouts.startedAt, workoutExercises.order);

  const workoutMap = new Map<
    string,
    { id: string; name: string | null; startedAt: Date; completedAt: Date | null; exercises: string[] }
  >();

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        id: row.workoutId,
        name: row.workoutName,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        exercises: [],
      });
    }
    if (row.exerciseName) {
      workoutMap.get(row.workoutId)!.exercises.push(row.exerciseName);
    }
  }

  return Array.from(workoutMap.values());
}
