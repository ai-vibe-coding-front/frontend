'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventCard } from "@/components/common/EventCard";
import type { EventCardData } from "@/components/common/EventCard";
import { ROUTES } from "@/constants/routes";
import { apiClient, ApiClientError } from "@/lib/api-client";

interface EventResultListProps {
  events: EventCardData[];
}

export function EventResultList({ events }: EventResultListProps) {
  const router = useRouter();
  const [items, setItems] = useState(events);

  const handleFavorite = async (eventId: string, isFavorite: boolean | undefined) => {
    setItems((current) =>
      current.map((item) =>
        item.id === eventId ? { ...item, isFavorite: !isFavorite } : item,
      ),
    );

    try {
      if (isFavorite) {
        await apiClient(`/api/favorites/${eventId}`, { method: "DELETE" });
      } else {
        await apiClient("/api/favorites", {
          method: "POST",
          body: JSON.stringify({ eventItemId: eventId }),
        });
      }
    } catch (error) {
      setItems((current) =>
        current.map((item) =>
          item.id === eventId ? { ...item, isFavorite } : item,
        ),
      );

      if (error instanceof ApiClientError && error.status === 401) {
        router.push(ROUTES.login);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onClick={() => router.push(ROUTES.eventDetail(event.id))}
          onFavorite={() => handleFavorite(event.id, event.isFavorite)}
        />
      ))}
    </div>
  );
}
