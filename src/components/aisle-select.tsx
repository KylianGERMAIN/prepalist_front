import type { ComponentProps } from "react";
import { NativeSelect } from "@/components/ui/native-select";
import { AISLES, aisleLabel } from "@/lib/aisles";

export function AisleSelect(props: ComponentProps<typeof NativeSelect>) {
  return (
    <NativeSelect aria-label="Rayon" {...props}>
      {AISLES.map((aisle) => (
        <option key={aisle} value={aisle}>
          {aisleLabel(aisle)}
        </option>
      ))}
    </NativeSelect>
  );
}
