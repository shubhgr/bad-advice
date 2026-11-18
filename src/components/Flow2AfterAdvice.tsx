"use client";

import GradRightPass from "@/components/GradRightPass";
import type { Course, UserResponses } from "@/lib/types";

interface Flow2AfterAdviceProps {
  aspirationalHeading?: string;
  advice?: string;
  programs: Course[];
  trackLocation?: string;
  responses?: UserResponses | null;
}

/** After bad advice — goes straight to the GradRight Pass (no bridge screens). */
export default function Flow2AfterAdvice({
  aspirationalHeading: _aspirationalHeading,
  advice: _advice,
  programs: _programs,
  trackLocation = "flow-2",
  responses = null,
}: Flow2AfterAdviceProps) {
  void _aspirationalHeading;
  void _advice;
  void _programs;

  return (
    <section className="flow-two-screen animate-fade-in is-receipt is-pass">
      <GradRightPass trackLocation={trackLocation} responses={responses} />
    </section>
  );
}
