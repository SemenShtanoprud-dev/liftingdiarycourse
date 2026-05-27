import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getWorkoutWithExercisesAndSets } from "@/data/workout-exercises";
import { getAllExercises } from "@/data/exercises";
import { EditWorkoutForm } from "./EditWorkoutForm";
import { ExerciseList } from "./ExerciseList";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function WorkoutDetailPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { workoutId } = await params;
  const [workout, allExercises] = await Promise.all([
    getWorkoutWithExercisesAndSets(userId, workoutId),
    getAllExercises(),
  ]);

  if (!workout) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Edit workout</CardTitle>
            <CardDescription>Update your workout details.</CardDescription>
          </CardHeader>
          <CardContent>
            <EditWorkoutForm
              workoutId={workout.id}
              defaultName={workout.name}
              defaultStartedAt={workout.startedAt}
            />
          </CardContent>
        </Card>

        <ExerciseList
          workoutId={workout.id}
          exercises={workout.exercises}
          allExercises={allExercises}
        />
      </div>
    </div>
  );
}
