export type DownloadClickRow = {
  timestamp: string;
  page: string;
  button: string;
  name: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  downloadUrl: string;
  userAgent: string;
  referrer: string;
};

export function isGoogleSheetsConfigured(): boolean {
  return Boolean(process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim());
}

/**
 * Sends click data to a Google Apps Script web app bound to the sheet.
 * No Google Cloud / service account needed.
 */
export async function appendDownloadClickRow(row: DownloadClickRow): Promise<void> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    throw new Error("Google Sheets webhook is not configured");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      timestamp: row.timestamp,
      location: row.page,
      button: row.button,
      name: row.name,
      utm_source: row.utmSource,
      utm_medium: row.utmMedium,
      utm_campaign: row.utmCampaign,
      utm_term: row.utmTerm,
      utm_content: row.utmContent,
      href: row.downloadUrl,
      user_agent: row.userAgent,
      referrer: row.referrer,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Sheets webhook failed: ${response.status}`);
  }
}
