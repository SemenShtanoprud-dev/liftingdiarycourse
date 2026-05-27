import { db } from '@/db';
import { sets } from '@/db/schema';
import { eq, max } from 'drizzle-orm';

export async function getNextSetNumber(workoutExerciseId: string) {
  const [row] = await db
    .select({ maxSetNumber: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  return (row?.maxSetNumber ?? 0) + 1;
}

export async function addSet(
  workoutExerciseId: string,
  setNumber: number,
  weight: string | null,
  reps: number | null
) {
  const [set] = await db
    .insert(sets)
    .values({ workoutExerciseId, setNumber, weight, reps })
    .returning({ id: sets.id });

  return set;
}

export async function removeSet(setId: string) {
  await db.delete(sets).where(eq(sets.id, setId));
}
