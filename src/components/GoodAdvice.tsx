"use client";

import Image from "next/image";
import { SIGNUP_URL } from "@/lib/constants";
import { Course } from "@/lib/types";

interface GoodAdviceProps {
  aspirationalHeading: string;
  advice: string;
  recommendations: Course[];
}

export default function GoodAdvice({
  aspirationalHeading,
  advice,
  recommendations,
}: GoodAdviceProps) {
  const programCount = recommendations.length;
  const programLabel =
    programCount === 1 ? "1 program" : `${programCount} programs`;

  return (
    <div className="advice-screen good-advice-screen animate-advice-in">
      <div className="good-advice-layout">
        <header className="good-advice-from">
          <p className="good-advice-from-label">
            Here&apos;s some good advice from your higher-ed copilot
          </p>
          <a
            href="https://gradright.com"
            target="_blank"
            rel="noopener noreferrer"
            className="good-advice-from-brand"
            aria-label="Visit GradRight website"
          >
            <Image
              src="/gradright-logo.svg"
              alt="GradRight"
              width={120}
              height={28}
              className="good-advice-from-logo"
            />
          </a>
        </header>

        <div className="advice-quote-card good-advice-card">
          <span className="advice-quote-mark" aria-hidden="true">
            &ldquo;
          </span>
          <h2 className="good-advice-card-headline">{aspirationalHeading}</h2>
          <p className="advice-quote-text good-advice-card-body">{advice}</p>
        </div>

        {programCount > 0 && (
          <p className="good-advice-programs-plug">
            Luckily, there are{" "}
            <span className="advice-program-highlight">{programLabel}</span> that
            can help you get there
          </p>
        )}

        {programCount > 0 && (
          <div className="good-advice-programs" aria-label="Recommended programs">
            {recommendations.slice(0, 2).map((course, index) => (
              <a
                key={course.id}
                href={SIGNUP_URL}
                target="_top"
                rel="noopener noreferrer"
                className={
                  index === 0
                    ? "good-advice-program-card"
                    : "good-advice-program-card is-blurred-soft"
                }
              >
                <div className="good-advice-program-top">
                  <h3 className="good-advice-program-name" title={course.courseName}>
                    {course.courseName}
                  </h3>
                  <span className="good-advice-program-badge">
                    {course.accreditation}
                  </span>
                </div>
                <div className="good-advice-program-bottom">
                  <p className="good-advice-program-cost">
                    Cost <span>{course.totalFees}</span>
                  </p>
                  {course.source.trim() ? (
                    <p className="good-advice-program-host">By {course.source}</p>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="good-advice-cta-block">
          <a
            href={SIGNUP_URL}
            target="_top"
            rel="noopener noreferrer"
            className="good-advice-explore-btn"
          >
            Explore Online Courses
          </a>
          <p className="good-advice-explore-sub">
            Pick from 120+ global universities
          </p>
        </div>

        <div className="good-advice-trust" aria-label="Trust badges">
          <p className="good-advice-trust-headline">
            Trusted by 2.5 lakh students
          </p>
          <div className="good-advice-trust-row">
            <div className="good-advice-trust-item">
              <span className="good-advice-trust-icon-wrap" aria-hidden="true">
                <Image
                  src="/images/google-favicon.svg"
                  alt=""
                  width={34}
                  height={34}
                  className="good-advice-trust-icon"
                />
              </span>
              <div className="good-advice-trust-copy">
                <p className="good-advice-trust-title">Google Rating</p>
                <div className="good-advice-trust-rating">
                  <span className="good-advice-trust-score">4.8</span>
                  <span className="good-advice-trust-stars" aria-hidden="true">
                    ★★★★★
                  </span>
                </div>
              </div>
            </div>

            <div className="good-advice-trust-item">
              <span className="good-advice-trust-icon-wrap" aria-hidden="true">
                <Image
                  src="/images/iso-intercert.png"
                  alt=""
                  width={34}
                  height={34}
                  className="good-advice-trust-icon"
                />
              </span>
              <div className="good-advice-trust-copy">
                <p className="good-advice-trust-title">ISO Certified</p>
                <span className="good-advice-trust-verified" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="8" fill="#22c55e" />
                    <path
                      d="M5.5 9.2l2.1 2.1 4.9-4.9"
                      stroke="#14532d"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
