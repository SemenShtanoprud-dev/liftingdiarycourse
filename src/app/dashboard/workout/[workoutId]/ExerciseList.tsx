"use client";

import { Dumbbell } from "lucide-react";
import { ExerciseCard } from "./ExerciseCard";
import { AddExerciseForm } from "./AddExerciseForm";
import type { WorkoutExerciseWithSets } from "@/data/workout-exercises";

type Props = {
  workoutId: string;
  exercises: WorkoutExerciseWithSets[];
  allExercises: { id: string; name: string }[];
};

export function ExerciseList({ workoutId, exercises, allExercises }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Exercises</h2>

      {exercises.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 py-10 text-center">
          <Dumbbell className="size-8 text-zinc-400" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No exercises yet — add one below.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {exercises.map((ex) => (
            <ExerciseCard
              key={ex.workoutExerciseId}
              workoutId={workoutId}
              workoutExerciseId={ex.workoutExerciseId}
              exerciseName={ex.exerciseName}
              sets={ex.sets}
            />
          ))}
        </div>
      )}

      <AddExerciseForm workoutId={workoutId} allExercises={allExercises} />
    </div>
  );
}
