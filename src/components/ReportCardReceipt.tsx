"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useAppStoreUrl } from "@/hooks/useAppStoreUrl";
import { trackAppDownloadClick } from "@/lib/track";

const COUPON_CODE = "BADADVICE15";
const EXPORT_SCALE = 3;

/** Placeholder copy — swap when quiz fields are final. Keep lines short. */
const PLACEHOLDER = {
  receiptNo: "#BAD-4821",
  personalityTitle: "THE TAB COLLECTOR",
  personalityRead: "37 tabs open. One late-night spiral.",
  strength: "Thorough before you leap.",
  blindSpot: "Waiting for perfect instead of starting.",
  mission: "Level up without pausing the paycheck.",
  betterMove: "Shortlist 3 weekend-friendly programs.",
  matchService: "GradRight Online Programs",
  matchPitch: "Flexible certificates, in the app.",
} as const;

type SaveState = "idle" | "saving" | "saved" | "error";

function trackReceiptEvent(event: string, extras: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...extras });
  } catch {
    // ignore
  }
}

function UpskillIllustration() {
  return (
    <svg
      className="bad-receipt-illustration"
      viewBox="0 0 200 64"
      role="img"
      aria-label="Flat illustration of two graduates with a laptop and certificate"
    >
      <circle cx="52" cy="18" r="10" fill="#F6F1E7" stroke="#17131F" strokeWidth="2" />
      <path
        d="M40 52c1.5-12 7-18 12-18s10.5 6 12 18"
        fill="#6A2CF5"
        stroke="#17131F"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="68" y="30" width="28" height="18" rx="2" fill="#F6F1E7" stroke="#17131F" strokeWidth="2" />
      <rect x="72" y="35" width="20" height="2" rx="1" fill="#A8E05A" />
      <rect x="72" y="40" width="14" height="2" rx="1" fill="#CDB8FF" />

      <circle cx="140" cy="18" r="10" fill="#F6F1E7" stroke="#17131F" strokeWidth="2" />
      <path
        d="M128 52c1.5-12 7-18 12-18s10.5 6 12 18"
        fill="#3A2A7A"
        stroke="#17131F"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="154" y="28" width="24" height="16" rx="2" fill="#F6F1E7" stroke="#17131F" strokeWidth="2" />
      <path d="M158 33h16M158 38h12" stroke="#6A2CF5" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="172" cy="32" r="2.25" fill="#A8E05A" stroke="#17131F" strokeWidth="1.25" />

      <path
        d="M92 16c6-10 18-12 26-4"
        fill="none"
        stroke="#A8E05A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M112 10l7 3-4 6" fill="#A8E05A" stroke="#17131F" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

function DecorativeBarcode() {
  const bars = [2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 1];
  let x = 0;
  return (
    <svg
      className="bad-receipt-barcode"
      viewBox="0 0 96 16"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {bars.map((width, index) => {
        const rect = (
          <rect key={`${index}-${x}`} x={x} y={0} width={width} height={16} fill="currentColor" />
        );
        x += width + 1.2;
        return rect;
      })}
    </svg>
  );
}

function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="bad-receipt-confetti" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} style={{ "--i": i } as CSSProperties} />
      ))}
    </div>
  );
}

interface ReportCardReceiptProps {
  trackLocation?: string;
}

export default function ReportCardReceipt({
  trackLocation = "flow-2",
}: ReportCardReceiptProps) {
  const appStoreUrl = useAppStoreUrl();
  const paperRef = useRef<HTMLElement>(null);
  const [isPrinted, setIsPrinted] = useState(false);
  const [couponUnlocked, setCouponUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [issuedAt] = useState(() =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date())
  );

  useEffect(() => {
    trackReceiptEvent("receipt_viewed", { location: trackLocation });
  }, [trackLocation]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(
      () => setIsPrinted(true),
      reduced ? 280 : 2100
    );
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!codeCopied) return;
    const timeout = window.setTimeout(() => setCodeCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [codeCopied]);

  useEffect(() => {
    if (saveState !== "saved" && saveState !== "error") return;
    const timeout = window.setTimeout(() => setSaveState("idle"), 2000);
    return () => window.clearTimeout(timeout);
  }, [saveState]);

  function unlockCoupon(source: string) {
    if (couponUnlocked) return;
    setCouponUnlocked(true);
    setShowConfetti(true);
    trackReceiptEvent("coupon_unlocked", { location: trackLocation, source });
    window.setTimeout(() => setShowConfetti(false), 800);
  }

  async function copyCoupon() {
    if (!couponUnlocked) return;
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
      setCodeCopied(true);
      trackReceiptEvent("coupon_copied", {
        location: trackLocation,
        code: COUPON_CODE,
      });
    } catch {
      // ignore
    }
  }

  function handleDownloadClick() {
    unlockCoupon("download");
    trackAppDownloadClick({
      href: appStoreUrl,
      location: trackLocation,
      button: "Download the app",
    });
    trackReceiptEvent("download_clicked", { location: trackLocation });
  }

  async function handlePrintOrSave() {
    trackReceiptEvent("print_clicked", { location: trackLocation });
    unlockCoupon("print");
    if (saveState === "saving") return;
    setSaveState("saving");

    try {
      const paper = paperRef.current;
      if (!paper) throw new Error("Receipt not mounted");
      await document.fonts.ready;
      const { domToBlob } = await import("modern-screenshot");
      const blob = await domToBlob(paper, {
        scale: EXPORT_SCALE,
        type: "image/png",
        backgroundColor: "#F6F1E7",
        filter: (node) =>
          !(
            node instanceof HTMLElement &&
            node.dataset.exportExclude !== undefined
          ),
      });

      const fileName = "gradright-bad-advice-receipt.png";
      const file = new File([blob], fileName, { type: "image/png" });
      const isTouch = window.matchMedia("(pointer: coarse)").matches;

      if (isTouch && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "My Bad Advice receipt",
          });
          setSaveState("saved");
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            setSaveState("idle");
            return;
          }
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setSaveState("saved");
    } catch (error) {
      console.error("Failed to save receipt:", error);
      setSaveState("error");
    }
  }

  const printLabel =
    saveState === "saving"
      ? "Saving…"
      : saveState === "saved"
        ? "Saved"
        : saveState === "error"
          ? "Try again"
          : "Print my receipt";

  return (
    <div className={`bad-receipt-screen${isPrinted ? " is-printed" : ""}`}>
      <div className="bad-receipt-machine" aria-hidden="true">
        <div className="bad-receipt-machine-body">
          <span className="bad-receipt-machine-light" />
          <span className="bad-receipt-machine-slot" />
        </div>
      </div>

      <div className="bad-receipt-stage">
        <div className="bad-receipt-feed">
          <article
            ref={paperRef}
            className="bad-receipt-paper"
            aria-label="Bad Advice Department official-ish report card"
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget) setIsPrinted(true);
            }}
          >
            <header className="bad-receipt-header">
              <p className="bad-receipt-dept">Bad Advice Department</p>
              <div className="bad-receipt-meta">
                <span>{PLACEHOLDER.receiptNo}</span>
                <span>{issuedAt}</span>
              </div>
              <p className="bad-receipt-tagline">Official-ish report card</p>
            </header>

            <UpskillIllustration />

            <div className="bad-receipt-dash" aria-hidden="true" />

            <section className="bad-receipt-block">
              <p className="bad-receipt-label">Personality</p>
              <h2 className="bad-receipt-title">{PLACEHOLDER.personalityTitle}</h2>
              <p className="bad-receipt-value">{PLACEHOLDER.personalityRead}</p>
            </section>

            <section className="bad-receipt-traits">
              <p>
                <span className="bad-receipt-inline-label">Strength</span>
                {PLACEHOLDER.strength}
              </p>
              <p>
                <span className="bad-receipt-inline-label">Blind spot</span>
                {PLACEHOLDER.blindSpot}
              </p>
            </section>

            <section className="bad-receipt-block">
              <p className="bad-receipt-label">Mission</p>
              <p className="bad-receipt-value">{PLACEHOLDER.mission}</p>
            </section>

            <section className="bad-receipt-block">
              <p className="bad-receipt-label">Better move</p>
              <p className="bad-receipt-value">{PLACEHOLDER.betterMove}</p>
            </section>

            <section className="bad-receipt-block bad-receipt-match-block">
              <p className="bad-receipt-label">GradRight match</p>
              <p className="bad-receipt-match">{PLACEHOLDER.matchService}</p>
              <p className="bad-receipt-value">{PLACEHOLDER.matchPitch}</p>
            </section>

            <footer className="bad-receipt-footer">
              <p className="bad-receipt-thanks">thank you</p>
              <p className="bad-receipt-total">
                TOTAL <span>15% OFF</span>
              </p>
              <DecorativeBarcode />
            </footer>

            <div className="bad-receipt-perforation" aria-hidden="true" />

            <aside
              className={`bad-receipt-coupon${couponUnlocked ? " is-unlocked" : ""}`}
            >
              <ConfettiBurst active={showConfetti} />
              <p className="bad-receipt-coupon-title">
                Unlock <span>15% OFF</span>
              </p>
              <p className="bad-receipt-coupon-sub">on any online program</p>
              <div className="bad-receipt-coupon-code-row">
                {couponUnlocked ? (
                  <>
                    <code className="bad-receipt-coupon-code">{COUPON_CODE}</code>
                    <button
                      type="button"
                      className="bad-receipt-copy-btn"
                      onClick={copyCoupon}
                      data-export-exclude=""
                    >
                      {codeCopied ? "Copied" : "Copy"}
                    </button>
                  </>
                ) : (
                  <>
                    <code
                      className="bad-receipt-coupon-code is-locked"
                      aria-hidden="true"
                    >
                      {COUPON_CODE}
                    </code>
                    <span className="bad-receipt-lock" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6V11Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="visually-hidden">Coupon code locked</span>
                  </>
                )}
              </div>
            </aside>
          </article>
        </div>
      </div>

      <div className="bad-receipt-actions" data-export-exclude="">
        <a
          href={appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bad-receipt-primary"
          data-track="bad_advice_download_click"
          onClick={handleDownloadClick}
        >
          Download the app
          <span className="bad-receipt-primary-sub">Unlock your 15% off</span>
        </a>
        <button
          type="button"
          className="bad-receipt-secondary"
          onClick={handlePrintOrSave}
          aria-busy={saveState === "saving"}
        >
          {printLabel}
        </button>
      </div>
    </div>
  );
}
