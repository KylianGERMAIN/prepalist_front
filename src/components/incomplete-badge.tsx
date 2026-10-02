import { CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function IncompleteBadge() {
  return (
    <Badge className="gap-1 bg-warning font-normal text-warning-foreground">
      <CircleAlert className="size-3" />À compléter
    </Badge>
  );
}
