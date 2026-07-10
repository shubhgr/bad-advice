"use client";

import { Course } from "@/lib/types";
import AppDownloadFooter from "@/components/AppDownloadFooter";
import CourseCarousel from "@/components/CourseCarousel";

interface RecommendationsScreenProps {
  recommendations: Course[];
  onStartOver: () => void;
}

export default function RecommendationsScreen({
  recommendations,
  onStartOver,
}: RecommendationsScreenProps) {
  return (
    <div className="recommendations-screen animate-fade-in">
      <div className="recommendations-main">
        <header className="recommendations-header">
          <div className="recommendations-brand">
            <span className="recommendations-brand-name">Graddie</span>
            <span className="recommendations-info-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle
                  cx="9"
                  cy="9"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M9 8.25V12.75M9 5.75V5.76"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>
          <h2 className="recommendations-title">Recommendation for you</h2>
        </header>

        <CourseCarousel courses={recommendations} />

        {recommendations.length === 0 && (
          <p className="recommendations-empty">
            No programs found for your selected area right now. Try starting over
            and picking a different focus.
          </p>
        )}

        <button type="button" onClick={onStartOver} className="btn-outline">
          Start Over
        </button>
      </div>

      <AppDownloadFooter />
    </div>
  );
}
