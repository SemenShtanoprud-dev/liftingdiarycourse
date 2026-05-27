"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { updateWorkout } from "@/data/workouts";

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
