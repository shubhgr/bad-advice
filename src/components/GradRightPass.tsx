"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import { useAppStoreUrl } from "@/hooks/useAppStoreUrl";
import { trackAppDownloadClick } from "@/lib/track";
import {
  buildPassFromResponses,
  buildPassTraits,
  getPassPersonalityMascot,
  type PassMascotGender,
  type PassTraitIcon,
} from "@/lib/pass-card";
import type { UserResponses } from "@/lib/types";

const EXPORT_SCALE = 2;
const ASSET = "/images/pass/figma";

type SaveState = "idle" | "saving" | "saved" | "error";
type ShareFeedback = "copied" | "saved" | "ig-copied" | "error" | null;

/** Canonical link that opens straight on the Pass result screen. */
function shareResultUrl() {
  if (typeof window === "undefined") {
    return "https://gradright.com/flow-2?view=pass";
  }
  const url = new URL("/flow-2", window.location.origin);
  url.searchParams.set("view", "pass");
  return url.toString();
}

function waitForNextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`Timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

const GROTAP_FONT_URL = "/fonts/pass/grotap/Grotap-Bold.otf";
let grotapDataUrlPromise: Promise<string> | null = null;

/** Preload Grotap as a data URL so PNG export embeds it without hanging on .otf fetch. */
function getGrotapDataUrl() {
  if (!grotapDataUrlPromise) {
    grotapDataUrlPromise = fetch(GROTAP_FONT_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load Grotap (${res.status})`);
        return res.blob();
      })
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error ?? new Error("Grotap read failed"));
            reader.readAsDataURL(blob);
          }),
      );
  }
  return grotapDataUrlPromise;
}

function passDisplayFontFamily() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-pass-display")
    .trim()
    .replace(/^['"]|['"]$/g, "");
  return raw || "Grotap";
}

function trackPassEvent(event: string, extras: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...extras });
  } catch {
    // ignore
  }
}

function TraitIcon({ type }: { type: PassTraitIcon }) {
  const common = {
    className: "pass-pill-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (type === "lightning") {
    return (
      <svg {...common}>
        <path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" {...stroke} />
      </svg>
    );
  }
  if (type === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="6.5" {...stroke} />
        <path d="m16 16 4.5 4.5" {...stroke} />
      </svg>
    );
  }
  if (type === "tabs") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="14" height="12" rx="2" {...stroke} />
        <path d="M7 6V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1" {...stroke} />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M5 14c4-1 6-4 7-9 2 5 5 7 9 8-5 1-8 4-9 9-1-5-3-7-7-8Z" {...stroke} />
    </svg>
  );
}

function useFitText(
  ref: React.RefObject<HTMLElement | null>,
  {
    maxPx,
    minPx,
  }: {
    maxPx: number;
    minPx: number;
  },
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const fit = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(async () => {
        await document.fonts.ready.catch(() => undefined);
        const node = ref.current;
        if (!node) return;
        let size = maxPx;
        node.style.fontSize = `${size}px`;
        while (size > minPx && node.scrollWidth > node.clientWidth + 1) {
          size -= 1;
          node.style.fontSize = `${size}px`;
        }
      });
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [ref, maxPx, minPx]);
}

function CountUpNo({ value }: { value: string }) {
  const [display, setDisplay] = useState("0000");

  useEffect(() => {
    const digits = value.replace(/\D/g, "").padStart(4, "0").slice(-4);
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      if (frame >= 8) {
        setDisplay(digits);
        window.clearInterval(id);
        return;
      }
      setDisplay(
        Array.from({ length: 4 }, () => String(Math.floor(Math.random() * 10))).join(""),
      );
    }, 45);
    return () => window.clearInterval(id);
  }, [value]);

  return <span className="pass-member-no">#{display}</span>;
}

interface GradRightPassProps {
  trackLocation?: string;
  mascotGender?: PassMascotGender;
  responses?: UserResponses | null;
}

export default function GradRightPass({
  trackLocation = "flow-2",
  mascotGender = "female",
  responses = null,
}: GradRightPassProps) {
  const appStoreUrl = useAppStoreUrl();
  const cardRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const fitViewportRef = useRef<HTMLDivElement>(null);
  const fitScalerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [ctaPadTop, setCtaPadTop] = useState(12);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [exporting, setExporting] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<ShareFeedback>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [tiltReady, setTiltReady] = useState(false);
  const [fitScale, setFitScale] = useState(1);
  /** iOS Safari needs a tap + system permission before gyro works */
  const [motionPrompt, setMotionPrompt] = useState<"hidden" | "tap" | "denied">(
    "hidden",
  );
  const reduceMotionRef = useRef(false);
  const exportingRef = useRef(false);
  const gyroActiveRef = useRef(false);
  const gyroTargetRef = useRef({ x: 0, y: 0 });
  const gyroCurrentRef = useRef({ x: 0, y: 0 });
  const sharePanelRef = useRef<HTMLDivElement>(null);

  const pass = buildPassFromResponses(responses);
  const traits = buildPassTraits(pass);
  const mascotSrc =
    getPassPersonalityMascot(pass.personalityTitle) ?? `${ASSET}/mascot-blob.svg`;
  void mascotGender;

  useFitText(titleRef, { maxPx: 35, minPx: 26 });
  // Mission/Match stay fixed 14px Poppins Semibold — no fit-text shrink

  // Scale the Pass card into the flex slot above the CTA dock.
  // Tall phones: scale UP (capped) + grow CTA padding. Short phones: scale DOWN.
  useLayoutEffect(() => {
    const screen = fitViewportRef.current?.closest(".pass-screen") as HTMLElement | null;
    const viewport = fitViewportRef.current;
    const scaler = fitScalerRef.current;
    const actions = actionsRef.current;
    if (!screen || !viewport || !scaler || !actions) return;

    let raf = 0;
    const MIN_SCALE = 0.55;
    const MAX_SCALE = 1.22;
    const MIN_CTA_PAD = 12;
    const MAX_CTA_PAD = 48;

    const applyFit = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (exporting) {
          scaler.style.marginRight = "";
          scaler.style.marginBottom = "";
          scaler.style.setProperty("--pass-fit-scale", "1");
          actions.style.paddingTop = `${MIN_CTA_PAD}px`;
          setFitScale(1);
          setCtaPadTop(MIN_CTA_PAD);
          screen.classList.remove("is-scrollable");
          return;
        }

        // Measure at min CTA pad + natural card size
        actions.style.paddingTop = `${MIN_CTA_PAD}px`;
        scaler.style.marginRight = "0px";
        scaler.style.marginBottom = "0px";
        scaler.style.setProperty("--pass-fit-scale", "1");
        void scaler.offsetWidth;
        void actions.offsetHeight;

        const naturalW = Math.max(1, scaler.offsetWidth);
        const naturalH = Math.max(1, scaler.offsetHeight);
        const availW = Math.max(1, screen.clientWidth);
        const dockH = Math.max(1, actions.offsetHeight);
        // Card budget = screen minus CTA dock (stable; avoids pad/scale feedback loop)
        const cardBudget = Math.max(1, screen.clientHeight - dockH);

        const next = Math.max(
          MIN_SCALE,
          Math.min(MAX_SCALE, availW / naturalW, cardBudget / naturalH),
        );
        const rounded = Math.round(next * 1000) / 1000;

        scaler.style.setProperty("--pass-fit-scale", String(rounded));
        scaler.style.marginRight = `${naturalW * (rounded - 1)}px`;
        scaler.style.marginBottom = `${naturalH * (rounded - 1)}px`;

        const fittedH = naturalH * rounded;
        const slack = Math.max(0, cardBudget - fittedH);
        const pad = Math.round(
          Math.min(MAX_CTA_PAD, Math.max(MIN_CTA_PAD, MIN_CTA_PAD + slack * 0.55)),
        );
        actions.style.paddingTop = `${pad}px`;

        setFitScale(rounded);
        setCtaPadTop(pad);

        screen.classList.toggle("is-scrollable", fittedH > cardBudget + 1);
      });
    };

    applyFit();
    const ro = new ResizeObserver(applyFit);
    ro.observe(screen);
    ro.observe(viewport);
    if (cardRef.current) ro.observe(cardRef.current);
    window.addEventListener("resize", applyFit);
    void document.fonts.ready.then(applyFit).catch(() => undefined);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", applyFit);
    };
  }, [exporting, ready, pass.personalityTitle, pass.name, pass.mission, pass.match]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = mq.matches;
    const onChange = () => {
      reduceMotionRef.current = mq.matches;
      if (mq.matches) {
        gyroTargetRef.current = { x: 0, y: 0 };
        gyroCurrentRef.current = { x: 0, y: 0 };
        setTilt({ x: 0, y: 0 });
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    exportingRef.current = exporting;
    if (exporting) {
      gyroTargetRef.current = { x: 0, y: 0 };
      gyroCurrentRef.current = { x: 0, y: 0 };
      setTilt({ x: 0, y: 0 });
    }
  }, [exporting]);

  useEffect(() => {
    trackPassEvent("result_viewed", { location: trackLocation });
    const t = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(t);
  }, [trackLocation]);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setTiltReady(true), 820);
    return () => {
      window.clearTimeout(t);
      setTiltReady(false);
    };
  }, [ready]);

  // Mobile: DeviceOrientation → same --tilt-x/y as pointer tilt (Zyro-like).
  // Android: starts immediately. iPhone/Safari: needs a tap so requestPermission
  // runs inside a user gesture, then Safari shows Allow / Deny.
  useEffect(() => {
    if (!tiltReady) return;

    type OrientationPermission = {
      requestPermission?: () => Promise<"granted" | "denied" | "default">;
    };

    const isTouchPrimary = () =>
      window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    if (!isTouchPrimary() || typeof window.DeviceOrientationEvent === "undefined") {
      setMotionPrompt("hidden");
      return;
    }

    let listening = false;
    let cancelled = false;
    let gotOrientEvent = false;
    let raf = 0;
    let waitTimer = 0;
    let baseline: { beta: number; gamma: number } | null = null;
    const GYRO_RANGE = 18;
    const MAX_X = 14;
    const MAX_Y = 16;
    const LERP = 0.16;

    const DOE = DeviceOrientationEvent as typeof DeviceOrientationEvent &
      OrientationPermission;
    const needsPermission = typeof DOE.requestPermission === "function";

    const clamp = (value: number, max: number) =>
      Math.max(-max, Math.min(max, value));

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (reduceMotionRef.current || exportingRef.current) {
        gyroTargetRef.current = { x: 0, y: 0 };
      }
      if (!gyroActiveRef.current) return;

      const target = gyroTargetRef.current;
      const current = gyroCurrentRef.current;
      current.x += (target.x - current.x) * LERP;
      current.y += (target.y - current.y) * LERP;
      if (Math.abs(current.x) < 0.02 && target.x === 0) current.x = 0;
      if (Math.abs(current.y) < 0.02 && target.y === 0) current.y = 0;

      const nextX = +current.x.toFixed(2);
      const nextY = +current.y.toFixed(2);
      setTilt((prev) =>
        prev.x === nextX && prev.y === nextY ? prev : { x: nextX, y: nextY },
      );
    };

    const onOrient = (event: DeviceOrientationEvent) => {
      if (cancelled || reduceMotionRef.current || exportingRef.current) return;
      if (!isTouchPrimary()) return;

      const beta = event.beta;
      const gamma = event.gamma;
      if (beta == null || gamma == null) return;

      gotOrientEvent = true;
      if (!baseline) baseline = { beta, gamma };

      const dBeta = beta - baseline.beta;
      const dGamma = gamma - baseline.gamma;
      gyroActiveRef.current = true;
      setMotionPrompt("hidden");
      gyroTargetRef.current = {
        x: clamp((-dBeta / GYRO_RANGE) * MAX_X, MAX_X),
        y: clamp((dGamma / GYRO_RANGE) * MAX_Y, MAX_Y),
      };
    };

    const startListening = () => {
      if (cancelled) return;
      if (!listening) {
        listening = true;
        window.addEventListener("deviceorientation", onOrient, true);
        raf = requestAnimationFrame(tick);
      }
      baseline = null;
    };

    let requestingPermission = false;

    const requestIosPermission = async () => {
      if (
        cancelled ||
        reduceMotionRef.current ||
        requestingPermission ||
        gotOrientEvent ||
        gyroActiveRef.current
      ) {
        return;
      }
      requestingPermission = true;
      try {
        // Must be invoked from a click/tap stack on iOS Safari.
        const result = await DOE.requestPermission!();
        if (cancelled) return;
        if (result === "granted") {
          setMotionPrompt("hidden");
          startListening();
        } else {
          setMotionPrompt("denied");
        }
      } catch {
        setMotionPrompt("denied");
      } finally {
        requestingPermission = false;
      }
    };

    const wrap = wrapRef.current;

    if (!needsPermission) {
      // Android / Chrome: no system prompt — start now.
      setMotionPrompt("hidden");
      startListening();
    } else {
      // iOS: try quietly (already granted on this origin). If no events, ask for a tap.
      startListening();
      waitTimer = window.setTimeout(() => {
        if (!cancelled && !gotOrientEvent) setMotionPrompt("tap");
      }, 700);

      // click is the reliable user-gesture for Safari's permission sheet.
      // Skip touchend to avoid double-firing with the synthetic click.
      const onEnableTap = () => {
        void requestIosPermission();
      };

      wrap?.addEventListener("click", onEnableTap);

      return () => {
        cancelled = true;
        window.clearTimeout(waitTimer);
        cancelAnimationFrame(raf);
        window.removeEventListener("deviceorientation", onOrient, true);
        wrap?.removeEventListener("click", onEnableTap);
        gyroActiveRef.current = false;
        gyroTargetRef.current = { x: 0, y: 0 };
        gyroCurrentRef.current = { x: 0, y: 0 };
        setMotionPrompt("hidden");
      };
    }

    return () => {
      cancelled = true;
      window.clearTimeout(waitTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("deviceorientation", onOrient, true);
      gyroActiveRef.current = false;
      gyroTargetRef.current = { x: 0, y: 0 };
      gyroCurrentRef.current = { x: 0, y: 0 };
      setMotionPrompt("hidden");
    };
  }, [tiltReady]);

  useEffect(() => {
    if (saveState !== "saved" && saveState !== "error") return;
    const t = window.setTimeout(() => setSaveState("idle"), 2000);
    return () => window.clearTimeout(t);
  }, [saveState]);

  useEffect(() => {
    if (!shareFeedback) return;
    const t = window.setTimeout(() => setShareFeedback(null), 2200);
    return () => window.clearTimeout(t);
  }, [shareFeedback]);

  useEffect(() => {
    if (!shareOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShareOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = sharePanelRef.current?.querySelector<HTMLElement>(
      ".pass-share-action",
    );
    first?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [shareOpen]);

  function handleTiltMove(event: React.PointerEvent<HTMLDivElement>) {
    // Touch devices use gyro; keep pointer tilt for mouse/pen only.
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    if (gyroActiveRef.current) return;
    if (reduceMotionRef.current || exporting || !ready) return;
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: +(py * -14).toFixed(2),
      y: +(px * 16).toFixed(2),
    });
  }

  function handleTiltLeave() {
    if (gyroActiveRef.current) return;
    setTilt({ x: 0, y: 0 });
  }

  function handleDownloadClick() {
    trackAppDownloadClick({
      href: appStoreUrl,
      location: trackLocation,
      button: "Download the app",
    });
    trackPassEvent("download_clicked", { location: trackLocation });
  }

  function shareMessage() {
    return `I'm a ${pass.personalityTitle} on GradRight Pass — check yours: ${shareResultUrl()}`;
  }

  async function exportPassPng() {
    const card = cardRef.current;
    if (!card) throw new Error("Card not mounted");
    await document.fonts.ready.catch(() => undefined);
    const grotapDataUrl = await getGrotapDataUrl();
    await waitForNextPaint();

    const { domToBlob, domToPng } = await import("modern-screenshot");
    // Use layout size (not transformed/scaled visual size) for crisp PNG export
    const exportHeight = Math.max(1, Math.ceil(card.offsetHeight));
    const exportWidth = Math.max(1, Math.ceil(card.offsetWidth) || 332);
    const grotapFamily = passDisplayFontFamily();
    // Inject Grotap @font-face alongside auto-embedded Poppins/etc.
    // (cssText alone would replace every face — so we append via a style tag on the card.)
    const grotapStyle = document.createElement("style");
    grotapStyle.setAttribute("data-pass-export-font", "");
    grotapStyle.textContent = `
@font-face {
  font-family: '${grotapFamily}';
  src: url('${grotapDataUrl}') format('opentype');
  font-weight: 500 800;
  font-style: normal;
  font-display: block;
}
@font-face {
  font-family: 'Grotap';
  src: url('${grotapDataUrl}') format('opentype');
  font-weight: 500 800;
  font-style: normal;
  font-display: block;
}
`;
    card.appendChild(grotapStyle);

    const options = {
      scale: EXPORT_SCALE,
      // Solid black behind rounded corners / ticket notches (avoids white gallery fill)
      backgroundColor: "#000000",
      width: exportWidth,
      height: exportHeight,
      // Serve local Grotap .otf as a data URL so embed does not hang
      fetchFn: async (url: string) => {
        if (/grotap|\.otf($|\?)/i.test(url)) return grotapDataUrl;
        return false;
      },
      timeout: 8000,
      style: {
        transform: "none",
        animation: "none",
        opacity: "1",
        filter: "none",
      },
      filter: (node: Node) =>
        !(
          node instanceof HTMLElement &&
          node.dataset.exportExclude !== undefined
        ),
    };

    let blob: Blob | null = null;
    try {
      try {
        blob = await withTimeout(
          domToBlob(card, {
            ...options,
            type: "image/png",
            quality: 1,
          }),
          9000,
        );
      } catch (blobError) {
        console.warn("domToBlob failed, falling back to domToPng", blobError);
      }

      if (!blob || blob.size < 32) {
        const dataUrl = await withTimeout(domToPng(card, options), 9000);
        const res = await fetch(dataUrl);
        blob = await res.blob();
      }

      if (!blob || blob.size < 32) {
        throw new Error("Pass image export produced an empty file");
      }

      const slug =
        pass.personalityTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "card";
      const fileName = `gradright-pass-${slug}.png`;
      return { blob, fileName };
    } finally {
      grotapStyle.remove();
    }
  }

  function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.rel = "noopener";
    link.target = "_self";
    link.style.display = "none";
    document.body.appendChild(link);
    // Keep the click in the same turn as the gesture where possible
    link.click();
    window.setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(url);
    }, 4000);
  }

  function openShareSheet() {
    trackPassEvent("share_sheet_opened", { location: trackLocation });
    setShareFeedback(null);
    setShareOpen(true);
  }

  async function handleCopyLink() {
    trackPassEvent("share_copy_link", { location: trackLocation });
    try {
      await navigator.clipboard.writeText(shareResultUrl());
      setShareFeedback("copied");
    } catch {
      setShareFeedback(null);
    }
  }

  function handleShareWhatsApp() {
    trackPassEvent("share_whatsapp", { location: trackLocation });
    const href = `https://wa.me/?text=${encodeURIComponent(shareMessage())}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  async function handleShareInstagram() {
    trackPassEvent("share_instagram", { location: trackLocation });
    const url = shareResultUrl();
    try {
      await navigator.clipboard.writeText(url);
      setShareFeedback("ig-copied");
    } catch {
      setShareFeedback(null);
    }
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  async function handleDownloadPng() {
    trackPassEvent("card_shared", { location: trackLocation, method: "png" });
    if (saveState === "saving") return;

    flushSync(() => {
      setSaveState("saving");
      setShareFeedback(null);
      setExporting(true);
    });

    try {
      await waitForNextPaint();
      const { blob, fileName } = await exportPassPng();
      // Always trigger a file download — never open the native share sheet.
      downloadBlob(blob, fileName);
      setSaveState("saved");
      setShareFeedback("saved");
    } catch (error) {
      console.error("Failed to save pass card:", error);
      setSaveState("error");
      setShareFeedback("error");
    } finally {
      setExporting(false);
    }
  }

  const shareBusy = saveState === "saving";
  const feedbackLabel =
    shareFeedback === "copied"
      ? "Result link copied"
      : shareFeedback === "saved"
        ? "Pass image downloaded"
        : shareFeedback === "ig-copied"
          ? "Link copied — paste in Instagram"
          : shareFeedback === "error"
            ? "Couldn’t save image — try again"
            : null;

  const titleLines = splitTitle(pass.personalityTitle);

  return (
    <div className={`pass-screen${ready ? " is-ready" : ""}`}>
      <div className="pass-fit-viewport" ref={fitViewportRef}>
        <div
          className="pass-fit-scaler"
          ref={fitScalerRef}
          data-fit-scale={fitScale}
          style={
            {
              "--pass-fit-scale": String(fitScale),
            } as React.CSSProperties
          }
        >
      <div className="pass-stage">
        <div className="pass-halo" aria-hidden="true" />
        <div
          ref={wrapRef}
          className={`pass-card-wrap${tiltReady && !exporting ? " is-tilt-ready" : ""}${
            motionPrompt === "tap" ? " needs-motion-tap" : ""
          }`}
          style={
            {
              "--tilt-x": `${tilt.x}deg`,
              "--tilt-y": `${tilt.y}deg`,
            } as React.CSSProperties
          }
          onPointerMove={handleTiltMove}
          onPointerLeave={handleTiltLeave}
          onPointerCancel={handleTiltLeave}
        >
          {motionPrompt === "tap" && !exporting ? (
            <p className="pass-motion-hint" role="status">
              Tap card to enable motion tilt
            </p>
          ) : null}
          {motionPrompt === "denied" && !exporting ? (
            <p className="pass-motion-hint is-denied" role="status">
              Motion blocked — enable in iOS Settings → Safari → Motion
            </p>
          ) : null}
          <article
            ref={cardRef}
            className={`pass-card${exporting ? " is-exporting" : ""}`}
            aria-label={`Your GradRight pass: ${pass.personalityTitle}`}
          >
            <div className="pass-mesh" aria-hidden="true" />
            <div className="pass-dots" aria-hidden="true" />
            <div className="pass-noise" aria-hidden="true" />

            <div className="pass-inner">
              <div className="pass-top-row">
                <span className="pass-glass pass-brand-pill">
                  <Image
                    src="/gradright-logo.svg"
                    alt="GradRight"
                    width={78}
                    height={18}
                    className="pass-brand-logo"
                    priority
                  />
                  <span className="pass-brand-pass">Pass</span>
                </span>
                <div className="pass-member">
                  <CountUpNo value={pass.memberNo} />
                </div>
              </div>

              <div className="pass-title-block">
                <h1 ref={titleRef} className="pass-headline">
                  {titleLines.map((line, i) => (
                    <span key={line}>
                      {i > 0 ? <br /> : null}
                      {line}
                    </span>
                  ))}
                </h1>
                <p className="pass-tagline">{pass.tagline}</p>
              </div>

              <div className="pass-mascot-zone">
                <div className="pass-mascot-glow" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mascotSrc}
                  alt="GradRight pass mascot"
                  className={`pass-mascot${
                    pass.personalityId === "the-never-settler"
                      ? " is-never-settler"
                      : ""
                  }`}
                  draggable={false}
                />
              </div>

              <div className="pass-details">
                <div className="pass-detail-row">
                  <span className="pass-detail-label">Name</span>
                  <p
                    className="pass-detail-value is-name"
                    title={pass.name || undefined}
                  >
                    <span className="pass-detail-clamp">{pass.name}</span>
                  </p>
                  <span className="pass-name-line" aria-hidden="true" />
                </div>
                <div className="pass-detail-pair">
                  <div className="pass-detail-row">
                    <span className="pass-detail-label">Mission</span>
                    <p
                      className="pass-detail-value is-mission"
                      title={pass.mission || undefined}
                    >
                      <span className="pass-detail-clamp">{pass.mission}</span>
                    </p>
                  </div>
                  <div className="pass-detail-row">
                    <span className="pass-detail-label">Match</span>
                    <p
                      className="pass-detail-value is-match"
                      title={pass.match || undefined}
                    >
                      <span className="pass-detail-clamp">{pass.match}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="pass-pills">
                {traits.map((trait) => (
                  <span key={trait.id} className="pass-pill">
                    <TraitIcon type={trait.icon} />
                    <span>{trait.label}</span>
                  </span>
                ))}
              </div>

              <p className="pass-footer-note">
                Screenshot this. You will need it later.
              </p>
            </div>
          </article>
        </div>
      </div>

        </div>
      </div>

      <div
        className="pass-actions"
        data-export-exclude=""
        ref={actionsRef}
        style={{ paddingTop: ctaPadTop }}
      >
        <a
          href={appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pass-primary"
          data-track="bad_advice_download_click"
          onClick={handleDownloadClick}
        >
          Download the App
        </a>
        <button
          type="button"
          className="pass-share"
          onClick={openShareSheet}
          aria-label="Share my card"
          title="Share my card"
          aria-haspopup="dialog"
          aria-expanded={shareOpen}
        >
          <svg
            className="pass-share-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 3v11"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            <path
              d="m8.5 6.5 3.5-3.5 3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 13v5.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V13"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {shareOpen ? (
        <div className="pass-share-sheet" data-export-exclude="">
          <button
            type="button"
            className="pass-share-backdrop"
            aria-label="Close share options"
            onClick={() => setShareOpen(false)}
          />
          <div
            ref={sharePanelRef}
            className="pass-share-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pass-share-title"
          >
            <div className="pass-share-panel-head">
              <h2 id="pass-share-title" className="pass-share-title">
                Share your Pass
              </h2>
              <button
                type="button"
                className="pass-share-dismiss"
                aria-label="Close"
                onClick={() => setShareOpen(false)}
              >
                ✕
              </button>
            </div>
            {feedbackLabel ? (
              <p className="pass-share-feedback" role="status">
                {feedbackLabel}
              </p>
            ) : null}
            <div className="pass-share-actions">
              <button
                type="button"
                className="pass-share-action"
                onClick={handleCopyLink}
              >
                <span className="pass-share-action-icon" aria-hidden="true">
                  <ShareGlyph kind="link" />
                </span>
                <span className="pass-share-action-copy">
                  <span className="pass-share-action-label">Copy link</span>
                  <span className="pass-share-action-hint">Opens this Pass result screen</span>
                </span>
              </button>
              <button
                type="button"
                className="pass-share-action"
                onClick={handleShareWhatsApp}
              >
                <span className="pass-share-action-icon is-whatsapp" aria-hidden="true">
                  <ShareGlyph kind="whatsapp" />
                </span>
                <span className="pass-share-action-copy">
                  <span className="pass-share-action-label">WhatsApp</span>
                  <span className="pass-share-action-hint">Share a link to this Pass</span>
                </span>
              </button>
              <button
                type="button"
                className="pass-share-action"
                onClick={handleShareInstagram}
              >
                <span className="pass-share-action-icon is-instagram" aria-hidden="true">
                  <ShareGlyph kind="instagram" />
                </span>
                <span className="pass-share-action-copy">
                  <span className="pass-share-action-label">Instagram</span>
                  <span className="pass-share-action-hint">
                    Copy result link to paste in Instagram
                  </span>
                </span>
              </button>
              <button
                type="button"
                className="pass-share-action"
                onClick={handleDownloadPng}
                disabled={shareBusy}
              >
                <span className="pass-share-action-icon" aria-hidden="true">
                  <ShareGlyph kind="download" />
                </span>
                <span className="pass-share-action-copy">
                  <span className="pass-share-action-label">
                    {shareBusy ? "Saving…" : "Download image"}
                  </span>
                  <span className="pass-share-action-hint">Save the Pass card as a PNG</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ShareGlyph({
  kind,
}: {
  kind: "link" | "whatsapp" | "instagram" | "download";
}) {
  if (kind === "link") {
    return (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <path
          d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.93"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M14 11a5 5 0 0 0-7.07 0L5.52 12.4a5 5 0 0 0 7.07 7.07L14 18.07"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.84c0 1.96.57 3.78 1.56 5.32L2 22l4.99-1.63a9.86 9.86 0 0 0 5.05 1.36h.01c5.46 0 9.89-4.4 9.89-9.84C21.94 6.4 17.5 2 12.04 2Zm5.75 14.07c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.39-.14-.2-1.18-1.57-1.18-3 0-1.42.74-2.12 1.01-2.41.26-.29.58-.36.77-.36h.55c.18 0 .42-.07.65.5.24.58.81 2 .88 2.14.07.14.12.31.02.5-.1.2-.14.31-.28.48-.14.16-.3.37-.42.49-.14.14-.28.29-.12.56.16.28.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.27.14.43.12.59-.07.16-.2.68-.79.86-1.06.18-.27.36-.22.61-.13.24.09 1.55.73 1.82.86.27.14.45.2.52.31.07.12.07.68-.17 1.36Z" />
      </svg>
    );
  }
  if (kind === "instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
      <path
        d="M12 4v10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="m8.5 10.5 3.5 3.5 3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 16v2.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function splitTitle(title: string): string[] {
  const cleaned = title.replace(/^\s*the\s+/i, "").trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length <= 1) return [cleaned];
  if (parts.length === 2) return parts;
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")];
}
