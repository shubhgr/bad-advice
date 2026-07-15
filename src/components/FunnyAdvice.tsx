"use client";

interface FunnyAdviceProps {
  headline: string;
  advice: string;
  onShowRealAdvice: () => void;
  isLoadingRecommendations: boolean;
}

export default function FunnyAdvice({
  headline,
  advice,
  onShowRealAdvice,
  isLoadingRecommendations,
}: FunnyAdviceProps) {
  return (
    <div className="advice-screen animate-fade-in">
      <div className="advice-screen-body">
        <div className="advice-main">
          <h3 className="advice-reveal-headline">{headline}</h3>

          <div className="advice-quote-card">
            <span className="advice-quote-mark" aria-hidden="true">
              &ldquo;
            </span>
            <p className="advice-quote-text">{advice}</p>
          </div>

          <p className="advice-footer-plug">
            Sounds terrible, right? I know. Now let&apos;s fix that.
          </p>

          <button
            onClick={onShowRealAdvice}
            disabled={isLoadingRecommendations}
            className="btn-accent disabled:opacity-60"
          >
            {isLoadingRecommendations ? "Please wait..." : "Show Me Good Advice"}
          </button>
        </div>
      </div>
    </div>
  );
}
