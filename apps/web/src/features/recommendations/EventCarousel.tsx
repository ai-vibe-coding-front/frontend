"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EventCard } from "@/components/common/EventCard";
import type { EventCardData } from "@/components/common/EventCard";

interface EventCarouselProps {
  events: EventCardData[];
  onItemClick?: (event: EventCardData) => void;
  onFavorite?: (event: EventCardData) => void;
}

export function EventCarousel({ events, onItemClick, onFavorite }: EventCarouselProps) {
  const hasLoop = events.length > 1;
  const slides = useMemo(
    () => (hasLoop ? [events[events.length - 1], ...events, events[0]] : events),
    [events, hasLoop],
  );
  const [slideIndex, setSlideIndex] = useState(hasLoop ? 1 : 0);
  const [dragOffset, setDragOffset] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [carouselEventLength, setCarouselEventLength] = useState(events.length);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({
    pointerId: 0,
    startX: 0,
    currentX: 0,
    isDragging: false,
    hasMoved: false,
  });
  const suppressClickRef = useRef(false);
  const hasEventLengthChanged = carouselEventLength !== events.length;
  const resetSlideIndex = hasLoop ? 1 : 0;
  const currentSlideIndex = hasEventLengthChanged ? resetSlideIndex : slideIndex;
  const safeSlideIndex =
    hasLoop && currentSlideIndex >= 0 && currentSlideIndex <= events.length + 1
      ? currentSlideIndex
      : hasLoop
        ? 1
        : 0;

  const activeIndex =
    events.length === 0
      ? 0
      : safeSlideIndex === 0
        ? events.length - 1
        : safeSlideIndex === events.length + 1
          ? 0
          : safeSlideIndex - (hasLoop ? 1 : 0);
  const visualSlideIndex = hasLoop ? safeSlideIndex : 0;
  const visualDragOffset = hasEventLengthChanged ? 0 : dragOffset;

  useEffect(() => {
    const nextSlideIndex = events.length > 1 ? 1 : 0;
    let restoreFrameId = 0;
    dragStateRef.current.isDragging = false;

    const frameId = requestAnimationFrame(() => {
      setCarouselEventLength(events.length);
      setTransitionEnabled(false);
      setDragOffset(0);
      setSlideIndex(nextSlideIndex);

      restoreFrameId = requestAnimationFrame(() => {
        setTransitionEnabled(true);
      });
    });

    return () => {
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(restoreFrameId);
    };
  }, [events.length]);

  const moveToSlide = (nextIndex: number) => {
    setTransitionEnabled(true);
    setDragOffset(0);
    setSlideIndex(nextIndex);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!hasLoop) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      currentX: event.clientX,
      isDragging: true,
      hasMoved: false,
    };
    setTransitionEnabled(false);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState.isDragging || dragState.pointerId !== event.pointerId) return;

    const nextOffset = event.clientX - dragState.startX;
    dragState.currentX = event.clientX;
    dragState.hasMoved = Math.abs(nextOffset) > 6;
    setDragOffset(nextOffset);
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState.isDragging || dragState.pointerId !== event.pointerId) return;

    const width = containerRef.current?.clientWidth ?? 0;
    const distance = dragState.currentX - dragState.startX;
    const threshold = Math.max(48, width * 0.16);
    const movedEnough = Math.abs(distance) >= threshold;

    dragState.isDragging = false;
    if (dragState.hasMoved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 120);
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!movedEnough) {
      moveToSlide(safeSlideIndex);
      return;
    }

    moveToSlide(distance < 0 ? safeSlideIndex + 1 : safeSlideIndex - 1);
  };

  const handleTransitionEnd = () => {
    if (!hasLoop) return;

    if (safeSlideIndex === 0 || safeSlideIndex === events.length + 1) {
      setTransitionEnabled(false);
      setSlideIndex(safeSlideIndex === 0 ? events.length : 1);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransitionEnabled(true));
      });
    }
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;

    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="flex flex-col gap-3">
      {events.length === 0 ? (
        <div className="rounded-[18px] bg-white px-4 py-8 text-center text-[13px] font-medium leading-5 text-[#8c6e63]">
          최근 추천 결과가 없어요
        </div>
      ) : (
        <div
          ref={containerRef}
          className="overflow-hidden"
          onClickCapture={handleClickCapture}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          style={{ touchAction: "pan-y" }}
        >
          <div
            className={`flex ${transitionEnabled && !hasEventLengthChanged ? "transition-transform duration-300 ease-out" : ""}`}
            style={{
              transform: `translateX(calc(${-visualSlideIndex * 100}% + ${visualDragOffset}px))`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {slides.map((event, index) => (
              <div
                key={`${event.id}-${index}`}
                className="min-w-full shrink-0 select-none"
              >
                <EventCard
                  event={event}
                  shadow={false}
                  onClick={() => onItemClick?.(event)}
                  onFavorite={() => onFavorite?.(event)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 인디케이터 */}
      {events.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-1">
          {events.map((_, i) => (
            <button
              key={i}
              aria-label={`슬라이드 ${i + 1}`}
              onClick={() => {
                moveToSlide(i + 1);
              }}
              className={`rounded-full transition-all duration-200 ${
                i === activeIndex
                  ? "w-[18px] h-1.5 bg-[#8edfd2]"
                  : "w-1.5 h-1.5 bg-[#e4d8c9]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
