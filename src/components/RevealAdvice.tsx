"use client";

interface RevealAdviceProps {
  guidance: string;
  onShowRealAdvice: () => void;
  isLoadingRecommendations: boolean;
}

export default function RevealAdvice({
  guidance,
  onShowRealAdvice,
  isLoadingRecommendations,
}: RevealAdviceProps) {
  return (
    <div className="page-screen animate-fade-in">
      <header className="page-header">
        <p className="text-sm font-medium uppercase tracking-widest text-white/70">
          Graddie says
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          Sounds terrible, right? I know. Now let&apos;s fix that.
        </h2>
      </header>

      <div className="w-full border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
        <p className="text-center text-base leading-relaxed text-white whitespace-pre-wrap">
          {guidance}
        </p>
      </div>

      <button
        onClick={onShowRealAdvice}
        disabled={isLoadingRecommendations}
        className="btn-accent disabled:opacity-60"
      >
        {isLoadingRecommendations
          ? "Getting good advice..."
          : "Show Me Good Advice"}
      </button>
    </div>
  );
}
