"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useAppStoreUrl } from "@/hooks/useAppStoreUrl";
import { trackAppDownloadClick } from "@/lib/track";
import type { Course } from "@/lib/types";

const FEATURES = [
  {
    id: "recs",
    icon: "thumb_up",
    label: "Personalised Recommendations",
  },
  {
    id: "compare",
    icon: "travel_explore",
    label: "Compare 500+ Global Programs",
  },
] as const;

const TEST_BAD_ADVICE_HEADLINE = "Certified Chaos Human";
const TEST_BAD_ADVICE =
  "Khakhra and Nutella means you turned a diet snack into a dessert without asking permission from anyone, so rebrand your unemployment as a sabbatical and dare someone to correct you.";

export default function FinalTestPage({ programs }: { programs: Course[] }) {
  const [showPrograms, setShowPrograms] = useState(false);
  const [showGoodAdvice, setShowGoodAdvice] = useState(false);
  const appStoreUrl = useAppStoreUrl();
  const visiblePrograms = programs.slice(0, 8);

  useEffect(() => {
    if (!showPrograms) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowPrograms(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPrograms]);

  function handleDownloadClick() {
    trackAppDownloadClick({
      href: appStoreUrl,
      location: "final-test",
      button: "Download now",
    });
  }

  const gradientClassName = [
    "shell-moving-gradient",
    showGoodAdvice ? "is-visible" : "",
    showGoodAdvice ? "is-good-advice" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mobile-shell">
      <div className={gradientClassName} aria-hidden="true">
        <span className="shell-gradient-blob-wrap shell-gradient-blob-wrap-a">
          <span className="shell-gradient-blob shell-gradient-blob-a" />
        </span>
        <span className="shell-gradient-blob-wrap shell-gradient-blob-wrap-b">
          <span className="shell-gradient-blob shell-gradient-blob-b" />
        </span>
        <span className="shell-gradient-blob-wrap shell-gradient-blob-wrap-c">
          <span className="shell-gradient-blob shell-gradient-blob-c" />
        </span>
        <div className="shell-fluted-glass" />
      </div>

      <div className="mobile-frame">
        {showGoodAdvice && (
          <Image
            src="/images/flow-2-provider-wall-original.jpg"
            alt=""
            width={957}
            height={1024}
            aria-hidden="true"
            unoptimized
            style={{
              bottom: 0,
              filter: "saturate(1.12) contrast(1.05)",
              height: "auto",
              left: 0,
              maskImage:
                "linear-gradient(180deg, transparent 0%, transparent 26%, rgba(0,0,0,0.32) 46%, rgba(0,0,0,0.86) 72%, #000 100%)",
              opacity: 0.72,
              pointerEvents: "none",
              position: "absolute",
              WebkitMaskImage:
                "linear-gradient(180deg, transparent 0%, transparent 26%, rgba(0,0,0,0.32) 46%, rgba(0,0,0,0.86) 72%, #000 100%)",
              width: "100%",
              zIndex: 0,
            }}
          />
        )}

        <main className="mobile-content final-test-content">
          {!showGoodAdvice && (
            <div className="advice-screen animate-fade-in">
              <div className="advice-screen-body">
                <div className="advice-main">
                  <h3 className="advice-reveal-headline">
                    {TEST_BAD_ADVICE_HEADLINE}
                  </h3>

                  <div className="advice-quote-card">
                    <span className="advice-quote-mark" aria-hidden="true">
                      &ldquo;
                    </span>
                    <p className="advice-quote-text">{TEST_BAD_ADVICE}</p>
                  </div>

                  <p className="advice-footer-plug">
                    Sounds terrible, right? I know.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowGoodAdvice(true)}
                    className="btn-accent"
                  >
                    Now let&apos;s fix that
                  </button>
                </div>
              </div>
            </div>
          )}

          {showGoodAdvice && (
            <>
          <section
            className="final-test-screen animate-fade-in"
            style={{ justifyContent: "flex-start" }}
          >
            <header
              className="good-advice-from final-test-header"
              style={{
                bottom: 8,
                flexDirection: "column",
                left: 0,
                position: "absolute",
                right: 0,
                zIndex: 3,
              }}
            >
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
                  width={132}
                  height={30}
                  className="good-advice-from-logo"
                  priority
                />
              </a>
            </header>

            <div className="advice-quote-card good-advice-card final-test-advice-card">
              <span className="advice-quote-mark" aria-hidden="true">
                &ldquo;
              </span>
              <h1 className="good-advice-card-headline">
                Healthcare &amp; Medicine Ahead
              </h1>
              <p className="advice-quote-text good-advice-card-body">
                Exploring Healthcare &amp; Medicine from running a business is a
                genuinely good instinct, and focused practical learning is exactly
                what will open the next door.
              </p>
            </div>

            <div className="final-test-program-block">
              <p className="good-advice-programs-plug final-test-programs-plug">
                There are{" "}
                <button
                  type="button"
                  className="advice-program-highlight final-test-program-toggle"
                  onClick={() => setShowPrograms(true)}
                  aria-expanded={showPrograms}
                  aria-controls="final-test-programs"
                >
                  {visiblePrograms.length} programs
                </button>{" "}
                that can help you get there
              </p>
            </div>

            <div className="bridge-features final-test-features" role="list">
              {FEATURES.map((feature) => (
                <div key={feature.id} className="bridge-feature" role="listitem">
                  <span
                    className="material-symbols-outlined bridge-feature-icon"
                    aria-hidden="true"
                  >
                    {feature.icon}
                  </span>
                  <span className="bridge-feature-label">{feature.label}</span>
                </div>
              ))}
            </div>

            <div className="final-test-offer-hero">
              <span>
                Unlock <strong>15% OFF</strong>
              </span>
              <span>on any online program</span>
            </div>

            <section className="bridge-cta-section final-test-cta-section">
              <div className="bridge-cta-block">
                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bridge-cta-btn final-test-cta-btn"
                  data-track="bad_advice_download_click"
                  onClick={handleDownloadClick}
                >
                  Download now
                </a>
              </div>
            </section>

            <footer
              className="bridge-trust final-test-trust"
              aria-label="Trust badges"
              style={{ marginTop: "auto" }}
            >
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
                      src="/images/iso-27001.png"
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
            </footer>
          </section>

          {showPrograms && (
            <div
              className="final-test-program-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Recommended Healthcare and Medicine programs"
              style={{ position: "absolute" }}
            >
              <button
                type="button"
                className="final-test-program-backdrop"
                aria-label="Close programs"
                onClick={() => setShowPrograms(false)}
              />
              <div className="final-test-program-panel">
                <div className="final-test-program-modal-head">
                  <div>
                    <p className="final-test-program-eyebrow">
                      Personalised matches
                    </p>
                    <p className="final-test-program-modal-subtitle">
                      Compare these online options, then continue to GradRight to
                      unlock your 15% offer.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="final-test-program-close"
                    aria-label="Close programs"
                    onClick={() => setShowPrograms(false)}
                  >
                    &times;
                  </button>
                </div>

                <div
                  id="final-test-programs"
                  className="final-test-programs"
                  aria-label="Recommended programs"
                >
                  {visiblePrograms.map((program, index) => (
                    <a
                      key={program.id}
                      href={appStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="good-advice-program-card final-test-program-card"
                      onClick={() => {
                        trackAppDownloadClick({
                          href: appStoreUrl,
                          location: "final-test-program-popup",
                          button: program.courseName,
                        });
                      }}
                      style={
                        {
                          "--program-delay": `${index * 45 + 120}ms`,
                        } as CSSProperties
                      }
                    >
                      <div className="good-advice-program-top">
                        <h3
                          className="good-advice-program-name"
                          title={program.courseName}
                        >
                          {program.courseName}
                        </h3>
                        <span className="good-advice-program-badge">
                          {program.accreditation}
                        </span>
                      </div>
                      <div className="good-advice-program-bottom">
                        <p className="good-advice-program-cost">
                          Cost <span>{program.totalFees}</span>
                        </p>
                        {program.source.trim() ? (
                          <p className="good-advice-program-host">
                            By {program.source}
                          </p>
                        ) : null}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
