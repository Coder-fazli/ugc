import { NextResponse } from "next/server";
import { google } from "googleapis";

// Always run on the Node runtime and never cache this endpoint.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function getPrivateKey(): string | undefined {
  // Accept the key from either env var, in base64 or raw PEM form.
  let key = process.env.GOOGLE_PRIVATE_KEY_BASE64 || process.env.GOOGLE_PRIVATE_KEY;
  if (!key) return undefined;

  key = key.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }

  if (!key.includes("-----BEGIN")) {
    try {
      const decoded = Buffer.from(key, "base64").toString("utf8");
      if (decoded.includes("-----BEGIN")) return decoded;
    } catch {
      /* fall through */
    }
  }

  return key.replace(/\\n/g, "\n");
}

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = getPrivateKey();

  const auth = new google.auth.GoogleAuth({
    ...(email && key
      ? { credentials: { client_email: email, private_key: key } }
      : { keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS }),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const get = (key: string) => (form.get(key) ?? "").toString().trim();

    const ad = get("ad");
    const telefon = get("telefon");
    const email = get("email");

    if (!ad || !telefon || !email) {
      return NextResponse.json({ ok: false, error: "Zəruri sahələri doldurun." });
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ ok: false, error: "Server konfiqurasiyası tamamlanmayıb." });
    }

    const sameWhatsapp = form.get("has_whatsapp") !== null;
    const whatsapp = sameWhatsapp ? telefon : get("whatsapp");

    const sheets = getSheetsClient();

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const tab = meta.data.sheets?.[0]?.properties?.title ?? "Sheet1";

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

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("submit failed:", msg);
    return NextResponse.json({ ok: false, error: "Göndərilmədi. Bir az sonra yenidən cəhd edin." });
  }
}
