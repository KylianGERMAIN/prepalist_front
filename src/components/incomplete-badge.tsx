import { CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function IncompleteBadge() {
  return (
    <Badge variant="warning" className="font-normal">
      <CircleAlert />À compléter
    </Badge>
  );
}
