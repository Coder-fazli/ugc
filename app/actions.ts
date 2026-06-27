"use server";

import { google } from "googleapis";

const HEADERS = [
  "Timestamp",
  "Ad Soyad",
  "Yaş",
  "Cins",
  "Kateqoriya",
  "Instagram",
  "TikTok",
  "Telefon",
  "WhatsApp",
  "Email",
];

export type SubmitResult = { ok: boolean; error?: string };

function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function submitCreator(formData: FormData): Promise<SubmitResult> {
  const get = (key: string) => (formData.get(key) ?? "").toString().trim();

  const ad = get("ad");
  const telefon = get("telefon");
  const email = get("email");

  // If the "this number has WhatsApp" box is checked, the checkbox is present
  // and WhatsApp == the phone number. Otherwise use the separate field.
  const sameWhatsapp = formData.get("has_whatsapp") !== null;
  const whatsapp = sameWhatsapp ? telefon : get("whatsapp");

  // Minimal server-side validation (the browser also enforces `required`).
  if (!ad || !telefon || !email) {
    return { ok: false, error: "Zəruri sahələri doldurun." };
  }

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    return { ok: false, error: "Server konfiqurasiyası tamamlanmayıb." };
  }

  try {
    const sheets = getSheetsClient();

    // Find the first tab's name so we don't hard-code "Sheet1".
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const tab = meta.data.sheets?.[0]?.properties?.title ?? "Sheet1";

    // Write a header row once, if the sheet is empty.
    const firstRow = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tab}!A1:J1`,
    });
    if (!firstRow.data.values || firstRow.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${tab}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [HEADERS] },
      });
    }

    const row = [
      new Date().toISOString(),
      ad,
      get("yas"),
      get("cins"),
      get("kateqoriya"),
      get("ig"),
      get("tt"),
      telefon,
      whatsapp,
      email,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tab}!A:J`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    return { ok: true };
  } catch (err) {
    console.error("submitCreator failed:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Göndərilmədi. Bir az sonra yenidən cəhd edin." };
  }
}
