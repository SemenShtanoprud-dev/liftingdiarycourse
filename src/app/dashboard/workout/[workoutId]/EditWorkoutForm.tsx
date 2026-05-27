"use client";

import { useActionState, useRef, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkoutAction, type UpdateWorkoutState } from "./actions";

type Props = {
  workoutId: string;
  defaultName: string | null;
  defaultStartedAt: Date;
};

const initialState: UpdateWorkoutState = { success: false };

export function EditWorkoutForm({ workoutId, defaultName, defaultStartedAt }: Props) {
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: UpdateWorkoutState, formData: FormData) => {
      const result = await updateWorkoutAction(_prev, {
        workoutId,
        name: formData.get("name") as string,
        startedAt: formData.get("startedAt") as string,
      });
      if (result.success) {
        setSaved(true);
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
      }
      return result;
    },
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Workout name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Push Day"
          maxLength={100}
          defaultValue={defaultName ?? ""}
        />
        {state.errors?.name && (
          <p className="text-sm text-red-500">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="startedAt">Date</Label>
        <Input
          id="startedAt"
          name="startedAt"
          type="date"
          defaultValue={format(defaultStartedAt, "yyyy-MM-dd")}
          required
        />
        {state.errors?.startedAt && (
          <p className="text-sm text-red-500">{state.errors.startedAt[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : saved ? "Saved!" : "Save changes"}
      </Button>
    </form>
  );
}
