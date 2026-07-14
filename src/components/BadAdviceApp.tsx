"use client";

import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import FunnyAdvice from "@/components/FunnyAdvice";
import GoodAdvice from "@/components/GoodAdvice";
import GettingAdvice from "@/components/GettingAdvice";
import Questionnaire from "@/components/Questionnaire";
import RecommendationsScreen from "@/components/RecommendationsScreen";
import Disclaimer from "@/components/Disclaimer";
import { Course, UserResponses } from "@/lib/types";

type Step =
  | "landing"
  | "questionnaire"
  | "getting-advice"
  | "funny-advice"
  | "getting-good-advice"
  | "good-advice"
  | "recommendations";

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

  async function handleQuestionnaireSubmit(userResponses: UserResponses) {
    setError("");
    setResponses(userResponses);
    setStep("getting-advice");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userResponses),
        signal: controller.signal,
      });

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
      setStep("good-advice");
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

  function handleStartOver() {
    setStep("landing");
    setResponses(null);
    setAdvice("");
    setAdviceHeadline("");
    setGoodAdvice("");
    setAspirationalHeading("");
    setRecommendations([]);
    setError("");
  }

  const showMovingGradient =
    step === "getting-good-advice" || step === "good-advice";

  const gradientClassName = [
    "shell-moving-gradient",
    showMovingGradient ? "is-visible" : "",
    step === "good-advice" ? "is-good-advice" : "",
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
        <main className="mobile-content">
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

          {step === "good-advice" && (
            <GoodAdvice
              aspirationalHeading={aspirationalHeading}
              advice={goodAdvice}
              recommendations={recommendations}
            />
          )}

          {step === "recommendations" && (
            <RecommendationsScreen
              recommendations={recommendations}
              onStartOver={handleStartOver}
            />
          )}
        </main>
        {step !== "good-advice" && <Disclaimer />}
      </div>
    </div>
  );
}
