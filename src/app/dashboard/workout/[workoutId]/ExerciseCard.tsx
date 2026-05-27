"use client";

import { useActionState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddSetForm } from "./AddSetForm";
import {
  removeExerciseFromWorkoutAction,
  removeSetAction,
  type RemoveExerciseState,
  type RemoveSetState,
} from "./actions";
import type { SetRow } from "@/data/workout-exercises";

type Props = {
  workoutId: string;
  workoutExerciseId: string;
  exerciseName: string;
  sets: SetRow[];
};

function RemoveSetButton({ workoutId, setId }: { workoutId: string; setId: string }) {
  const router = useRouter();
  const initialState: RemoveSetState = { success: false };

  const [, formAction] = useActionState(
    async (_prev: RemoveSetState, formData: FormData) => {
      const result = await removeSetAction(_prev, {
        workoutId,
        setId: formData.get("setId") as string,
      });
      if (result.success) {
        startTransition(() => router.refresh());
      }
      return result;
    },
    initialState
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="setId" value={setId} />
      <button
        type="submit"
        className="text-zinc-400 hover:text-red-500 transition-colors"
        aria-label="Remove set"
      >
        <Trash2 className="size-3.5" />
      </button>
    </form>
  );
}

export function ExerciseCard({ workoutId, workoutExerciseId, exerciseName, sets }: Props) {
  const router = useRouter();
  const initialState: RemoveExerciseState = { success: false };

  const [, formAction, pending] = useActionState(
    async (_prev: RemoveExerciseState, formData: FormData) => {
      const result = await removeExerciseFromWorkoutAction(_prev, {
        workoutId,
        workoutExerciseId: formData.get("workoutExerciseId") as string,
      });
      if (result.success) {
        startTransition(() => router.refresh());
      }
      return result;
    },
    initialState
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{exerciseName}</CardTitle>
          <form action={formAction}>
            <input type="hidden" name="workoutExerciseId" value={workoutExerciseId} />
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              aria-label="Remove exercise"
            >
              <Trash2 className="size-4" />
            </Button>
          </form>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {sets.length > 0 && (
          <ul className="space-y-1">
            {sets.map((set) => (
              <li key={set.id} className="flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Set {set.setNumber}
                  {set.weight && ` — ${set.weight} kg`}
                  {set.reps && ` × ${set.reps}`}
                </span>
                <RemoveSetButton workoutId={workoutId} setId={set.id} />
              </li>
            ))}
          </ul>
        )}

        <AddSetForm workoutId={workoutId} workoutExerciseId={workoutExerciseId} />
      </CardContent>
    </Card>
  );
}
