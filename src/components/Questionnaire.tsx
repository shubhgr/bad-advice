"use client";

import { FormEvent, useState } from "react";
import {
  AREA_TO_EXPLORE_OPTIONS,
  BOLLYWOOD_CHARACTERS,
  SUPERPOWER_OPTIONS,
  WEIRD_COMBINATION_OPTIONS,
} from "@/data/questionnaire";
import { EMPTY_RESPONSES, UserResponses } from "@/lib/types";
import StepProgress from "@/components/StepProgress";

interface QuestionnaireProps {
  onSubmit: (responses: UserResponses) => void;
}

type FieldKey = keyof UserResponses;

type StepConfig =
  | {
      kind: "text";
      field: FieldKey;
      label: string;
      placeholder: string;
    }
  | {
      kind: "choice";
      field: FieldKey;
      label: string;
      options: string[];
    }
  | {
      kind: "image-choice";
      field: "bollywoodCharacter";
      label: string;
    };

const STEPS: StepConfig[] = [
  {
    kind: "text",
    field: "name",
    label: "Drop your name so I know who to blame later",
    placeholder: "Enter your name",
  },
  {
    kind: "choice",
    field: "careerStage",
    label: "Cool cool... so how do you waste your time these days?",
    options: [
      "Studying",
      "Working a Corporate Job",
      "Running a Business",
      "On a Career Break",
      "Creating Content",
      "Something Else",
    ],
  },
  {
    kind: "image-choice",
    field: "bollywoodCharacter",
    label: "Pick the character you unfortunately (or fortunately) relate to.",
  },
  {
    kind: "choice",
    field: "superpower",
    label: "If the universe handed you one power, what are you taking?",
    options: SUPERPOWER_OPTIONS,
  },
  {
    kind: "choice",
    field: "weirdCombination",
    label: "Which of these food combos looks like a good idea to you?",
    options: WEIRD_COMBINATION_OPTIONS,
  },
  {
    kind: "choice",
    field: "areaToExplore",
    label: "Pick the field that gives your brain cells a little dopamine hit.",
    options: AREA_TO_EXPLORE_OPTIONS,
  },
];

export default function Questionnaire({ onSubmit }: QuestionnaireProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponses>(EMPTY_RESPONSES);

  const currentStep = STEPS[stepIndex];
  const totalSteps = STEPS.length;
  const isLastStep = stepIndex === totalSteps - 1;

  function updateField(field: FieldKey, value: string) {
    setResponses((prev) => ({ ...prev, [field]: value }));
  }

  function canProceed(): boolean {
    if (currentStep.kind === "text") {
      return responses[currentStep.field].trim().length > 0;
    }
    return true;
  }

  function handleNext() {
    if (!canProceed()) return;

    if (isLastStep) {
      onSubmit(responses);
      return;
    }

    setStepIndex((prev) => prev + 1);
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex((prev) => prev - 1);
  }

  function handleTextSubmit(e: FormEvent) {
    e.preventDefault();
    handleNext();
  }

  function handleChoiceSelect(field: FieldKey, value: string) {
    updateField(field, value);
    if (isLastStep) {
      onSubmit({ ...responses, [field]: value });
      return;
    }
    setStepIndex((prev) => prev + 1);
  }

  return (
    <div className="questionnaire-layout animate-fade-in">
      <div className="questionnaire-progress">
        <StepProgress total={totalSteps} current={stepIndex} />
      </div>

      <div className="questionnaire-body">
        <div
          className={`flex w-full flex-col ${
            currentStep.kind === "image-choice"
              ? "character-question-layout"
              : "gap-6"
          }`}
        >
          <h2 className="text-xl font-bold leading-snug text-white">
            {currentStep.label}
          </h2>

          {currentStep.kind === "text" && (
            <form onSubmit={handleTextSubmit} className="flex flex-col gap-5">
              <input
                type="text"
                value={responses[currentStep.field]}
                onChange={(e) => updateField(currentStep.field, e.target.value)}
                placeholder={currentStep.placeholder}
                className="input-field"
                autoFocus
              />
              <StepActions
                stepIndex={stepIndex}
                canProceed={canProceed()}
                isFinal={isLastStep}
                onBack={handleBack}
                onNext={handleNext}
              />
            </form>
          )}

          {currentStep.kind === "choice" && (
            <div className="option-step">
              <div
                className={`option-grid ${
                  currentStep.field === "areaToExplore"
                    ? "area-category-grid"
                    : ""
                }`}
              >
                {currentStep.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleChoiceSelect(currentStep.field, option)}
                    className={`option-button ${
                      currentStep.field === "areaToExplore"
                        ? "area-category-button"
                        : ""
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-outline"
                >
                  Back
                </button>
              )}
            </div>
          )}

          {currentStep.kind === "image-choice" && (
            <div className="character-step">
              <div className="character-grid">
                {BOLLYWOOD_CHARACTERS.map((character) => (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() =>
                      handleChoiceSelect(
                        "bollywoodCharacter",
                        `${character.name} (${character.personalityTrait})`
                      )
                    }
                    className="character-card"
                    aria-label={`${character.name}, ${character.personalityTrait}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={character.image}
                      alt=""
                      className="character-card-image"
                      aria-hidden="true"
                      draggable={false}
                    />
                    <span className="character-card-footer">
                      <span className="character-card-name">{character.name}</span>
                      <span className="character-card-trait">
                        {character.personalityTrait}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-outline character-step-back"
                >
                  Back
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepActions({
  stepIndex,
  canProceed,
  isFinal,
  onBack,
  onNext,
}: {
  stepIndex: number;
  canProceed: boolean;
  isFinal: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {isFinal ? (
        <button type="button" onClick={onNext} className="btn-accent">
          Give Me Advice
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="btn-primary disabled:opacity-60"
        >
          Next
        </button>
      )}

      {stepIndex > 0 && (
        <button type="button" onClick={onBack} className="btn-outline">
          Back
        </button>
      )}
    </div>
  );
}
