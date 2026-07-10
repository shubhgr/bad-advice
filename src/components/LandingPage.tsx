"use client";

import Image from "next/image";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="landing-page animate-fade-in">
      <Image
        src="/images/bad-advice-logo.png"
        alt="Bad Advice"
        width={1024}
        height={246}
        className="landing-logo"
        priority
      />

      <div className="landing-hero-wrap">
        <Image
          src="/images/landing-hero.png"
          alt="Bad Advice mascot"
          width={768}
          height={1024}
          className="landing-hero"
          priority
        />

        <div className="landing-overlay">
          <h1 className="landing-headline">
            I specialise in Bad Advice.
            <br />
            Seriously.
            <br />
            You&apos;ll hate it.
          </h1>

          <button onClick={onStart} className="btn-accent landing-cta">
            Give Me Bad Advice
          </button>
        </div>
      </div>
    </div>
  );
}
