"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const schema = z.object({
  name: z.string().max(100).optional(),
  startedAt: z.string().date(),
});

export type CreateWorkoutState = {
  success: boolean;
  errors?: { name?: string[]; startedAt?: string[] };
};

export async function createWorkoutAction(
  _prev: CreateWorkoutState,
  params: { name: string; startedAt: string }
): Promise<CreateWorkoutState> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, errors: {} };
  }

  const result = schema.safeParse(params);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { name, startedAt } = result.data;
  await createWorkout({
    userId,
    name: name?.trim() || null,
    startedAt: new Date(startedAt),
  });

  return { success: true };
}
