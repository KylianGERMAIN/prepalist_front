"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { updateShoppingDay } from "../settings-actions";

// Ordre d'affichage lundi -> dimanche ; la valeur suit la convention JS (0 = dimanche).
const DAYS = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 0, label: "Dimanche" },
] as const;

export function ShoppingDayForm({ current }: { current: number }) {
  const [day, setDay] = useState(current);
  const [pending, startTransition] = useTransition();

  function onChange(next: number) {
    const previous = day;
    setDay(next);
    startTransition(async () => {
      const res = await updateShoppingDay(next);
      if (res.ok) {
        toast.success("Jour de courses mis à jour");
      } else {
        setDay(previous);
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="shopping-day">Jour de courses</Label>
      <select
        id="shopping-day"
        value={day}
        disabled={pending}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {DAYS.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>
    </div>
  );
}
