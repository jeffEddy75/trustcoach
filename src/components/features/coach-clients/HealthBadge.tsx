import { Badge } from "@/components/ui/badge";
import type { HealthStatus } from "@/actions/coach-clients.actions";

interface HealthBadgeProps {
  status: HealthStatus;
}

const statusConfig: Record<
  HealthStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Actif",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  review: {
    label: "À revoir",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  },
  new: {
    label: "Nouveau",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  inactive: {
    label: "Inactif",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};

export function HealthBadge({ status }: HealthBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
