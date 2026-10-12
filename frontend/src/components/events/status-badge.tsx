import { Badge } from "@/components/ui/badge";
import { REGISTRATION_STATUS_META, STATUS_META, categoryTone } from "@/lib/events";
import { cn } from "@/lib/utils";
import type { EventCategory, EventStatus, RegistrationStatus } from "@/types";

export function EventStatusBadge({
  status,
  className,
}: {
  status: EventStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <Badge className={cn(meta.badge, className)} dot>
      {meta.label}
    </Badge>
  );
}

export function RegistrationStatusBadge({
  status,
  className,
}: {
  status: RegistrationStatus;
  className?: string;
}) {
  const meta = REGISTRATION_STATUS_META[status];
  return (
    <Badge className={cn(meta.badge, className)} dot>
      {meta.label}
    </Badge>
  );
}

export function CategoryBadge({
  category,
  className,
}: {
  category: EventCategory;
  className?: string;
}) {
  return <Badge className={cn(categoryTone(category).badge, className)}>{category}</Badge>;
}
