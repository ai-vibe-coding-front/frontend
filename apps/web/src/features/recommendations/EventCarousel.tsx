'use client';
import { useState, useRef } from "react";
import { EventCard } from "@/components/common/EventCard";
import type { EventCardData } from "@/components/common/EventCard";

interface EventCarouselProps {
  events: EventCardData[];
  onItemClick?: (event: EventCardData) => void;
  onLike?: (event: EventCardData) => void;
}

export function EventCarousel({ events, onItemClick, onLike }: EventCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-3 no-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        {events.map((event) => (
          <div key={event.id} className="min-w-full snap-start shrink-0">
            <EventCard
              event={event}
              shadow={false}
              onClick={() => onItemClick?.(event)}
              onLike={() => onLike?.(event)}
            />
          </div>
        ))}
      </div>

      {/* 인디케이터 */}
      <div className="flex items-center justify-center gap-1.5 py-1">
        {events.map((_, i) => (
          <button
            key={i}
            aria-label={`슬라이드 ${i + 1}`}
            onClick={() => {
              containerRef.current?.scrollTo({ left: i * containerRef.current.clientWidth, behavior: "smooth" });
              setActiveIndex(i);
            }}
            className={`rounded-full transition-all duration-200 ${
              i === activeIndex
                ? "w-[18px] h-1.5 bg-[#8edfd2]"
                : "w-1.5 h-1.5 bg-[#e4d8c9]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
