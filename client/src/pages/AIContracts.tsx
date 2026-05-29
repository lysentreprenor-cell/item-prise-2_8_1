import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Sparkles, ChevronRight, Copy, Share2,
  FileText, ToggleLeft, ToggleRight, CheckCircle2, Loader2,
  Wand2, Shield,
} from "lucide-react";
import { useAppStore, CURRENCY_SYMBOLS, formatMoney } from "@/lib/store";

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = "describe" | "details" | "generating" | "preview";
type DepositMode = "none" | "partial" | "full";

interface FormData {
  description: string;
  partyA: string;
  partyB: string;
  amount: string;
  currency: string;
  deadline: string;
  depositMode: DepositMode;
  depositAmount: string;
  category: string;
}

// ── Contract generator (client-side template engine) ──────────────────────────
const CONTRACT_TEMPLATES: Record<string, string> = {
  usługa:   "Umowa o świadczenie usług",
  wynajem:  "Umowa najmu",
  sprzedaż: "Umowa sprzedaży",
  pożyczka: "Umowa pożyczki",
  remont:   "Umowa o roboty budowlane",
  korepetycje: "Umowa o udzielanie korepetycji",
  opieka:   "Umowa opieki",
  inne:     "Umowa cywilnoprawna",
};

const CATEGORY_CHIPS = [
  { id: "usługa",      label: "Usługa",       icon: "🔧" },
  { id: "wynajem",     label: "Wynajem",       icon: "🏠" },
  { id: "sprzedaż",    label: "Sprzedaż",      icon: "🛒" },
  { id: "korepetycje", label: "Korepetycje",   icon: "📚" },
  { id: "remont",      label: "Remont",        icon: "🏗️" },
  { id: "opieka",      label: "Opieka",        icon: "🤝" },
  { id: "pożyczka",    label: "Pożyczka",      icon: "💸" },
  { id: "inne",        label: "Inne",          icon: "📄" },
];

function buildContract(data: FormData): string {
  const title = CONTRACT_TEMPLATES[data.category] || "Umowa cywilnoprawna";
  const today = new Date().toLocaleDateString("pl-PL");
  const sym = CURRENCY_SYMBOLS[data.currency as keyof typeof CURRENCY_SYMBOLS] || data.currency;
  const amt = data.amount ? `${parseFloat(data.amount).toFixed(2)} ${sym}` : "(kwota do ustalenia)";
  const depositLine = data.depositMode !== "none"
    ? `\nWynagrodzenie płatne w dwóch transzach:\n  - Zaliczka/depozyt: ${parseFloat(data.depositAmount || "0").toFixed(2)} ${sym} — przed przystąpieniem do pracy\n  - Pozostała kwota: ${(parseFloat(data.amount || "0") - parseFloat(data.depositAmount || "0")).toFixed(2)} ${sym} — po zakończeniu`
    : `\nWynagrodzenie: ${amt} — płatne po zakończeniu prac`;

  return `${title.toUpperCase()}

Zawarta w dniu ${today} pomiędzy:

STRONĄ A (Zleceniodawca):
${data.partyA || "___________________"}

a

STRONĄ B (Zleceniobiorca/Wykonawca):
${data.partyB || "___________________"}

§ 1. PRZEDMIOT UMOWY
-----------------------------------------------
${data.description || "Strony ustalają wykonanie usługi zgodnie z ustaleniami pomiędzy stronami."}

§ 2. TERMIN REALIZACJI
-----------------------------------------------
Strona B zobowiązuje się do realizacji przedmiotu umowy w terminie do dnia:
${data.deadline || "___________________"}

§ 3. WYNAGRODZENIE
-----------------------------------------------
Całkowita wartość umowy: ${amt}
${depositLine}

Preferowana forma płatności: przelew bankowy / gotówka (do uzgodnienia).

§ 4. OBOWIĄZKI STRON
-----------------------------------------------
Strona A zobowiązuje się do:
  a) udostępnienia niezbędnych informacji i materiałów,
  b) terminowej zapłaty wynagrodzenia,
  c) współdziałania przy realizacji umowy.

Strona B zobowiązuje się do:
  a) wykonania prac z należytą starannością,
  b) informowania Strony A o postępach,
  c) usunięcia usterek stwierdzonych w terminie 14 dni od zakończenia.

§ 5. ODPOWIEDZIALNOŚĆ
-----------------------------------------------
W przypadku niewykonania lub nienależytego wykonania umowy z winy Strony B, Strona A ma prawo żądać odszkodowania w wysokości rzeczywistej poniesionej szkody, nie więcej niż wartość umowy.

§ 6. ODSTĄPIENIE OD UMOWY
-----------------------------------------------
Każda ze stron może odstąpić od umowy za pisemnym (lub wiadomość tekstową) powiadomieniem drugiej strony z zachowaniem 7-dniowego okresu wypowiedzenia. W przypadku odstąpienia przez Stronę A po rozpoczęciu prac, Strona B zachowuje prawo do wynagrodzenia proporcjonalnego do wykonanej części.

§ 7. POSTANOWIENIA KOŃCOWE
-----------------------------------------------
  1. Umowę sporządzono w formie elektronicznej.
  2. W sprawach nieuregulowanych niniejszą umową zastosowanie mają przepisy Kodeksu Cywilnego.
  3. Wszelkie zmiany umowy wymagają pisemnej (lub elektronicznej) zgody obu stron.
  4. Sądem właściwym do rozstrzygania sporów jest sąd miejsca zamieszkania pozwanego.

Podpisy stron:

Strona A: _______________________     Strona B: _______________________
          ${data.partyA || "...................."}                         ${data.partyB || "...................."}

--- Wygenerowano przez Finlys Umowy AI ---`;
}

// ── Palette ───────────────────────────────────────────────────────────────────
const G = {
  bg:      "#0a0f0c",
  card:    "rgba(255,255,255,0.04)",
  border:  "rgba(52,211,153,0.18)",
  green:   "#34d399",
  greenDim:"rgba(52,211,153,0.12)",
  glow:    "rgba(52,211,153,0.22)",
  text:    "#e2faf2",
  muted:   "rgba(255,255,255,0.45)",
};

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: done ? G.green : active ? G.greenDim : "rgba(255,255,255,0.06)",
        border: `1.5px solid ${done || active ? G.green : "rgba(255,255,255,0.12)"}`,
        transition: "all 0.3s ease",
        boxShadow: active ? `0 0 14px ${G.glow}` : "none",
      }}>
        {done
          ? <CheckCircle2 size={14} color="#0a0f0c" strokeWidth={2.5} />
          : <span style={{ fontSize: 11, fontWeight: 700, color: active ? G.green : G.muted }}>{label}</span>}
      </div>
    </div>
  );
}

function StepLine({ done }: { done: boolean }) {
  return (
    <div style={{
      flex: 1, height: 1.5, marginBottom: 14,
      background: done ? G.green : "rgba(255,255,255,0.08)",
      transition: "background 0.4s ease",
    }} />
  );
}

// ── Typewriter effect ─────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 8) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed("");
    setDone(false);
    const interval = setInterval(() => {
      if (idx.current >= text.length) {
        clearInterval(interval);
        setDone(true);
        return;
      }
      const chunk = Math.min(speed, text.length - idx.current);
      setDisplayed(prev => prev + text.slice(idx.current, idx.current + chunk));
      idx.current += chunk;
    }, 16);
    return () => clearInterval(interval);
  }, [text]);

  return { displayed, done };
}

// ── Step 1 — Describe ─────────────────────────────────────────────────────────
function StepDescribe({
  data, setData, onNext,
}: { data: FormData; setData: (d: FormData) => void; onNext: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20, padding: "0 20px 24px" }}>
      <div>
        <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.6 }}>
          Opisz swoją sytuację — AI dopasuje typ umowy, klauzule i warunki.
        </p>
      </div>

      {/* Category chips */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: G.muted, marginBottom: 10, textTransform: "uppercase" }}>
          Rodzaj umowy
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CATEGORY_CHIPS.map(c => (
            <button
              key={c.id}
              onClick={() => setData({ ...data, category: c.id })}
              style={{
                padding: "7px 14px", borderRadius: 999, cursor: "pointer",
                fontSize: 13, fontWeight: 600,
                background: data.category === c.id ? G.greenDim : "rgba(255,255,255,0.05)",
                border: `1px solid ${data.category === c.id ? G.green : "rgba(255,255,255,0.10)"}`,
                color: data.category === c.id ? G.green : G.muted,
                transition: "all 0.2s ease",
              }}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description textarea */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: G.muted, marginBottom: 8, textTransform: "uppercase" }}>
          Opisz szczegóły
        </div>
        <textarea
          placeholder="np. Potrzebuję umowy z hydraulikiem — remont łazienki, 3 dni robocze, kwota ok. 2500 zł, materiały po jego stronie..."
          value={data.description}
          onChange={e => setData({ ...data, description: e.target.value })}
          style={{
            width: "100%", minHeight: 130, padding: "14px 16px",
            borderRadius: 16, border: `1px solid ${G.border}`,
            background: "rgba(52,211,153,0.04)",
            color: G.text, fontSize: 14, lineHeight: 1.6,
            resize: "vertical", outline: "none",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Suggested prompts */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          "Usługa sprzątania",
          "Pożyczka 3000 zł",
          "Wynajem pokoju",
          "Lekcje angielskiego",
        ].map(s => (
          <button
            key={s}
            onClick={() => setData({ ...data, description: s })}
            style={{
              padding: "6px 12px", borderRadius: 999, cursor: "pointer",
              fontSize: 12, fontWeight: 600,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: G.muted,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <button
        onClick={onNext}
        disabled={!data.description.trim()}
        style={{
          height: 54, borderRadius: 999, border: "none", cursor: data.description.trim() ? "pointer" : "not-allowed",
          fontSize: 15, fontWeight: 800, color: data.description.trim() ? "#0a0f0c" : G.muted,
          background: data.description.trim()
            ? "linear-gradient(135deg, #34d399 0%, #10b981 100%)"
            : "rgba(255,255,255,0.06)",
          boxShadow: data.description.trim() ? "0 4px 20px rgba(52,211,153,0.35)" : "none",
          transition: "all 0.25s ease",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        Dalej <ChevronRight size={18} />
      </button>
    </div>
  );
}

// ── Step 2 — Details ──────────────────────────────────────────────────────────
function StepDetails({
  data, setData, onNext, onBack,
}: { data: FormData; setData: (d: FormData) => void; onNext: () => void; onBack: () => void }) {
  const { enabledCurrencies, primaryCurrency } = useAppStore();
  const currencies = enabledCurrencies?.length ? enabledCurrencies : ["PLN"];

  const Input = ({
    label, value, onChange, placeholder, type = "text",
  }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; type?: string;
  }) => (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: G.muted, marginBottom: 8, textTransform: "uppercase" }}>
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", height: 48, padding: "0 16px", borderRadius: 14,
          border: `1px solid ${G.border}`, background: "rgba(52,211,153,0.04)",
          color: G.text, fontSize: 14, outline: "none", fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
    </div>
  );

  const depositModes: { id: DepositMode; label: string; desc: string }[] = [
    { id: "none",    label: "Bez depozytu",   desc: "Płatność po zakończeniu" },
    { id: "partial", label: "Zaliczka",       desc: "Część z góry, reszta na końcu" },
    { id: "full",    label: "Pełna góry",     desc: "100% przed rozpoczęciem" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, padding: "0 20px 24px" }}>
      <Input label="Strona A — Zleceniodawca (Ty)" value={data.partyA} onChange={v => setData({ ...data, partyA: v })} placeholder="Imię i nazwisko lub firma" />
      <Input label="Strona B — Wykonawca / Druga strona" value={data.partyB} onChange={v => setData({ ...data, partyB: v })} placeholder="Imię i nazwisko lub firma" />

      {/* Amount + currency */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: G.muted, marginBottom: 8, textTransform: "uppercase" }}>
          Kwota umowy
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="number"
            value={data.amount}
            onChange={e => setData({ ...data, amount: e.target.value })}
            placeholder="0.00"
            style={{
              flex: 1, height: 48, padding: "0 16px", borderRadius: 14,
              border: `1px solid ${G.border}`, background: "rgba(52,211,153,0.04)",
              color: G.text, fontSize: 14, outline: "none", fontFamily: "inherit",
            }}
          />
          <select
            value={data.currency}
            onChange={e => setData({ ...data, currency: e.target.value })}
            style={{
              height: 48, padding: "0 12px", borderRadius: 14,
              border: `1px solid ${G.border}`, background: "rgba(52,211,153,0.04)",
              color: G.text, fontSize: 13, fontWeight: 700, outline: "none", cursor: "pointer",
            }}
          >
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <Input label="Termin wykonania" value={data.deadline} onChange={v => setData({ ...data, deadline: v })} type="date" />

      {/* Deposit mode */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: G.muted, marginBottom: 10, textTransform: "uppercase" }}>
          Depozyt / zaliczka
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {depositModes.map(m => (
            <button
              key={m.id}
              onClick={() => setData({ ...data, depositMode: m.id })}
              style={{
                padding: "12px 16px", borderRadius: 14, cursor: "pointer", textAlign: "left",
                background: data.depositMode === m.id ? G.greenDim : "rgba(255,255,255,0.04)",
                border: `1px solid ${data.depositMode === m.id ? G.green : "rgba(255,255,255,0.08)"}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                transition: "all 0.2s ease",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: data.depositMode === m.id ? G.green : G.text }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>{m.desc}</div>
              </div>
              {data.depositMode === m.id
                ? <ToggleRight size={22} color={G.green} />
                : <ToggleLeft size={22} color={G.muted} />}
            </button>
          ))}
        </div>
      </div>

      {data.depositMode === "partial" && (
        <Input
          label="Kwota zaliczki / depozytu"
          value={data.depositAmount}
          onChange={v => setData({ ...data, depositAmount: v })}
          placeholder="0.00"
          type="number"
        />
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onBack}
          style={{
            flex: "0 0 auto", height: 54, padding: "0 20px", borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer",
            background: "rgba(255,255,255,0.05)", color: G.muted, fontSize: 14, fontWeight: 700,
          }}
        >
          ← Wróć
        </button>
        <button
          onClick={onNext}
          style={{
            flex: 1, height: 54, borderRadius: 999, border: "none", cursor: "pointer",
            fontSize: 15, fontWeight: 800, color: "#0a0f0c",
            background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
            boxShadow: "0 4px 20px rgba(52,211,153,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          Generuj <Wand2 size={18} />
        </button>
      </div>
    </div>
  );
}

// ── Step 3 — Generating ───────────────────────────────────────────────────────
function StepGenerating({ onDone }: { onDone: () => void }) {
  const steps = [
    "Analizuję opis umowy...",
    "Dobieranie właściwych klauzul...",
    "Generowanie treści prawnej...",
    "Sprawdzanie zgodności z KC...",
    "Finalizowanie dokumentu...",
  ];
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const total = 3000;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / total) * 100, 100);
      setProgress(pct);
      setCurrent(Math.min(Math.floor((pct / 100) * steps.length), steps.length - 1));
      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(onDone, 300);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 32, padding: "0 20px",
    }}>
      {/* Orbiting animation */}
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: `2px solid ${G.border}`,
          animation: "spin 3s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 12, borderRadius: "50%",
          border: `1.5px dashed rgba(52,211,153,0.3)`,
          animation: "spin 2s linear infinite reverse",
        }} />
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Sparkles size={36} color={G.green} />
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: G.text, marginBottom: 8 }}>
          Tworzę umowę
        </div>
        <div style={{ fontSize: 14, color: G.green, minHeight: 20, transition: "all 0.3s" }}>
          {steps[current]}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 260 }}>
        <div style={{
          height: 4, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 999,
            background: "linear-gradient(90deg, #34d399, #10b981)",
            width: `${progress}%`,
            transition: "width 0.1s linear",
            boxShadow: "0 0 8px rgba(52,211,153,0.5)",
          }} />
        </div>
        <div style={{ textAlign: "right", marginTop: 6, fontSize: 11, color: G.muted }}>
          {Math.round(progress)}%
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Step 4 — Preview ──────────────────────────────────────────────────────────
function StepPreview({
  data, contractText, onBack, onSave,
}: {
  data: FormData; contractText: string; onBack: () => void; onSave: () => void;
}) {
  const { displayed, done } = useTypewriter(contractText, 6);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(contractText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "Umowa AI — Finlys", text: contractText });
    } else {
      handleCopy();
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, padding: "0 20px 24px" }}>
      {/* Header badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
          borderRadius: 999, background: G.greenDim,
          border: `1px solid ${G.border}`,
        }}>
          {done
            ? <CheckCircle2 size={14} color={G.green} />
            : <Loader2 size={14} color={G.green} style={{ animation: "spin 1s linear infinite" }} />}
          <span style={{ fontSize: 12, fontWeight: 700, color: G.green }}>
            {done ? "Gotowe" : "Generowanie..."}
          </span>
        </div>
        <div style={{ fontSize: 12, color: G.muted }}>
          {CONTRACT_TEMPLATES[data.category] || "Umowa"}
        </div>
      </div>

      {/* Contract text */}
      <div style={{
        flex: 1, borderRadius: 20,
        border: `1px solid ${G.border}`,
        background: "rgba(52,211,153,0.03)",
        padding: "18px 16px",
        overflowY: "auto",
        maxHeight: "42vh",
      }}>
        <pre style={{
          margin: 0, fontSize: 11.5, lineHeight: 1.75,
          color: G.text, fontFamily: "ui-monospace, monospace",
          whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {displayed}
          {!done && <span style={{ color: G.green, animation: "blink 1s step-end infinite" }}>▋</span>}
        </pre>
      </div>

      {/* Action buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button
          onClick={handleCopy}
          style={{
            height: 46, borderRadius: 14, border: `1px solid ${G.border}`,
            background: "rgba(52,211,153,0.06)", cursor: "pointer",
            fontSize: 13, fontWeight: 700, color: copied ? G.green : G.text,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "all 0.2s ease",
          }}
        >
          <Copy size={15} /> {copied ? "Skopiowano!" : "Kopiuj"}
        </button>
        <button
          onClick={handleShare}
          style={{
            height: 46, borderRadius: 14, border: `1px solid ${G.border}`,
            background: "rgba(52,211,153,0.06)", cursor: "pointer",
            fontSize: 13, fontWeight: 700, color: G.text,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Share2 size={15} /> Udostępnij
        </button>
      </div>

      {/* Save as real agreement */}
      <button
        onClick={onSave}
        disabled={!done}
        style={{
          height: 54, borderRadius: 999, border: "none",
          cursor: done ? "pointer" : "not-allowed",
          fontSize: 15, fontWeight: 800,
          color: done ? "#0a0f0c" : G.muted,
          background: done
            ? "linear-gradient(135deg, #34d399 0%, #10b981 100%)"
            : "rgba(255,255,255,0.05)",
          boxShadow: done ? "0 4px 20px rgba(52,211,153,0.35)" : "none",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.3s ease",
        }}
      >
        <Shield size={18} /> Zapisz jako umowę
      </button>

      <button
        onClick={onBack}
        style={{
          height: 40, borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "transparent", cursor: "pointer",
          fontSize: 13, color: G.muted, fontWeight: 600,
        }}
      >
        ← Wróć i edytuj
      </button>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AIContracts() {
  const [, setLocation] = useLocation();
  const { primaryCurrency } = useAppStore();
  const [step, setStep] = useState<Step>("describe");
  const [contractText, setContractText] = useState("");

  const [data, setData] = useState<FormData>({
    description: "",
    partyA: "",
    partyB: "",
    amount: "",
    currency: primaryCurrency || "PLN",
    deadline: "",
    depositMode: "none",
    depositAmount: "",
    category: "usługa",
  });

  const stepIndex = { describe: 0, details: 1, generating: 2, preview: 3 };
  const si = stepIndex[step];

  const handleGenerate = () => {
    setStep("generating");
  };

  const handleGeneratingDone = () => {
    setContractText(buildContract(data));
    setStep("preview");
  };

  const handleSave = () => {
    setLocation("/agreements/new?ai=1&desc=" + encodeURIComponent(data.description));
  };

  return (
    <div style={{
      minHeight: "100dvh", background: G.bg,
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: -80, left: -80, width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: -60, right: -60, width: 250, height: 250, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={() => step === "describe" ? setLocation("/") : setStep(step === "details" ? "describe" : step === "preview" ? "details" : "describe")}
          style={{
            width: 40, height: 40, borderRadius: "50%", border: `1px solid ${G.border}`,
            background: G.greenDim, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <ArrowLeft size={18} color={G.green} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={18} color={G.green} />
            <span style={{ fontSize: 18, fontWeight: 900, color: G.text }}>Umowy AI</span>
          </div>
          <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>
            Inteligentny kreator umów
          </div>
        </div>
      </div>

      {/* Step indicator */}
      {step !== "generating" && (
        <div style={{ padding: "0 28px 20px", display: "flex", alignItems: "center", gap: 6 }}>
          <StepDot active={si === 0} done={si > 0} label="1" />
          <StepLine done={si > 0} />
          <StepDot active={si === 1} done={si > 1} label="2" />
          <StepLine done={si > 1} />
          <StepDot active={si === 2} done={si > 2} label="3" />
          <StepLine done={si > 3} />
          <StepDot active={si === 3} done={false} label="4" />
        </div>
      )}

      {/* Step label */}
      {step !== "generating" && (
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: G.text }}>
            {step === "describe" && "Opisz umowę"}
            {step === "details" && "Szczegóły"}
            {step === "preview" && "Gotowa umowa"}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        {step === "describe" && (
          <StepDescribe data={data} setData={setData} onNext={() => setStep("details")} />
        )}
        {step === "details" && (
          <StepDetails
            data={data} setData={setData}
            onNext={handleGenerate}
            onBack={() => setStep("describe")}
          />
        )}
        {step === "generating" && (
          <StepGenerating onDone={handleGeneratingDone} />
        )}
        {step === "preview" && (
          <StepPreview
            data={data} contractText={contractText}
            onBack={() => setStep("details")}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
