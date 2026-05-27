import { db } from '@/db';
import { workouts, workoutExercises, exercises, sets } from '@/db/schema';
import { eq, and, max } from 'drizzle-orm';

export type SetRow = {
  id: string;
  setNumber: number;
  weight: string | null;
  reps: number | null;
};

export type WorkoutExerciseWithSets = {
  workoutExerciseId: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  sets: SetRow[];
};

export type WorkoutDetail = {
  id: string;
  name: string | null;
  startedAt: Date;
  exercises: WorkoutExerciseWithSets[];
};

export async function getWorkoutWithExercisesAndSets(
  userId: string,
  workoutId: string
): Promise<WorkoutDetail | null> {
  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      startedAt: workouts.startedAt,
      workoutExerciseId: workoutExercises.id,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      exerciseOrder: workoutExercises.order,
      setId: sets.id,
      setNumber: sets.setNumber,
      weight: sets.weight,
      reps: sets.reps,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .orderBy(workoutExercises.order, sets.setNumber);

  if (rows.length === 0) return null;

  const first = rows[0];
  const exerciseMap = new Map<string, WorkoutExerciseWithSets>();

  for (const row of rows) {
    if (!row.workoutExerciseId) continue;

    if (!exerciseMap.has(row.workoutExerciseId)) {
      exerciseMap.set(row.workoutExerciseId, {
        workoutExerciseId: row.workoutExerciseId,
        exerciseId: row.exerciseId!,
        exerciseName: row.exerciseName!,
        order: row.exerciseOrder!,
        sets: [],
      });
    }

    if (row.setId) {
      exerciseMap.get(row.workoutExerciseId)!.sets.push({
        id: row.setId,
        setNumber: row.setNumber!,
        weight: row.weight ?? null,
        reps: row.reps ?? null,
      });
    }
  }

  return {
    id: first.workoutId,
    name: first.workoutName,
    startedAt: first.startedAt,
    exercises: Array.from(exerciseMap.values()),
  };
}

export async function getNextExerciseOrder(workoutId: string) {
  const [row] = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  return (row?.maxOrder ?? -1) + 1;
}

export async function addExerciseToWorkout(
  workoutId: string,
  exerciseId: string,
  order: number
) {
  const [we] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order })
    .returning({ id: workoutExercises.id });

  return we;
}

export async function removeExerciseFromWorkout(workoutExerciseId: string) {
  await db.delete(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId));
}
