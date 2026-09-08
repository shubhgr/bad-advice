"use client";

import Image from "next/image";
import { useState } from "react";
import { useAppStoreUrl } from "@/hooks/useAppStoreUrl";
import { trackAppDownloadClick } from "@/lib/track";
import type { Course } from "@/lib/types";

type FlowStep = "attention" | "good-advice" | "programs";

interface Flow2AfterAdviceProps {
  aspirationalHeading: string;
  advice: string;
  programs: Course[];
  trackLocation?: string;
}

export default function Flow2AfterAdvice({
  aspirationalHeading,
  advice,
  programs,
  trackLocation = "flow-2",
}: Flow2AfterAdviceProps) {
  const [step, setStep] = useState<FlowStep>("attention");
  const appStoreUrl = useAppStoreUrl();
  const visiblePrograms = programs.slice(0, 6);

  function handleDownloadClick(button: string) {
    trackAppDownloadClick({
      href: appStoreUrl,
      location: trackLocation,
      button,
    });
  }

  return (
    <section
      className="flow-two-screen animate-fade-in"
      style={{
        boxSizing: "border-box",
        paddingBottom: 0,
        position: "relative",
      }}
    >
      {step === "programs" && (
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

      <a
        href="https://gradright.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flow-two-logo-link"
        aria-label="Visit GradRight website"
        style={{
          bottom: 18,
          left: "50%",
          marginTop: 0,
          position: "absolute",
          transform: "translateX(-50%)",
          zIndex: 3,
        }}
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

      {step === "attention" && (
        <div
          className="flow-two-panel flow-two-copy-panel"
          style={{ padding: 20 }}
        >
          <h1 className="flow-two-copy">
            So much for your
            <br />
            time &amp; attention
            <br />
            for what?
            <br />
            <span style={{ color: "#b6f54a" }}>
              To sell you what
              <br />
              you need.
            </span>
          </h1>
          <button
            type="button"
            className="bridge-cta-btn flow-two-next"
            onClick={() => setStep("good-advice")}
          >
            Next
          </button>
        </div>
      )}

      {step === "good-advice" && (
        <div className="flow-two-panel" style={{ padding: 20 }}>
          <div
            className="advice-quote-card good-advice-card flow-two-advice-card"
            style={{
              gap: "0.95rem",
              padding: "2.05rem 1.75rem 1.55rem",
            }}
          >
            <span
              className="advice-quote-mark"
              aria-hidden="true"
              style={{
                color: "rgba(255, 255, 255, 0.16)",
                fontSize: "4rem",
                left: "1rem",
                top: "0.35rem",
              }}
            >
              &ldquo;
            </span>
            <h1 className="good-advice-card-headline">{aspirationalHeading}</h1>
            <p
              className="advice-quote-text good-advice-card-body"
              style={{ maxWidth: "34ch" }}
            >
              {advice}
            </p>
          </div>
          <button
            type="button"
            className="bridge-cta-btn flow-two-next"
            onClick={() => setStep("programs")}
          >
            Next
          </button>
        </div>
      )}

      {step === "programs" && (
        <div
          className="flow-two-program-screen"
          style={{
            isolation: "isolate",
            margin: 0,
            overflow: "hidden",
            paddingBottom: 20,
            paddingTop: 0,
            position: "relative",
            width: "100%",
          }}
        >
          <div
            className="flow-two-program-content"
            style={{
              display: "flex",
              flex: "1 1 auto",
              flexDirection: "column",
              gap: 12,
              justifyContent: "center",
              margin: "0 auto",
              minHeight: 0,
              paddingBottom: 18,
              paddingTop: 8,
              transform: "translateY(-50px)",
              width: "calc(92% - 40px)",
              zIndex: 1,
            }}
          >
            <div className="flow-two-program-header">
              <h1 className="flow-two-program-title">
                There are {visiblePrograms.length} programs that can help you get
                there
              </h1>
            </div>

            <div
              className="flow-two-program-list"
              aria-label="Recommended programs"
              style={{
                maxHeight: 300,
                overflow: "hidden",
                position: "relative",
                WebkitMaskImage:
                  "linear-gradient(180deg, #000 0%, #000 55%, rgba(0,0,0,0.72) 78%, transparent 100%)",
                maskImage:
                  "linear-gradient(180deg, #000 0%, #000 55%, rgba(0,0,0,0.72) 78%, transparent 100%)",
              }}
            >
              {visiblePrograms.map((program, index) => (
                <div key={program.id} className="flow-two-program-row">
                  <a
                    href={appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="good-advice-program-card flow-two-program-card"
                    onClick={() => handleDownloadClick(program.courseName)}
                    aria-hidden={index > 0 ? "true" : undefined}
                    tabIndex={index > 0 ? -1 : undefined}
                    style={
                      index > 0
                        ? {
                            filter:
                              index === 1
                                ? "blur(2px)"
                                : index === 2
                                  ? "blur(3px)"
                                  : "blur(4px)",
                            opacity:
                              index === 1 ? 0.62 : index === 2 ? 0.42 : 0.28,
                            pointerEvents: "none",
                            userSelect: "none",
                          }
                        : undefined
                    }
                  >
                    <div className="good-advice-program-top">
                      <h2
                        className="good-advice-program-name"
                        title={program.courseName}
                      >
                        {program.courseName}
                      </h2>
                      <span className="good-advice-program-badge">
                        {program.accreditation}
                      </span>
                    </div>
                    <div className="good-advice-program-bottom">
                      <p className="good-advice-program-cost">
                        Cost{" "}
                        <span
                          style={{
                            color: index === 0 ? "#d9b8ff" : "#b178ff",
                            display: "inline-block",
                            filter: index === 0 ? "blur(1.2px)" : "blur(3px)",
                            fontWeight: 800,
                            letterSpacing: "0.06em",
                            opacity: index === 0 ? 1 : 0.82,
                            userSelect: "none",
                          }}
                        >
                          ₹XX,XXX
                        </span>
                      </p>
                      {program.source.trim() ? (
                        <p className="good-advice-program-host">
                          By {program.source}
                        </p>
                      ) : null}
                    </div>
                  </a>
                </div>
              ))}
              <p
                className="flow-two-offer"
                style={{
                  color: "#b6f54a",
                  left: "50%",
                  letterSpacing: "-0.045em",
                  lineHeight: 0.98,
                  margin: 0,
                  pointerEvents: "none",
                  position: "absolute",
                  textAlign: "center",
                  textShadow: "none",
                  top: 162,
                  transform: "translateX(-50%)",
                  width: "calc(100% + 28px)",
                  zIndex: 3,
                }}
              >
                <span style={{ fontSize: "2.35rem", fontWeight: 950 }}>
                  Unlock <span style={{ color: "#ffffff" }}>15% OFF</span>
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "1.55rem",
                    fontWeight: 900,
                    lineHeight: 1.05,
                  }}
                >
                  on any online program
                </span>
              </p>
            </div>

            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bridge-cta-btn flow-two-download"
              data-track="bad_advice_download_click"
              onClick={() => handleDownloadClick("Download now")}
            >
              Download now
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
