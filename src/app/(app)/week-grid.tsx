import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Week, WeekSlot } from "@/lib/models";
import { GenerateWeekButton } from "./week-actions";
import { SlotCell } from "./slot-cell";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/** Ajoute n jours à une date ISO (YYYY-MM-DD) et renvoie la nouvelle date ISO, sans dérive de fuseau. */
function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Date du jour au format ISO local (YYYY-MM-DD), pour marquer le jour courant. */
function todayIso(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function WeekGrid({ week }: { week: Week }) {
  // Index des créneaux par jour + moment, pour retrouver le slot d'une cellule.
  const byKey = new Map<string, WeekSlot>();
  for (const slot of week.slots) {
    byKey.set(`${slot.date.slice(0, 10)}_${slot.slot}`, slot);
  }
  const days = Array.from({ length: 7 }, (_, i) => addDays(week.startDate, i));
  const today = todayIso();
  const startLabel = new Date(`${week.startDate}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl tracking-tight">Semaine du {startLabel}</h1>
        <GenerateWeekButton weekId={week.id} />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px] space-y-2">
          <div className="grid grid-cols-7 gap-2">
            {days.map((iso, i) => {
              const isToday = iso === today;
              return (
                <div
                  key={iso}
                  className={cn(
                    "text-center font-heading text-base",
                    isToday ? "font-medium text-primary" : "text-foreground",
                  )}
                >
                  {DAYS[i]}{" "}
                  <span className={cn("tnum", !isToday && "text-muted-foreground")}>
                    {iso.slice(8, 10)}
                  </span>
                </div>
              );
            })}
          </div>

          {(["LUNCH", "DINNER"] as const).map((moment) => (
            <div key={moment} className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                {moment === "LUNCH" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                {moment === "LUNCH" ? "Midi" : "Soir"}
              </p>
              <div className="grid grid-cols-7 gap-2">
                {days.map((iso) => {
                  const slot = byKey.get(`${iso}_${moment}`);
                  return slot ? (
                    <SlotCell key={slot.id} weekId={week.id} slot={slot} />
                  ) : (
                    <div
                      key={`${iso}_${moment}`}
                      className="min-h-16 rounded-md border border-dashed border-border opacity-60"
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
