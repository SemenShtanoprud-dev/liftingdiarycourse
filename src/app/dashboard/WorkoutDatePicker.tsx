"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

export function WorkoutDatePicker({ selected }: { selected: Date }) {
  const router = useRouter();

  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={(d) => {
        if (d) {
          router.push(`/dashboard?date=${format(d, "yyyy-MM-dd")}`);
        }
      }}
    />
  );
}
