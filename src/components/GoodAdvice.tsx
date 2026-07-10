"use client";

import {
  AppDownloadCta,
  PoweredByFooter,
} from "@/components/AppDownloadFooter";

interface GoodAdviceProps {
  aspirationalHeading: string;
  advice: string;
  programCount: number;
}

export default function GoodAdvice({
  aspirationalHeading,
  advice,
  programCount,
}: GoodAdviceProps) {
  const programLabel =
    programCount === 1 ? "1 program" : `${programCount} programs`;

  return (
    <div className="advice-screen animate-fade-in">
      <div className="advice-screen-body">
        <div className="advice-main">
          <h3 className="advice-reveal-headline">{aspirationalHeading}</h3>

          <div className="advice-quote-card">
            <span className="advice-quote-mark" aria-hidden="true">
              &ldquo;
            </span>
            <p className="advice-quote-text">{advice}</p>
          </div>

          <p className="advice-footer-plug">
            Luckily, there are{" "}
            <span className="advice-program-highlight">{programLabel}</span> that
            can help get to {aspirationalHeading.toLowerCase()}
          </p>
        </div>

        <AppDownloadCta />
      </div>

      <PoweredByFooter />
    </div>
  );
}
