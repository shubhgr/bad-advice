"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface StepProgressProps {
  total: number;
  current: number;
}

const VISIBLE_DOTS = 5;
const FIXED_START_STEPS = 3;
const SCROLL_DELAY_MS = 420;
const DOT_EDGE = 13;

function dotX(step: number, gap: number): number {
  return DOT_EDGE + step * gap;
}

function measureGap(viewportWidth: number): number {
  return (viewportWidth - DOT_EDGE * 2) / (VISIBLE_DOTS - 1);
}

function getOffset(
  step: number,
  gap: number,
  viewportWidth: number,
  total: number
): number {
  if (gap <= 0 || viewportWidth <= 0) return 0;

  const center = viewportWidth / 2;
  const maxOffset = 0;
  const minOffset = center - dotX(total - 1, gap);

  if (step < FIXED_START_STEPS) return maxOffset;

  if (step >= total - 2) {
    if (step === total - 1) return minOffset;
    return center - dotX(total - 2, gap);
  }

  return Math.max(minOffset, Math.min(maxOffset, center - dotX(step, gap)));
}

function needsScrollDelay(
  prev: number,
  next: number,
  gap: number,
  viewportWidth: number,
  total: number
): boolean {
  if (next <= prev || next < FIXED_START_STEPS) return false;
  return getOffset(prev, gap, viewportWidth, total) !== getOffset(next, gap, viewportWidth, total);
}

function scrollPhase(step: number, total: number, offset: number): string {
  if (step < FIXED_START_STEPS && offset === 0) return "start";
  if (step >= total - 2) return "end";
  return "middle";
}

export default function StepProgress({ total, current }: StepProgressProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [gap, setGap] = useState(0);
  const [offset, setOffset] = useState(0);
  const [pending, setPending] = useState(false);
  const prevCurrent = useRef(current);
  const ready = useRef(false);

  const phase = scrollPhase(current, total, offset);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const measure = () => {
      const width = viewport.clientWidth;
      const nextGap = measureGap(width);
      setGap(nextGap);

      if (ready.current) {
        setOffset(getOffset(prevCurrent.current, nextGap, width, total));
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [total]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || gap <= 0 || ready.current) return;

    setOffset(getOffset(current, gap, viewport.clientWidth, total));
    prevCurrent.current = current;
    ready.current = true;
  }, [gap, current, total]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || gap <= 0 || !ready.current) return;

    const prev = prevCurrent.current;
    if (current === prev) return;

    const width = viewport.clientWidth;
    const target = getOffset(current, gap, width, total);

    if (!needsScrollDelay(prev, current, gap, width, total)) {
      setPending(false);
      setOffset(target);
      prevCurrent.current = current;
      return;
    }

    setPending(true);

    const timer = window.setTimeout(() => {
      setPending(false);
      requestAnimationFrame(() => {
        setOffset(target);
        prevCurrent.current = current;
      });
    }, SCROLL_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [current, gap, total]);

  const trailLeft = gap > 0 ? dotX(current, gap) : 0;
  const trailWidth = gap > 0 ? gap * 1.85 : 0;
  const scrollTransform = `translate3d(${offset}px, -50%, 0)`;

  return (
    <div
      ref={viewportRef}
      className={`step-progress-viewport step-progress-${phase}`}
      aria-hidden="true"
    >
      <div className="step-progress-base-line" />

      <div
        className={`step-progress-scroll ${pending ? "step-progress-scroll-pending" : ""}`}
        style={{ transform: scrollTransform }}
      >
        {trailWidth > 0 && current < total - 1 && (
          <div
            className="step-progress-trail"
            style={{
              width: trailWidth,
              left: trailLeft,
            }}
          />
        )}

        <div
          className="step-progress-track"
          style={{
            width: gap > 0 ? dotX(total - 1, gap) + DOT_EDGE : undefined,
          }}
        >
        {Array.from({ length: total }, (_, index) => {
          const state =
            index < current
              ? "completed"
              : index === current
                ? "current"
                : "upcoming";

          return (
            <span
              key={index}
              className="step-progress-node"
              style={{ left: gap > 0 ? dotX(index, gap) : 0 }}
            >
              <span
                className={`step-progress-dot step-progress-dot-${state}${
                  state === "current" ? " step-progress-dot-ring" : ""
                }`}
              >
                {state === "current" && (
                  <span className="step-progress-dot-inner" />
                )}
              </span>
            </span>
          );
        })}
        </div>
      </div>
    </div>
  );
}
