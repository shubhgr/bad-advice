"use client";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="landing-page animate-fade-in">
      <h1 className="landing-headline">
        We specialise in Bad Advice.
        <br />
        Seriously.
        <br />
        You&apos;ll hate it.
      </h1>

      <button onClick={onStart} className="btn-accent">
        Give Me Bad Advice
      </button>
    </div>
  );
}
