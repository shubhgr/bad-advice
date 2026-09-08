"use client";

import { useEffect, useState } from "react";
import LandingPage from "@/components/LandingPage";
import FunnyAdvice from "@/components/FunnyAdvice";
import Flow2AfterAdvice from "@/components/Flow2AfterAdvice";
import GettingAdvice from "@/components/GettingAdvice";
import Questionnaire from "@/components/Questionnaire";
import Disclaimer from "@/components/Disclaimer";
import { Course, UserResponses } from "@/lib/types";
import { captureTrackingFromLocation } from "@/lib/utm";

type Step =
  | "landing"
  | "questionnaire"
  | "getting-advice"
  | "funny-advice"
  | "getting-good-advice"
  | "flow-2";

export default function BadAdviceApp() {
  const [step, setStep] = useState<Step>("landing");
  const [responses, setResponses] = useState<UserResponses | null>(null);
  const [advice, setAdvice] = useState("");
  const [adviceHeadline, setAdviceHeadline] = useState("");
  const [goodAdvice, setGoodAdvice] = useState("");
  const [aspirationalHeading, setAspirationalHeading] = useState("");
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [isLoadingGoodAdvice, setIsLoadingGoodAdvice] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    captureTrackingFromLocation();
  }, []);

  async function handleQuestionnaireSubmit(userResponses: UserResponses) {
    setError("");
    setResponses(userResponses);
    setStep("getting-advice");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const minHold = new Promise<void>((resolve) => {
      setTimeout(resolve, 1000);
    });

    try {
      const [res] = await Promise.all([
        fetch("/api/advice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userResponses),
          signal: controller.signal,
        }),
        minHold,
      ]);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate advice");
      }

      setAdvice(data.advice);
      setAdviceHeadline(data.headline || "");
      setStep("funny-advice");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
      setStep("questionnaire");
    } finally {
      clearTimeout(timeout);
    }
  }

  async function handleWantRealAdvice() {
    if (!responses || !advice) return;

    setError("");
    setIsLoadingGoodAdvice(true);
    setStep("getting-good-advice");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const minHold = new Promise<void>((resolve) => {
      setTimeout(resolve, 2000);
    });

    try {
      const [[goodRes, recRes]] = await Promise.all([
        Promise.all([
          fetch("/api/good-advice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ responses, badAdvice: advice }),
            signal: controller.signal,
          }),
          fetch("/api/recommendations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(responses),
            signal: controller.signal,
          }),
        ]),
        minHold,
      ]);

      const data = await goodRes.json();
      const recData = await recRes.json();

      if (!goodRes.ok) {
        throw new Error(data.error || "Failed to generate good advice");
      }

      setGoodAdvice(data.advice);
      setAspirationalHeading(data.aspirationalHeading || "");
      setRecommendations(recData.recommendations || []);
      setStep("flow-2");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
      setStep("funny-advice");
    } finally {
      clearTimeout(timeout);
      setIsLoadingGoodAdvice(false);
    }
  }

  const showMovingGradient =
    step === "getting-good-advice" || step === "flow-2";

  const gradientClassName = [
    "shell-moving-gradient",
    showMovingGradient ? "is-visible" : "",
    step === "flow-2" ? "is-good-advice" : "",
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
          className={`mobile-content${step === "flow-2" ? " flow-two-content" : ""}`}
          style={step === "flow-2" ? { position: "relative", zIndex: 1 } : undefined}
        >
          {error && (
            <div className="mb-6 border border-white/30 bg-white/10 px-4 py-3 text-center text-sm text-white">
              {error}
            </div>
          )}

          {step === "landing" && (
            <LandingPage onStart={() => setStep("questionnaire")} />
          )}

          {step === "questionnaire" && (
            <Questionnaire onSubmit={handleQuestionnaireSubmit} />
          )}

          {step === "getting-advice" && <GettingAdvice />}

          {step === "getting-good-advice" && (
            <GettingAdvice message="Graddie is thinking..." softEnter />
          )}

          {step === "funny-advice" && (
            <FunnyAdvice
              headline={adviceHeadline}
              advice={advice}
              onShowRealAdvice={handleWantRealAdvice}
              isLoadingRecommendations={isLoadingGoodAdvice}
            />
          )}

          {step === "flow-2" && (
            <Flow2AfterAdvice
              aspirationalHeading={aspirationalHeading}
              advice={goodAdvice}
              programs={recommendations}
              trackLocation="main-flow-2"
            />
          )}
        </main>
        {step !== "flow-2" && <Disclaimer />}
      </div>
    </div>
  );
}
