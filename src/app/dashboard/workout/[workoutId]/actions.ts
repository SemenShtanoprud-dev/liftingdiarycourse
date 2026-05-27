"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { updateWorkout, getWorkoutById } from "@/data/workouts";
import {
  findExerciseByExactName,
  createExercise,
} from "@/data/exercises";
import {
  getNextExerciseOrder,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
} from "@/data/workout-exercises";
import { getNextSetNumber, addSet, removeSet } from "@/data/sets";

const schema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().max(100).optional(),
  startedAt: z.string().date(),
});

export type UpdateWorkoutState = {
  success: boolean;
  errors?: { workoutId?: string[]; name?: string[]; startedAt?: string[] };
};

export async function updateWorkoutAction(
  _prev: UpdateWorkoutState,
  params: { workoutId: string; name: string; startedAt: string }
): Promise<UpdateWorkoutState> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, errors: {} };
  }

  const result = schema.safeParse(params);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { workoutId, name, startedAt } = result.data;
  await updateWorkout({
    userId,
    workoutId,
    name: name?.trim() || null,
    startedAt: new Date(startedAt),
  });

  return { success: true };
}

// ─── Add exercise ─────────────────────────────────────────────────────────────

const addExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  exerciseName: z.string().min(1).max(100),
});

export type AddExerciseState = {
  success: boolean;
  errors?: { workoutId?: string[]; exerciseName?: string[] };
};

export async function addExerciseToWorkoutAction(
  _prev: AddExerciseState,
  params: { workoutId: string; exerciseName: string }
): Promise<AddExerciseState> {
  const { userId } = await auth();
  if (!userId) return { success: false, errors: {} };

  const result = addExerciseSchema.safeParse(params);
  if (!result.success) return { success: false, errors: result.error.flatten().fieldErrors };

  const { workoutId, exerciseName } = result.data;
  const workout = await getWorkoutById(userId, workoutId);
  if (!workout) return { success: false, errors: {} };

  let exercise = await findExerciseByExactName(exerciseName);
  if (!exercise) exercise = await createExercise(exerciseName);

  const order = await getNextExerciseOrder(workoutId);
  await addExerciseToWorkout(workoutId, exercise.id, order);

  return { success: true };
}

// ─── Remove exercise ──────────────────────────────────────────────────────────

const removeExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  workoutExerciseId: z.string().uuid(),
});

export type RemoveExerciseState = {
  success: boolean;
  errors?: { workoutId?: string[]; workoutExerciseId?: string[] };
};

export async function removeExerciseFromWorkoutAction(
  _prev: RemoveExerciseState,
  params: { workoutId: string; workoutExerciseId: string }
): Promise<RemoveExerciseState> {
  const { userId } = await auth();
  if (!userId) return { success: false, errors: {} };

  const result = removeExerciseSchema.safeParse(params);
  if (!result.success) return { success: false, errors: result.error.flatten().fieldErrors };

  const { workoutId, workoutExerciseId } = result.data;
  const workout = await getWorkoutById(userId, workoutId);
  if (!workout) return { success: false, errors: {} };

  await removeExerciseFromWorkout(workoutExerciseId);
  return { success: true };
}

// ─── Add set ──────────────────────────────────────────────────────────────────

const addSetSchema = z.object({
  workoutId: z.string().uuid(),
  workoutExerciseId: z.string().uuid(),
  weight: z
    .string()
    .regex(/^\d{1,6}(\.\d{1,2})?$/, "Invalid weight format")
    .optional(),
  reps: z.coerce.number().int().min(1).max(9999).optional(),
});

export type AddSetState = {
  success: boolean;
  errors?: {
    workoutId?: string[];
    workoutExerciseId?: string[];
    weight?: string[];
    reps?: string[];
  };
};

export async function addSetAction(
  _prev: AddSetState,
  params: { workoutId: string; workoutExerciseId: string; weight: string; reps: string }
): Promise<AddSetState> {
  const { userId } = await auth();
  if (!userId) return { success: false, errors: {} };

  const result = addSetSchema.safeParse(params);
  if (!result.success) return { success: false, errors: result.error.flatten().fieldErrors };

  const { workoutId, workoutExerciseId, weight, reps } = result.data;
  const workout = await getWorkoutById(userId, workoutId);
  if (!workout) return { success: false, errors: {} };

  const setNumber = await getNextSetNumber(workoutExerciseId);
  await addSet(workoutExerciseId, setNumber, weight ?? null, reps ?? null);

  return { success: true };
}

// ─── Remove set ───────────────────────────────────────────────────────────────

const removeSetSchema = z.object({
  workoutId: z.string().uuid(),
  setId: z.string().uuid(),
});

export type RemoveSetState = {
  success: boolean;
  errors?: { workoutId?: string[]; setId?: string[] };
};

export async function removeSetAction(
  _prev: RemoveSetState,
  params: { workoutId: string; setId: string }
): Promise<RemoveSetState> {
  const { userId } = await auth();
  if (!userId) return { success: false, errors: {} };

  const result = removeSetSchema.safeParse(params);
  if (!result.success) return { success: false, errors: result.error.flatten().fieldErrors };

  const { workoutId, setId } = result.data;
  const workout = await getWorkoutById(userId, workoutId);
  if (!workout) return { success: false, errors: {} };

  await removeSet(setId);
  return { success: true };
}
