import type { ComponentProps } from "react";
import { inputClassName } from "@/components/ui/input";
import { AISLES, aisleLabel } from "@/lib/aisles";

export function AisleSelect(props: ComponentProps<"select">) {
  return (
    <select aria-label="Rayon" className={inputClassName} {...props}>
      {AISLES.map((aisle) => (
        <option key={aisle} value={aisle}>
          {aisleLabel(aisle)}
        </option>
      ))}
    </select>
  );
}
