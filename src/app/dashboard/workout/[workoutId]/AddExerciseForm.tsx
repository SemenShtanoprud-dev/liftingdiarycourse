"use client";

import { useActionState, useRef, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addExerciseToWorkoutAction, type AddExerciseState } from "./actions";

type Props = {
  workoutId: string;
  allExercises: { id: string; name: string }[];
};

const initialState: AddExerciseState = { success: false };
const datalistId = "exercise-suggestions";

export function AddExerciseForm({ workoutId, allExercises }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: AddExerciseState, formData: FormData) => {
      const result = await addExerciseToWorkoutAction(_prev, {
        workoutId,
        exerciseName: formData.get("exerciseName") as string,
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
      <datalist id={datalistId}>
        {allExercises.map((ex) => (
          <option key={ex.id} value={ex.name} />
        ))}
      </datalist>

      <div className="flex-1 space-y-1.5">
        <Label htmlFor="exerciseName">Add exercise</Label>
        <Input
          id="exerciseName"
          name="exerciseName"
          type="text"
          list={datalistId}
          placeholder="e.g. Bench Press"
          maxLength={100}
        />
        {state.errors?.exerciseName && (
          <p className="text-sm text-red-500">{state.errors.exerciseName[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add exercise"}
      </Button>
    </form>
  );
}
