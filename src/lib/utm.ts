const UTM_STORAGE_KEY = "bad-advice-utm";

/** Extra non-utm tracking keys we also forward when present (e.g. Link Runner). */
const EXTRA_TRACKING_KEYS = ["c"] as const;

export type TrackingParams = Record<string, string>;

/** Fallback when the page is opened with no UTMs (direct / no WordPress pass-through) */
export const DEFAULT_APP_STORE_TRACKING: TrackingParams = {
  utm_source: "LP",
  utm_medium: "Bad_Advice_2026",
  utm_campaign: "Bad_Advice_Event",
};

export const APP_STORE_BASE_URL = "https://link.gradright.com/";

function isTrackingKey(key: string): boolean {
  return key.startsWith("utm_") || EXTRA_TRACKING_KEYS.includes(key as (typeof EXTRA_TRACKING_KEYS)[number]);
}

/**
 * Pick every tracking param from the URL:
 * - all utm_* keys (source, medium, campaign, content, term, or any new ones)
 * - c when present (Link Runner id)
 * Missing keys are not invented.
 */
function pickTrackingParams(source: URLSearchParams): TrackingParams {
  const picked: TrackingParams = {};
  source.forEach((rawValue, key) => {
    const value = rawValue.trim();
    if (!value || !isTrackingKey(key)) return;
    picked[key] = value;
  });
  return picked;
}

function readStoredTracking(): TrackingParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as TrackingParams;
    if (!parsed || typeof parsed !== "object") return {};

    const cleaned: TrackingParams = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string" && value.trim() && isTrackingKey(key)) {
        cleaned[key] = value.trim();
      }
    }
    return cleaned;
  } catch {
    return {};
  }
}

function storeTracking(params: TrackingParams) {
  if (typeof window === "undefined") return;
  if (Object.keys(params).length === 0) return;
  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Capture UTMs (+ c) from the current URL (passed by the GradRight iframe)
 * and keep them for the rest of the session so download links stay attributed.
 */
export function captureTrackingFromLocation(
  search: string = typeof window !== "undefined" ? window.location.search : "",
): TrackingParams {
  const fromUrl = pickTrackingParams(new URLSearchParams(search));
  if (Object.keys(fromUrl).length > 0) {
    storeTracking(fromUrl);
    return fromUrl;
  }
  return readStoredTracking();
}

/** Resolved tracking: URL/session first. Only includes keys that actually arrived. */
export function getTrackingParams(): TrackingParams {
  const captured = captureTrackingFromLocation();
  if (Object.keys(captured).length === 0) {
    return { ...DEFAULT_APP_STORE_TRACKING };
  }
  return captured;
}

/** App download URL with the same tracking params the user arrived with. */
export function getAppStoreUrl(tracking: TrackingParams = getTrackingParams()): string {
  const url = new URL(APP_STORE_BASE_URL);
  for (const [key, value] of Object.entries(tracking)) {
    if (value?.trim()) url.searchParams.set(key, value.trim());
  }
  return url.toString();
}
