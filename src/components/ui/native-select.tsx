import type { ComponentProps } from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { inputClassName } from "./input"

/**
 * `<select>` natif au style des champs. `className` vise le conteneur (largeur,
 * placement) ; `selectClassName` le champ lui-même.
 */
function NativeSelect({
  className,
  selectClassName,
  ...props
}: ComponentProps<"select"> & { selectClassName?: string }) {
  return (
    <div data-slot="native-select" className={cn("relative w-full min-w-0", className)}>
      {/* Flèche native retirée : dessinée dans le padding, elle touchait la bordure. */}
      <select className={cn(inputClassName, "appearance-none pr-8", selectClassName)} {...props} />
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

export { NativeSelect }
