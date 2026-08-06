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
  href: string;
} & TrackingParams;

/**
 * Track last-page (and other) app download clicks.
 * Sends to GradRight parent (GTM) via postMessage + local dataLayer if present.
 */
export function trackAppDownloadClick(options: {
  href: string;
  location?: string;
}): void {
  if (typeof window === "undefined") return;

  const tracking = getTrackingParams();
  const payload: DownloadClickPayload = {
    event: DOWNLOAD_CLICK_EVENT,
    location: options.location ?? "bridge",
    href: options.href,
    ...tracking,
  };

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
