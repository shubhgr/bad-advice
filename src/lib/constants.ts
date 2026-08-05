import {
  APP_STORE_BASE_URL,
  DEFAULT_APP_STORE_TRACKING,
  getAppStoreUrl,
} from "@/lib/utm";

/** Static fallback URL (server / first paint). Prefer useAppStoreUrl() in client CTAs. */
export const APP_STORE_URL = getAppStoreUrl(DEFAULT_APP_STORE_TRACKING);

export { APP_STORE_BASE_URL, DEFAULT_APP_STORE_TRACKING };

export const SIGNUP_URL =
  "https://gradright.com/get-bad-advice/?showSignUp=1";
