import Image from "next/image";
import { APP_STORE_URL } from "@/lib/constants";

export function AppDownloadCta() {
  return (
    <section className="app-download-cta">
      <h3 className="app-download-footer-title">Get the App for More Details</h3>

      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="app-download-button"
        aria-label="Download GradRight on the App Store and Google Play"
      >
        <span className="app-download-button-icons" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <svg width="22" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12 3.84 21.85C3.34 21.6 3 21.09 3 20.5zm13.81-5.38L6.05 21.34 14.54 12.85l2.27 2.27zm3.35-4.31c.34.27.59.69.59 1.19s-.25.92-.59 1.19l-2.29 1.32L15.39 12l2.77-2.77 2.29 1.32zM6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66z" />
          </svg>
        </span>
        <span className="app-download-button-text">
          <span className="app-download-button-line">Download on the</span>
          <span className="app-download-button-line app-download-button-line-bold">
            App Store &amp; Google Play
          </span>
        </span>
      </a>
    </section>
  );
}

export function PoweredByFooter() {
  return (
    <div className="app-download-powered">
      <span className="app-download-powered-label">powered by</span>
      <a
        href="https://gradright.com"
        target="_blank"
        rel="noopener noreferrer"
        className="app-download-powered-link"
        aria-label="Visit GradRight website"
      >
        <Image
          src="/gradright-logo.svg"
          alt="GradRight"
          width={88}
          height={20}
          className="app-download-powered-logo"
        />
      </a>
    </div>
  );
}

export default function AppDownloadFooter() {
  return (
    <section className="app-download-footer">
      <AppDownloadCta />
      <PoweredByFooter />
    </section>
  );
}
