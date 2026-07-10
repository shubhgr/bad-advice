"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Course } from "@/lib/types";
import RecommendationCard from "@/components/RecommendationCard";

interface CourseCarouselProps {
  courses: Course[];
}

const SLIDE_RATIO = 0.9;
const SLIDE_GAP = 12;

export default function CourseCarousel({ courses }: CourseCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      setSlideWidth(Math.round(container.clientWidth * SLIDE_RATIO));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const updateActiveIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track || slideWidth <= 0) return;

    const step = slideWidth + SLIDE_GAP;
    const index = Math.round(track.scrollLeft / step);
    setActiveIndex(Math.max(0, Math.min(index, courses.length - 1)));
  }, [courses.length, slideWidth]);

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track || slideWidth <= 0) return;

    const step = slideWidth + SLIDE_GAP;
    track.scrollTo({ left: step * index, behavior: "smooth" });
    setActiveIndex(index);
  }

  if (courses.length === 0) return null;

  return (
    <div className="course-carousel" ref={containerRef}>
      <div
        ref={trackRef}
        className="course-carousel-track"
        onScroll={updateActiveIndex}
      >
        {courses.map((course) => (
          <div
            key={course.id}
            className="course-carousel-slide"
            style={
              slideWidth > 0
                ? {
                    flex: `0 0 ${slideWidth}px`,
                    width: slideWidth,
                    minWidth: slideWidth,
                    maxWidth: slideWidth,
                  }
                : undefined
            }
          >
            <RecommendationCard course={course} />
          </div>
        ))}
      </div>

      {courses.length > 1 && (
        <div className="course-carousel-indicators">
          {courses.map((course, index) => (
            <button
              key={course.id}
              type="button"
              className={
                index === activeIndex
                  ? "course-carousel-indicator course-carousel-indicator-active"
                  : "course-carousel-indicator"
              }
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to course ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
