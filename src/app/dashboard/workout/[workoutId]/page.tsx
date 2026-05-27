import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./EditWorkoutForm";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { workoutId } = await params;
  const workout = await getWorkoutById(userId, workoutId);

  if (!workout) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="mx-auto max-w-md space-y-6">
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
      </div>
    </div>
  );
}
