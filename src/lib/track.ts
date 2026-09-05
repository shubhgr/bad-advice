import { getTrackingParams, type TrackingParams } from "@/lib/utm";

export const DOWNLOAD_CLICK_EVENT = "bad_advice_download_click";

const PARENT_ORIGINS = [
  "https://gradright.com",
  "https://www.gradright.com",
] as const;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type DownloadClickPayload = {
  event: typeof DOWNLOAD_CLICK_EVENT;
  location: string;
  button: string;
  href: string;
  name?: string;
} & TrackingParams;

function sendDownloadClickToApi(payload: DownloadClickPayload): void {
  const { event: _event, location, button, href, name, ...tracking } = payload;
  const body = JSON.stringify({
    location,
    button,
    href,
    name,
    ...tracking,
    referrer: document.referrer,
  });

  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/track/download-click", blob);
      if (sent) return;
    }
  } catch {
    // fall through to fetch
  }

  try {
    void fetch("/api/track/download-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // never block navigation
  }
}

/**
 * Track last-page app download clicks.
 * Sends to Google Sheets in the background + GradRight parent (GTM) via postMessage.
 */
export function trackAppDownloadClick(options: {
  href: string;
  location?: string;
  button?: string;
  name?: string;
}): void {
  if (typeof window === "undefined") return;

  const tracking = getTrackingParams();
  const payload: DownloadClickPayload = {
    event: DOWNLOAD_CLICK_EVENT,
    location: options.location ?? "bridge",
    button: options.button ?? "Download the App now!",
    href: options.href,
    name: options.name?.trim() || "",
    ...tracking,
  };

  sendDownloadClickToApi(payload);

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ...payload });
  } catch {
    // ignore
  }

  if (window.parent && window.parent !== window) {
    for (const origin of PARENT_ORIGINS) {
      try {
        window.parent.postMessage(payload, origin);
      } catch {
        // ignore cross-origin / blocked
      }
    }
  }
}
