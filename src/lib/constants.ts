const APP_STORE_BASE_URL = "https://support.gradright.com/redirect-to-store";

export const APP_STORE_UTM = {
  source: "bad-advice",
  campaign: "event-2026-july",
  medium: "web",
} as const;

export const APP_STORE_URL = `${APP_STORE_BASE_URL}?${new URLSearchParams({
  utm_source: APP_STORE_UTM.source,
  utm_medium: APP_STORE_UTM.medium,
  utm_campaign: APP_STORE_UTM.campaign,
}).toString()}`;

export const SIGNUP_URL =
  "https://gradright.com/get-bad-advice/?showSignUp=1";
