"use client";

import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { submitCreator } from "./actions";

/**
 * Tiny helper: turns a plain CSS string ("color:red;font-size:14px;")
 * into the style object React expects. Lets us keep the original design's
 * inline styles almost verbatim.
 */
function css(input: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of input.split(";")) {
    const i = decl.indexOf(":");
    if (i === -1) continue;
    const rawProp = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    if (!rawProp) continue;
    const prop = rawProp.startsWith("--")
      ? rawProp
      : rawProp.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[prop] = value;
  }
  return out as CSSProperties;
}

const CONTACT_EMAIL = "salam@ugc.az";

const MARQ_TEXT = "MADE BY PEOPLE. BUILT FOR BRANDS.";
const TEXT_COLORS = ["#f4e809", "#b1e005", "#fff", "#6d18ff"];
const DOT_COLORS = ["#6d18ff", "#f4e809", "#b1e005", "#fff"];

const LABEL =
  "display:block;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#111;margin-bottom:8px;";
const FIELD =
  "width:100%;box-sizing:border-box;padding:15px 16px;border:2px solid #111;border-radius:0;background:#fff;font-family:inherit;font-size:16px;font-weight:500;color:#111;outline:none;";

const CATEGORIES = [
  "Moda & Stil",
  "Gözəllik & Baxım",
  "Yemək & İçki",
  "Səyahət",
  "Fitnes & İdman",
  "Texnologiya",
  "Lifestyle",
  "Valideynlik & Uşaq",
  "Oyun",
  "Avtomobil",
  "Digər",
];

export default function Home() {
  const [screen, setScreen] = useState<"home" | "creator">("home");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goCreator = () => {
    setScreen("creator");
    setSubmitted(false);
    setError(null);
    window.scrollTo(0, 0);
  };
  const goHome = () => {
    setScreen("home");
    setSubmitted(false);
    setError(null);
    window.scrollTo(0, 0);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await submitCreator(fd);
    setLoading(false);
    if (res.ok) {
      setSubmitted(true);
      window.scrollTo(0, 0);
    } else {
      setError(res.error ?? "Xəta baş verdi.");
    }
  };

  const mailHref =
    "https://mail.google.com/mail/?view=cm&fs=1&to=" +
    encodeURIComponent(CONTACT_EMAIL) +
    "&su=" +
    encodeURIComponent("UGC axtarıram") +
    "&body=" +
    encodeURIComponent('Mən "Brendinizin adı" üçün "sizin say" UGC istəyirəm.');

  // ---------------- HOME SCREEN ----------------
  if (screen === "home") {
    return (
      <div style={css("height:100vh;width:100%;display:flex;flex-direction:column;background:#000;overflow:hidden;")}>
        {/* top kinetic marquee */}
        <div style={css("height:48px;flex:none;background:#000;border-bottom:2px solid #1a1a1a;overflow:hidden;display:flex;align-items:center;white-space:nowrap;position:relative;z-index:5;")}>
          <div style={css("display:inline-flex;align-items:center;animation:ugcmarq 26s linear infinite;will-change:transform;")}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} style={{ display: "contents" }}>
                <span className="ugc-marq" style={css(`font-size:14px;font-weight:800;letter-spacing:.18em;color:${TEXT_COLORS[i % 4]};padding:0 22px;`)}>
                  {MARQ_TEXT}
                </span>
                <span style={css(`color:${DOT_COLORS[i % 4]};font-size:14px;`)}>●</span>
              </span>
            ))}
          </div>
        </div>

        {/* split stage */}
        <div className="ugc-split" style={css("flex:1;display:flex;position:relative;min-height:0;")}>
          {/* LEFT : become a creator */}
          <div className="ugc-panel" style={css("flex:1;position:relative;overflow:hidden;background:#b1e005;color:#0a0a0a;")}>
            <div className="ugc-pc" style={css("position:absolute;top:15%;bottom:15%;left:0;right:0;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;padding:0 7vw;")}>
              <div className="ugc-kick" style={css("font-size:14px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;background:#0a0a0a;color:#b1e005;padding:7px 14px;")}>
                Kreatorlar üçün
              </div>
              <div style={css("display:flex;flex-direction:column;align-items:flex-start;gap:20px;")}>
                <h2 style={css("font-size:clamp(32px,3.9vw,58px);line-height:1.02;font-weight:800;letter-spacing:-.01em;max-width:10ch;min-height:3.06em;display:flex;align-items:flex-end;")}>
                  UGC OLMAQ İSTƏYİRƏM
                </h2>
                <p style={css("font-size:clamp(15px,1.15vw,19px);font-weight:500;max-width:30ch;opacity:.85;line-height:1.4;")}>
                  Profilini yarat, brendlərlə işlə və məzmununla qazan.
                </p>
              </div>
              <span className="ugc-cta" onClick={goCreator} style={css("display:inline-flex;align-items:center;gap:12px;background:#0a0a0a;color:#fff;font-size:16px;font-weight:800;letter-spacing:.02em;padding:16px 26px;cursor:pointer;box-shadow:5px 5px 0 rgba(0,0,0,.25);")}>
                Müraciət et<span style={css("font-size:20px;")}>→</span>
              </span>
            </div>
          </div>

          {/* RIGHT : looking for UGC (mailto) */}
          <div className="ugc-panel" style={css("flex:1;position:relative;overflow:hidden;background:#6d18ff;color:#fff;")}>
            <div className="ugc-pc" style={css("position:absolute;top:15%;bottom:15%;left:0;right:0;display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;padding:0 7vw;text-align:right;")}>
              <div className="ugc-kick" style={css("font-size:14px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;background:#f4e809;color:#0a0a0a;padding:7px 14px;")}>
                Brendlər üçün
              </div>
              <div style={css("display:flex;flex-direction:column;align-items:flex-end;gap:20px;")}>
                <h2 style={css("font-size:clamp(32px,3.9vw,58px);line-height:1.02;font-weight:800;letter-spacing:-.01em;text-transform:uppercase;max-width:10ch;min-height:3.06em;display:flex;align-items:flex-end;justify-content:flex-end;")}>
                  MARKAMA
                  <br />
                  UGC axtarıram
                </h2>
                <p style={css("font-size:clamp(15px,1.15vw,19px);font-weight:500;max-width:30ch;opacity:.85;line-height:1.4;")}>
                  Bizə yaz, kampaniyan üçün doğru kreatoru tapaq.
                </p>
              </div>
              <a href={mailHref} target="_blank" rel="noopener" className="ugc-cta" style={css("display:inline-flex;align-items:center;gap:12px;background:#f4e809;color:#0a0a0a;text-decoration:none;cursor:pointer;font-size:16px;font-weight:800;letter-spacing:.02em;padding:16px 26px;box-shadow:5px 5px 0 rgba(0,0,0,.35);")}>
                Bizə yazın<span style={css("font-size:20px;")}>→</span>
              </a>
            </div>
          </div>

          {/* center logo wordmark */}
          <div className="ugc-logo-c" onClick={goHome} style={css("position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:4;pointer-events:auto;cursor:pointer;display:flex;align-items:center;justify-content:center;")}>
            <div style={css("background:#0a0a0a;color:#fff;font-weight:900;font-size:clamp(30px,4vw,48px);letter-spacing:-.04em;padding:clamp(12px,1.6vw,18px) clamp(20px,2.6vw,30px);border-radius:16px;box-shadow:4px 4px 0 rgba(0,0,0,.35);")}>
              UGC
            </div>
          </div>
        </div>

        {/* footer */}
        <div style={css("flex:none;background:#000;border-top:2px solid #1a1a1a;padding:18px 24px;display:flex;flex-direction:column;align-items:center;gap:12px;position:relative;z-index:5;")}>
          <div style={css("font-size:12.5px;font-weight:600;letter-spacing:.04em;color:#8a8a8a;")}>
            Bütün hüquqlar qorunur © 2026
          </div>
          <div style={css("display:flex;gap:12px;")}>
            <a href="https://www.linkedin.com/company/ugc-az" target="_blank" rel="noopener" aria-label="LinkedIn" className="ugc-soc ugc-soc-in" style={css("width:40px;height:40px;border-radius:50%;border:1.5px solid #333;display:flex;align-items:center;justify-content:center;color:#fff;")}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 9h4v12H3zm6 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.3c0-1.26-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H9z" /></svg>
            </a>
            <a href="https://www.instagram.com/ugc.az" target="_blank" rel="noopener" aria-label="Instagram" className="ugc-soc ugc-soc-ig" style={css("width:40px;height:40px;border-radius:50%;border:1.5px solid #333;display:flex;align-items:center;justify-content:center;color:#fff;")}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="https://www.tiktok.com/@ugc.az" target="_blank" rel="noopener" aria-label="TikTok" className="ugc-soc ugc-soc-tt" style={css("width:40px;height:40px;border-radius:50%;border:1.5px solid #333;display:flex;align-items:center;justify-content:center;color:#fff;")}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.3 2.1 1.6 3.6 3.7 3.8V9c-1.4.1-2.7-.3-3.7-1v6.7c0 3.4-2.8 5.8-5.9 5.3-2.6-.4-4.3-2.9-3.8-5.5.4-2.2 2.4-3.8 4.7-3.6v2.5c-.3-.1-.7-.2-1-.1-1.3.1-2.2 1.3-2 2.6.2 1.2 1.4 2 2.6 1.7 1-.2 1.7-1.1 1.7-2.2V3z" /></svg>
            </a>
          </div>
          <div style={css("display:inline-flex;align-items:center;gap:9px;margin-top:4px;opacity:.85;")}>
            <span style={css("font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#5a5a5a;")}>Powered by</span>
            <span style={css("font-size:12px;font-weight:800;letter-spacing:.04em;color:#9a9a9a;")}>LVETICA</span>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- CREATOR SCREEN ----------------
  return (
    <div style={css("min-height:100vh;background:#f3f2ec;color:#111;display:flex;flex-direction:column;")}>
      {/* header */}
      <div style={css("flex:none;background:#000;display:flex;align-items:center;justify-content:space-between;padding:16px 24px;position:sticky;top:0;z-index:10;")}>
        <button className="ugc-back" onClick={goHome} style={css("display:inline-flex;align-items:center;gap:8px;background:none;border:none;color:#fff;font-family:inherit;font-size:14px;font-weight:700;letter-spacing:.02em;cursor:pointer;padding:8px 6px;")}>
          <span style={css("font-size:18px;")}>←</span>Geri
        </button>
        <div style={css("display:flex;align-items:flex-end;")}>
          <span style={css("font-size:26px;font-weight:900;letter-spacing:-.05em;color:#fff;line-height:1;text-shadow:2px 2px 0 #000,4px 4px 0 #000;")}>UGC</span>
        </div>
        <div style={css("width:64px;")} />
      </div>

      {submitted ? (
        /* success */
        <div style={css("flex:1;display:flex;align-items:center;justify-content:center;padding:40px 24px;")}>
          <div style={css("width:100%;max-width:520px;text-align:center;animation:ugcup .5s ease both;")}>
            <div style={css("width:96px;height:96px;border-radius:50%;background:#b1e005;display:flex;align-items:center;justify-content:center;margin:0 auto 28px;box-shadow:6px 6px 0 #0a0a0a;")}>
              <span style={css("font-size:46px;font-weight:900;color:#0a0a0a;")}>✓</span>
            </div>
            <h1 style={css("font-size:clamp(30px,5vw,44px);line-height:1;font-weight:900;letter-spacing:-.03em;text-transform:uppercase;margin-bottom:16px;")}>
              Müraciətin alındı
            </h1>
            <p style={css("font-size:17px;font-weight:500;color:#555;line-height:1.5;margin-bottom:32px;")}>
              Təşəkkürlər! Müraciətin bizə çatdı. Komandamız tezliklə səninlə əlaqə saxlayacaq.
            </p>
            <button onClick={goHome} style={css("display:inline-flex;align-items:center;gap:10px;background:#0a0a0a;color:#fff;font-family:inherit;font-size:16px;font-weight:800;padding:16px 30px;border:none;cursor:pointer;box-shadow:5px 5px 0 #6d18ff;")}>
              Ana səhifəyə qayıt
            </button>
          </div>
        </div>
      ) : (
        /* form */
        <div className="ugc-formwrap" style={css("flex:1;display:flex;justify-content:center;padding:48px 24px 80px;")}>
          <div style={css("width:100%;max-width:680px;animation:ugcup .5s ease both;")}>
            <div style={css("position:relative;overflow:hidden;margin-bottom:22px;padding:30px 32px 34px;background:#ebe9e1;")}>
              <div aria-hidden="true" style={css("position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;")}>
                <div style={css("position:absolute;right:-70px;top:-78px;width:214px;height:214px;border-radius:50%;border:30px solid #6d18ff;opacity:.15;animation:ugcdrift 13s ease-in-out infinite;")} />
                <div style={css("position:absolute;left:-30px;bottom:-34px;width:104px;height:104px;border-radius:50%;background:#b1e005;opacity:.40;animation:ugcdrift2 16s ease-in-out infinite;")} />
                <div style={css("position:absolute;right:30%;bottom:18px;width:26px;height:26px;border-radius:50%;background:#f4e809;opacity:.65;animation:ugcdrift 10s ease-in-out infinite reverse;")} />
              </div>
              <div style={css("position:relative;z-index:1;font-size:13px;font-weight:800;letter-spacing:.2em;background:#0a0a0a;color:#b1e005;display:inline-block;padding:6px 12px;margin-bottom:20px;")}>
                KREATOR QEYDİYYATI
              </div>
              <h1 className="ugc-fh1" style={css("position:relative;z-index:1;font-size:clamp(38px,6.4vw,64px);line-height:.94;font-weight:800;letter-spacing:-.025em;margin-bottom:0;")}>
                <span style={css("display:block;color:#6d18ff;margin-bottom:4px;")}>UGC</span>
                <span style={css("display:block;color:#0a0a0a;")}>
                  OLMAQ{" "}
                  <span style={css("position:relative;display:inline-block;z-index:0;")}>
                    İSTƏYİRƏM
                    <span style={css("position:absolute;left:-3px;right:-3px;bottom:.05em;height:.30em;background:#b1e005;z-index:-1;")} />
                  </span>
                </span>
              </h1>
            </div>

            <p style={css("font-size:17px;font-weight:500;color:#555;max-width:46ch;line-height:1.5;margin-bottom:36px;")}>
              Aşağıdakı məlumatları doldur. Komandamız profilini nəzərdən keçirib səninlə əlaqə saxlayacaq.
            </p>

            <form onSubmit={onSubmit} className="ugc-form" style={css("background:#fff;border:2px solid #111;box-shadow:10px 10px 0 #6d18ff;padding:clamp(24px,4vw,40px);")}>
              <div style={css("margin-bottom:22px;")}>
                <label style={css(LABEL)}>Ad, Soyad</label>
                <input name="ad" type="text" required placeholder="Aysel Məmmədova" className="ugc-input" style={css(FIELD)} />
              </div>

              <div className="ugc-grid2" style={css("display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:22px;")}>
                <div>
                  <label style={css(LABEL)}>Yaş</label>
                  <input name="yas" type="number" min={13} max={99} required placeholder="24" className="ugc-input" style={css(FIELD)} />
                </div>
                <div>
                  <label style={css(LABEL)}>Cins</label>
                  <select name="cins" required defaultValue="" className="ugc-input" style={css(FIELD + "appearance:none;cursor:pointer;")}>
                    <option value="" disabled>Seçin</option>
                    <option value="Qadın">Qadın</option>
                    <option value="Kişi">Kişi</option>
                    <option value="Digər">Digər</option>
                  </select>
                </div>
              </div>

              <div style={css("margin-bottom:22px;")}>
                <label style={css(LABEL)}>Kateqoriya</label>
                <select name="kateqoriya" required defaultValue="" className="ugc-input" style={css(FIELD + "appearance:none;cursor:pointer;")}>
                  <option value="" disabled>Sahəni seçin</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="ugc-grid2" style={css("display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:22px;")}>
                <div>
                  <label style={css(LABEL)}>Instagram</label>
                  <input name="ig" type="text" placeholder="@hesab" className="ugc-input" style={css(FIELD)} />
                </div>
                <div>
                  <label style={css(LABEL)}>TikTok</label>
                  <input name="tt" type="text" placeholder="@hesab" className="ugc-input" style={css(FIELD)} />
                </div>
              </div>

              <div style={css("margin-bottom:22px;")}>
                <label style={css(LABEL)}>Telefon nömrəsi</label>
                <input name="telefon" type="tel" required placeholder="+994 50 000 00 00" className="ugc-input" style={css(FIELD)} />
              </div>

              <div style={css("margin-bottom:32px;")}>
                <label style={css(LABEL)}>E-poçt</label>
                <input name="email" type="email" required placeholder="ad@mail.com" className="ugc-input" style={css(FIELD)} />
              </div>

              {error && (
                <div style={css("margin-bottom:18px;color:#b00020;font-size:14px;font-weight:600;")}>{error}</div>
              )}

              <button type="submit" disabled={loading} className="ugc-submit" style={css("width:100%;display:inline-flex;align-items:center;justify-content:center;gap:12px;background:#0a0a0a;color:#fff;font-family:inherit;font-size:17px;font-weight:800;letter-spacing:.02em;padding:18px;border:none;cursor:" + (loading ? "default" : "pointer") + ";box-shadow:6px 6px 0 #b1e005;" + (loading ? "opacity:.7;" : ""))}>
                {loading ? "Göndərilir..." : "Müraciəti göndər"}
                {!loading && <span style={css("font-size:20px;")}>→</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
