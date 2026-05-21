"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MOCK_WORKOUTS = [
  {
    id: 1,
    name: "Morning Push Session",
    exercises: ["Bench Press", "Overhead Press", "Tricep Dips"],
    duration: "52 min",
  },
  {
    id: 2,
    name: "Evening Cardio",
    exercises: ["Treadmill", "Jump Rope"],
    duration: "30 min",
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

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

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-left font-normal sm:w-64"
              />
            }
          >
            <CalendarIcon className="size-4 shrink-0 text-zinc-500" />
            {format(date, "do MMM yyyy")}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d);
                  setOpen(false);
                }
              }}
            />
          </PopoverContent>
        </Popover>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Workouts — {format(date, "do MMM yyyy")}
          </h2>

          {MOCK_WORKOUTS.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
                <Dumbbell className="size-8 mb-3 opacity-40" />
                <p className="text-sm">No workouts logged for this date.</p>
              </CardContent>
            </Card>
          ) : (
            MOCK_WORKOUTS.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold">
                      {workout.name}
                    </CardTitle>
                    <span className="text-xs text-zinc-400 shrink-0 mt-0.5">
                      {workout.duration}
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    {workout.exercises.join(" · ")}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
