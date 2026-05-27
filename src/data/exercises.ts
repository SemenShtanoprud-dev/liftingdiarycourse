import { db } from '@/db';
import { exercises } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function getAllExercises() {
  return db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .orderBy(asc(exercises.name));
}

export async function findExerciseByExactName(name: string) {
  const [exercise] = await db
    .select({ id: exercises.id })
    .from(exercises)
    .where(eq(exercises.name, name))
    .limit(1);

  return exercise ?? null;
}

export async function createExercise(name: string) {
  const [exercise] = await db
    .insert(exercises)
    .values({ name })
    .returning({ id: exercises.id });

  return exercise;
}
