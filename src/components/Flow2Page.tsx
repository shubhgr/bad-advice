"use client";

import { useEffect, useState } from "react";
import Flow2AfterAdvice from "@/components/Flow2AfterAdvice";
import type { Course, UserResponses } from "@/lib/types";
import type { PassPersonalityId } from "@/lib/pass-card";

type FlowStep = "bad-advice" | "after-advice";

const TEST_BAD_ADVICE_HEADLINE = "Certified Chaos Human";
const TEST_BAD_ADVICE =
  "Khakhra and Nutella means you turned a diet snack into a dessert without asking permission from anyone, so rebrand your unemployment as a sabbatical and dare someone to correct you.";
const TEST_GOOD_ADVICE_HEADING = "Healthcare & Medicine Ahead";
const TEST_GOOD_ADVICE =
  "Exploring Healthcare & Medicine from running a business is a genuinely good instinct, and focused practical learning is exactly what will open the next door.";

/** Preview fixtures for `/flow-2?view=pass&personality=…` */
const PREVIEW_BY_PERSONALITY: Record<PassPersonalityId, UserResponses> = {
  "certified-overthinker": {
    name: "Aarav",
    careerStage: "Working professional",
    bollywoodCharacter: "Rancho",
    superpower: "Time travel",
    weirdCombination: "Maggi + ice cream",
    nextBigMove: "Going back to college",
    whatsStoppingYou: "Too many options",
  },
  "certified-yapper": {
    name: "Aarav",
    careerStage: "Working professional",
    bollywoodCharacter: "Geet",
    superpower: "Read minds",
    weirdCombination: "Maggi + ice cream",
    nextBigMove: "Going back to college",
    whatsStoppingYou: "No time",
  },
  "the-never-settler": {
    name: "Aarav",
    careerStage: "Working professional",
    bollywoodCharacter: "Rancho",
    superpower: "Time travel",
    weirdCombination: "Maggi + ice cream",
    nextBigMove: "Switch career paths",
    whatsStoppingYou: "Can't leave my job",
  },
  "the-thorough-planner": {
    name: "Aarav",
    careerStage: "Working professional",
    bollywoodCharacter: "Rancho",
    superpower: "Time travel",
    weirdCombination: "Maggi + ice cream",
    nextBigMove: "Going back to college",
    whatsStoppingYou: "Don't know where to start",
  },
};

export default function Flow2Page({ programs }: { programs: Course[] }) {
  const [step, setStep] = useState<FlowStep>("bad-advice");
  const [previewResponses, setPreviewResponses] =
    useState<UserResponses | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "pass") setStep("after-advice");
    const id = params.get("personality") as PassPersonalityId | null;
    if (id && id in PREVIEW_BY_PERSONALITY) {
      setPreviewResponses(PREVIEW_BY_PERSONALITY[id]);
    }
  }, []);

  const showMovingGradient = step !== "bad-advice";
  const gradientClassName = [
    "shell-moving-gradient",
    showMovingGradient ? "is-visible" : "",
    showMovingGradient ? "is-good-advice" : "",
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
        <main
          className="mobile-content flow-two-content"
          style={{ position: "relative", zIndex: 1 }}
        >
          {step === "bad-advice" && (
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
                    onClick={() => setStep("after-advice")}
                    className="btn-accent"
                  >
                    Now let&apos;s fix that
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "after-advice" && (
            <Flow2AfterAdvice
              aspirationalHeading={TEST_GOOD_ADVICE_HEADING}
              advice={TEST_GOOD_ADVICE}
              programs={programs}
              trackLocation="flow-2"
              responses={previewResponses}
            />
          )}
        </main>
      </div>
    </div>
  );
}
