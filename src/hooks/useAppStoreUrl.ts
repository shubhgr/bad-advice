"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_APP_STORE_TRACKING,
  getAppStoreUrl,
  getTrackingParams,
} from "@/lib/utm";

/**
 * App download URL that carries UTMs from the GradRight landing URL
 * (via iframe query string) for the whole session.
 */
export function useAppStoreUrl(): string {
  const [url, setUrl] = useState(() => getAppStoreUrl(DEFAULT_APP_STORE_TRACKING));

  useEffect(() => {
    setUrl(getAppStoreUrl(getTrackingParams()));
  }, []);

  return url;
}
