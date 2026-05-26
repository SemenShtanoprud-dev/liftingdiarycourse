"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkoutAction, type CreateWorkoutState } from "./actions";

const today = format(new Date(), "yyyy-MM-dd");

const initialState: CreateWorkoutState = { success: false };

export function NewWorkoutForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    (_prev: CreateWorkoutState, formData: FormData) =>
      createWorkoutAction(_prev, {
        name: formData.get("name") as string,
        startedAt: formData.get("startedAt") as string,
      }),
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.push("/dashboard");
    }
  }, [state.success, router]);

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
          defaultValue={today}
          required
        />
        {state.errors?.startedAt && (
          <p className="text-sm text-red-500">{state.errors.startedAt[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating…" : "Create workout"}
      </Button>
    </form>
  );
}
