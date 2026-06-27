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

function getPrivateKey(): string | undefined {
  // base64 form is safest — no newlines/backslashes for a host to mangle.
  const b64 = process.env.GOOGLE_PRIVATE_KEY_BASE64;
  if (b64) return Buffer.from(b64, "base64").toString("utf8");

  let key = process.env.GOOGLE_PRIVATE_KEY;
  if (!key) return undefined;
  key = key.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n");
}

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = getPrivateKey();

  // Prefer inline env-var credentials (works on any host, e.g. Hostinger /
  // Vercel). Fall back to a local key file for development.
  const auth = new google.auth.GoogleAuth({
    ...(email && key
      ? { credentials: { client_email: email, private_key: key } }
      : { keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS }),
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
    const msg = err instanceof Error ? err.message : String(err);
    console.error("submitCreator failed:", msg);
    // TEMP DEBUG: surface the real reason so we can diagnose on the host.
    const mode =
      process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
        ? "inline"
        : process.env.GOOGLE_APPLICATION_CREDENTIALS
          ? "keyfile"
          : "none";
    const sheet = process.env.GOOGLE_SHEET_ID ? "yes" : "no";
    return { ok: false, error: `Göndərilmədi. [dbg mode=${mode} sheet=${sheet}] ${msg}` };
  }
}
