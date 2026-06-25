'use client';

import { useRouter } from "next/navigation";
import { EventCard } from "@/components/common/EventCard";
import type { EventCardData } from "@/components/common/EventCard";
import { ROUTES } from "@/constants/routes";

interface EventResultListProps {
  events: EventCardData[];
}

export function EventResultList({ events }: EventResultListProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onClick={() => router.push(ROUTES.eventDetail(event.id))}
        />
      ))}
    </div>
  );
}
