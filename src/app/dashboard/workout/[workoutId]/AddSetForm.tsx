"use client";

import { useActionState, useRef, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSetAction, type AddSetState } from "./actions";

type Props = {
  workoutId: string;
  workoutExerciseId: string;
};

const initialState: AddSetState = { success: false };

export function AddSetForm({ workoutId, workoutExerciseId }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: AddSetState, formData: FormData) => {
      const result = await addSetAction(_prev, {
        workoutId,
        workoutExerciseId,
        weight: formData.get("weight") as string,
        reps: formData.get("reps") as string,
      });
      if (result.success) {
        formRef.current?.reset();
        startTransition(() => router.refresh());
      }
      return result;
    },
    initialState
  );

  return (
    <form ref={formRef} action={formAction} className="flex items-end gap-2 pt-2">
      <div className="space-y-1">
        <Label htmlFor={`weight-${workoutExerciseId}`} className="text-xs">
          Weight (kg)
        </Label>
        <Input
          id={`weight-${workoutExerciseId}`}
          name="weight"
          type="text"
          inputMode="decimal"
          placeholder="e.g. 100"
          className="w-24 h-8 text-sm"
        />
        {state.errors?.weight && (
          <p className="text-xs text-red-500">{state.errors.weight[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor={`reps-${workoutExerciseId}`} className="text-xs">
          Reps
        </Label>
        <Input
          id={`reps-${workoutExerciseId}`}
          name="reps"
          type="number"
          min={1}
          max={9999}
          placeholder="e.g. 8"
          className="w-20 h-8 text-sm"
        />
        {state.errors?.reps && (
          <p className="text-xs text-red-500">{state.errors.reps[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={pending} size="sm" className="h-8">
        {pending ? "Adding…" : "Add set"}
      </Button>
    </form>
  );
}
