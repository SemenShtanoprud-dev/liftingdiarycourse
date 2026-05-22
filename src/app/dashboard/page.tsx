import { auth } from "@clerk/nextjs/server";
import { format, parseISO } from "date-fns";
import { Dumbbell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutDatePicker } from "./WorkoutDatePicker";
import { getWorkoutsForUserOnDate } from "@/data/workouts";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;

  const date =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? parseISO(params.date)
      : new Date();

  const userWorkouts = await getWorkoutsForUserOnDate(userId!, date);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Workout Log
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            View workouts logged for a specific date.
          </p>
        </div>

        <WorkoutDatePicker selected={date} />

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Workouts — {format(date, "do MMM yyyy")}
          </h2>

          {userWorkouts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
                <Dumbbell className="size-8 mb-3 opacity-40" />
                <p className="text-sm">No workouts logged for this date.</p>
              </CardContent>
            </Card>
          ) : (
            userWorkouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold">
                      {workout.name ?? "Untitled Workout"}
                    </CardTitle>
                    {workout.completedAt && (
                      <span className="text-xs text-zinc-400 shrink-0 mt-0.5">
                        {format(workout.completedAt, "do MMM yyyy")}
                      </span>
                    )}
                  </div>
                  {workout.exercises.length > 0 && (
                    <CardDescription className="text-xs">
                      {workout.exercises.join(" · ")}
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
