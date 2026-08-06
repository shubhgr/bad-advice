/**
 * Google Apps Script — paste into Extensions → Apps Script on your sheet.
 * Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the web app URL into GOOGLE_SHEETS_WEBHOOK_URL
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    const data = JSON.parse(e.postData.contents);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Page",
        "Button",
        "Name",
        "UTM Source",
        "UTM Medium",
        "UTM Campaign",
        "UTM Term",
        "UTM Content",
        "Download URL",
        "User Agent",
        "Referrer",
      ]);
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.location || "",
      data.button || "",
      data.name || "",
      data.utm_source || "",
      data.utm_medium || "",
      data.utm_campaign || "",
      data.utm_term || "",
      data.utm_content || "",
      data.href || "",
      data.user_agent || "",
      data.referrer || "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(error) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
