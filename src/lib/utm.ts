const UTM_STORAGE_KEY = "bad-advice-utm";

/** Params we forward from GradRight → app → download links */
const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "c",
] as const;

export type TrackingParams = Partial<
  Record<(typeof TRACKING_KEYS)[number], string>
>;

/** Fallback when the page is opened with no UTMs (direct / no WordPress pass-through) */
export const DEFAULT_APP_STORE_TRACKING: TrackingParams = {
  utm_source: "LP",
  utm_medium: "Bad_Advice_2026",
  utm_campaign: "Bad_Advice_Event",
  c: "gbRSz",
};

export const APP_STORE_BASE_URL = "https://link.gradright.com/";

function pickTrackingParams(source: URLSearchParams): TrackingParams {
  const picked: TrackingParams = {};
  for (const key of TRACKING_KEYS) {
    const value = source.get(key)?.trim();
    if (value) picked[key] = value;
  }
  return picked;
}

function readStoredTracking(): TrackingParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as TrackingParams;
    return typeof parsed === "object" && parsed ? parsed : {};
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
 * Capture UTMs from the current URL (passed by the GradRight iframe) and keep
 * them for the rest of the session so download links stay attributed.
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

/** Resolved tracking: URL/session first, then defaults for any missing keys. */
export function getTrackingParams(): TrackingParams {
  const captured = captureTrackingFromLocation();
  return { ...DEFAULT_APP_STORE_TRACKING, ...captured };
}

/** App download URL with the same UTMs the user arrived with. */
export function getAppStoreUrl(tracking: TrackingParams = getTrackingParams()): string {
  const url = new URL(APP_STORE_BASE_URL);
  for (const key of TRACKING_KEYS) {
    const value = tracking[key];
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}
