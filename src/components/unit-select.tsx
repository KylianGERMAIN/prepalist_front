import type { ComponentProps } from "react";
import { inputClassName } from "@/components/ui/input";
import { asUnit, UNITS } from "@/lib/units";

/**
 * Un `<select>` sans option correspondante vide son affichage sans rien dire :
 * une valeur antérieure au jeu fermé reste donc listée ici, visible, plutôt que
 * d'être effacée en silence.
 */
export function UnitSelect({
  current,
  ...props
}: ComponentProps<"select"> & { current?: string }) {
  const legacy = current && !asUnit(current) ? current : null;

  return (
    <select aria-label="Unité" className={inputClassName} {...props}>
      <option value="" disabled>
        Unité
      </option>
      {legacy && <option value={legacy}>{legacy}</option>}
      {UNITS.map((unit) => (
        <option key={unit} value={unit}>
          {unit}
        </option>
      ))}
    </select>
  );
}
