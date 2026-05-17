import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, type CurrencyCode } from "@/lib/store";
import { useLang } from "@/context/LanguageContext";

// ——— Types
type ContractType = "service" | "renovation" | "transport" | "sale" | "loan" | "other";
type PaymentModel = "full_deposit" | "upfront_deposit" | "custom";

interface StageItem {
  name: string;
  qty: number;
  unitPrice: number;
}

interface Stage {
  id: string;
  name: string;
  icon: string;
  amount: string;
  deadline: string;
  items: StageItem[];
}

interface Room {
  id: string;
  name: string;
  area: number;
  pricePerM2: number;
}

interface FormData {
  contractType: ContractType | "";
  deadline: string;
  title: string;
  stages: Stage[];
  rooms: Room[];
  materialsValue: number;
  lumpSumPrice: number;
  paymentModel: PaymentModel | "";
  upfrontPercent: number;
  depositPercent: number;
  afterPercent: number;
  currency: CurrencyCode;
}

// ——— Constants
const RENOVATION_TYPES: ContractType[] = ["renovation"];

const CONTRACT_TYPES: { value: ContractType; label: string; icon: string; desc: string }[] = [
  { value: "renovation", label: "Remont", icon: "🔨", desc: "Prace remontowe z etapami" },
  { value: "service", label: "Usługa", icon: "🛠️", desc: "Jednorazowe zlecenie" },
  { value: "transport", label: "Transport", icon: "🚚", desc: "Przewóz, przeprowadzka" },
  { value: "sale", label: "Sprzedaż", icon: "🛍️", desc: "Sprzedaż towaru lub usługi" },
  { value: "loan", label: "Pożyczka rzeczy", icon: "📦", desc: "Wypożyczenie przedmiotu" },
  { value: "other", label: "Inne", icon: "📋", desc: "Inny rodzaj umowy" },
];

const STAGE_PRESETS = [
  { name: "Rozbiórka", icon: "🔨" },
  { name: "Instalacje el.", icon: "⚡" },
  { name: "Hydraulika", icon: "🔧" },
  { name: "Tynki i wylewki", icon: "🪟" },
  { name: "Glazura", icon: "🚿" },
  { name: "Malowanie", icon: "🎨" },
  { name: "Podłogi", icon: "🪵" },
  { name: "Łazienka", icon: "🛁" },
  { name: "Kuchnia", icon: "🍳" },
  { name: "Odbiór końcowy", icon: "✅" },
];

const ROOM_PRESETS = ["Salon", "Sypialnia", "Łazienka", "Kuchnia", "Przedpokój", "Gabinet", "Taras", "Garaż"];
const RATE_CHIPS = [80, 120, 160, 200, 280, 350];
const CURRENCIES: CurrencyCode[] = ["PLN", "EUR", "USD", "GBP", "CZK"];

// Detailed item presets for trades that need per-unit pricing
const DETAILED_PRESETS: Record<string, string[]> = {
  "Instalacje el.": ["Gniazdko", "Punkt świetlny", "Łącznik/włącznik", "Obwód", "Rozdzielnia (moduł)", "Przewód mb"],
  "Hydraulika":     ["Punkt wod-kan", "Grzejnik", "Bateria/zawór", "Podejście", "Rura mb", "Odpływ"],
};

const PAYMENT_OPTS: { value: PaymentModel; label: string; icon: string; desc: string }[] = [
  { value: "full_deposit", label: "Całość w depozycie", icon: "🔒", desc: "Środki blokowane do finałowego odbioru" },
  { value: "upfront_deposit", label: "30% z góry + depozyt", icon: "📦", desc: "Część na start, reszta po wykonaniu" },
  { value: "custom", label: "Własny podział", icon: "⚙️", desc: "Ustaw własne procenty" },
];

const INITIAL_DATA: FormData = {
  contractType: "",
  deadline: "",
  title: "",
  stages: [],
  rooms: [],
  materialsValue: 0,
  lumpSumPrice: 0,
  paymentModel: "",
  upfrontPercent: 0,
  depositPercent: 100,
  afterPercent: 0,
  currency: "PLN",
};

const fmt = (n: number, sym: string) =>
  `${n.toLocaleString("pl-PL", { maximumFractionDigits: 0 })} ${sym}`;

// ——— Styles helpers
const card = (active = false): React.CSSProperties => ({
  padding: 14,
  borderRadius: 12,
  border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
  background: active
    ? "color-mix(in srgb, var(--color-primary) 12%, transparent)"
    : "var(--color-card)",
  cursor: "pointer",
  position: "relative",
  marginBottom: 0,
});

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--color-muted-foreground)",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid var(--color-border)",
  background: "var(--color-card)",
  color: "var(--color-foreground)",
  fontSize: 14,
  boxSizing: "border-box",
};

const smallInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  background: "var(--color-background)",
  color: "var(--color-foreground)",
  fontSize: 14,
  boxSizing: "border-box",
};

// ——— Main component
export default function AgreementNew() {
  const { defaultCurrency } = useAppStore();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>({ ...INITIAL_DATA, currency: defaultCurrency });
  const [saving, setSaving] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  const update = (u: Partial<FormData>) => setData(prev => ({ ...prev, ...u }));
  const isRenovation = RENOVATION_TYPES.includes(data.contractType as ContractType);

  const stepLabels = isRenovation
    ? ["Typ", "Etapy", "Wycena", "Płatność", "Gotowe"]
    : ["Typ", "Szczegóły", "Gotowe"];
  const totalSteps = stepLabels.length;
  const currSym = data.currency;

  const roomsTotal = data.rooms.reduce((s, r) => s + r.area * r.pricePerM2, 0);
  const stageValue = (st: Stage) => {
    const itemsTotal = st.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    return itemsTotal > 0 ? itemsTotal : parseFloat(st.amount) || 0;
  };
  const stagesTotal = data.stages.reduce((s, st) => s + stageValue(st), 0);
  const renovationBase = roomsTotal > 0 ? roomsTotal : stagesTotal;
  const total = isRenovation ? renovationBase + data.materialsValue : data.lumpSumPrice;

  const upfront =
    data.paymentModel === "upfront_deposit" ? total * 0.3
    : data.paymentModel === "custom" ? total * (data.upfrontPercent / 100)
    : 0;
  const deposit =
    data.paymentModel === "full_deposit" ? total
    : data.paymentModel === "upfront_deposit" ? total * 0.7
    : total * (data.depositPercent / 100);

  const addStage = (name: string, icon: string) =>
    update({ stages: [...data.stages, { id: Date.now().toString(), name, icon, amount: "", deadline: "", items: DETAILED_PRESETS[name] ? DETAILED_PRESETS[name].map(n => ({ name: n, qty: 0, unitPrice: 0 })) : [] }] });
  const updateStage = (id: string, patch: Partial<Stage>) =>
    update({ stages: data.stages.map(s => s.id === id ? { ...s, ...patch } : s) });
  const removeStage = (id: string) => update({ stages: data.stages.filter(s => s.id !== id) });

  const addRoom = (name: string) => {
    if (!name.trim()) return;
    update({ rooms: [...data.rooms, { id: Date.now().toString(), name: name.trim(), area: 0, pricePerM2: 0 }] });
    setNewRoomName("");
  };
  const updateRoom = (id: string, patch: Partial<Room>) =>
    update({ rooms: data.rooms.map(r => r.id === id ? { ...r, ...patch } : r) });
  const removeRoom = (id: string) => update({ rooms: data.rooms.filter(r => r.id !== id) });

  const warnings = [
    !data.contractType && "Brak typu umowy",
    total === 0 && "Kwota umowy wynosi 0",
    !data.paymentModel && "Brak modelu płatności",
  ].filter(Boolean) as string[];

  const handleCreate = async () => {
    setSaving(true);
    try {
      console.log("Creating contract", data);
      await new Promise(r => setTimeout(r, 800));
    } finally {
      setSaving(false);
    }
  };

  const paymentStep = isRenovation ? 4 : 2;

  const renderStep = () => {
    if (step === 1) return (
      <StepType data={data} update={update} currSym={currSym} />
    );
    if (isRenovation && step === 2) return (
      <StepStages data={data} addStage={addStage} updateStage={updateStage} removeStage={removeStage} currSym={currSym} stagesTotal={stagesTotal} />
    );
    if (isRenovation && step === 3) return (
      <StepPricing data={data} update={update} updateRoom={updateRoom} removeRoom={removeRoom} addRoom={addRoom} newRoomName={newRoomName} setNewRoomName={setNewRoomName} currSym={currSym} roomsTotal={roomsTotal} />
    );
    if (step === paymentStep) return (
      <StepPayment data={data} update={update} total={total} deposit={deposit} upfront={upfront} currSym={currSym} isRenovation={isRenovation} />
    );
    if (step === totalSteps) return (
      <StepSummary data={data} total={total} deposit={deposit} upfront={upfront} warnings={warnings} goToStep={setStep} isRenovation={isRenovation} currSym={currSym} roomsTotal={roomsTotal} stagesTotal={stagesTotal} paymentStep={paymentStep} />
    );
    return null;
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)", display: "flex", flexDirection: "column", maxWidth: 560, margin: "0 auto", paddingBottom: 88 }}>
      {/* Progress bar */}
      <div style={{ padding: "16px 16px 0", position: "sticky", top: 0, background: "var(--color-background)", zIndex: 10, borderBottom: "1px solid var(--color-border)", paddingBottom: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {stepLabels.map((label, i) => {
            const s = i + 1;
            const active = s === step;
            const done = s < step;
            return (
              <div key={label} onClick={() => done && setStep(s)} style={{ flex: 1, cursor: done ? "pointer" : "default" }}>
                <div style={{ height: 3, borderRadius: 2, background: active || done ? "var(--color-primary)" : "var(--color-border)", marginBottom: 4 }} />
                <div style={{ fontSize: 9, color: active ? "var(--color-primary)" : "var(--color-muted-foreground)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, textAlign: "center" }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "16px 16px 0", overflowY: "auto" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 560, background: "var(--color-background)", borderTop: "1px solid var(--color-border)", padding: "12px 16px", display: "flex", gap: 10, boxSizing: "border-box" }}>
        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{ flex: 1, padding: "13px 0", borderRadius: 10, border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-muted-foreground)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            ← Wstecz
          </button>
        )}
        {step < totalSteps ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!data.contractType && step === 1}
            style={{ flex: 2, padding: "13px 0", borderRadius: 10, border: "none", background: "var(--color-primary)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: data.contractType || step !== 1 ? "pointer" : "not-allowed", opacity: !data.contractType && step === 1 ? 0.5 : 1 }}
          >
            Dalej →
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={saving}
            style={{ flex: 2, padding: "13px 0", borderRadius: 10, border: "none", background: warnings.length > 0 ? "#92400E" : "var(--color-primary)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            {saving ? "Tworzenie…" : warnings.length > 0 ? "⚠️ Utwórz mimo braków" : "✓ Utwórz umowę"}
          </button>
        )}
      </div>
    </div>
  );
}

// ——— Step 1: Type + currency + deadline
function StepType({ data, update }: { data: FormData; update: (u: Partial<FormData>) => void; currSym: string }) {
  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 20, fontWeight: 800, marginBottom: 2 }}>Nowa umowa</h2>

      {/* Currency first — always visible */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, marginTop: 8 }}>
        {CURRENCIES.map(c => {
          const active = data.currency === c;
          return (
            <div key={c} onClick={() => update({ currency: c })} style={{ flex: 1, textAlign: "center", padding: "8px 2px", borderRadius: 8, border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`, background: active ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "var(--color-card)", cursor: "pointer" }}>
              <div style={{ color: active ? "var(--color-primary)" : "var(--color-muted-foreground)", fontSize: 11, fontWeight: 700 }}>{c}</div>
            </div>
          );
        })}
      </div>

      <label style={{ ...labelStyle, marginBottom: 6 }}>Typ umowy</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {CONTRACT_TYPES.map(opt => {
          const active = data.contractType === opt.value;
          return (
            <div key={opt.value} onClick={() => update({ contractType: opt.value })} style={{ ...card(active), padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{opt.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: active ? "var(--color-primary)" : "var(--color-foreground)", fontSize: 13, fontWeight: 700 }}>{opt.label}</div>
                  <div style={{ color: "var(--color-muted-foreground)", fontSize: 10, lineHeight: 1.3, marginTop: 1 }}>{opt.desc}</div>
                </div>
                {active && <div style={{ width: 16, height: 16, borderRadius: 8, background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>✓</div>}
              </div>
            </div>
          );
        })}
      </div>

      <label style={labelStyle}>Termin realizacji</label>
      <input
        value={data.deadline}
        onChange={e => update({ deadline: e.target.value })}
        placeholder="np. 2025-08-31"
        style={inputStyle}
      />
    </div>
  );
}

// ——— Step 2 (renovation): Stages
function StepStages({ data, addStage, updateStage, removeStage, currSym, stagesTotal }: {
  data: FormData; addStage: (name: string, icon: string) => void;
  updateStage: (id: string, p: Partial<Stage>) => void;
  removeStage: (id: string) => void;
  currSym: string; stagesTotal: number;
}) {
  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Etapy projektu</h2>
      <p style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>Podziel remont na fazy z osobnymi terminami i kwotami.</p>

      {data.stages.map((s, i) => {
        const hasDetail = s.items.length > 0;
        const itemsTotal = s.items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0);
        const displayAmount = hasDetail && itemsTotal > 0 ? itemsTotal : parseFloat(s.amount) || 0;
        return (
          <div key={s.id} style={{ background: "var(--color-card)", borderRadius: 12, border: "1px solid var(--color-border)", padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ background: "color-mix(in srgb, var(--color-primary) 15%, transparent)", color: "var(--color-primary)", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>Etap {i + 1}</span>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <input value={s.name} onChange={e => updateStage(s.id, { name: e.target.value })} style={{ flex: 1, background: "transparent", border: "none", color: "var(--color-foreground)", fontSize: 14, fontWeight: 700, outline: "none", minWidth: 0 }} />
              <span onClick={() => removeStage(s.id)} style={{ color: "var(--color-muted-foreground)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</span>
            </div>

            {/* Detailed item pricing for electrical/plumbing */}
            {hasDetail && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Wycena punktowa</div>
                {s.items.map((it, idx) => {
                  const sub = it.qty * it.unitPrice;
                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span style={{ flex: 1.2, color: "var(--color-muted-foreground)", fontSize: 12 }}>{it.name}</span>
                      <input
                        type="number" placeholder="szt." value={it.qty || ""}
                        onChange={e => { const items = [...s.items]; items[idx] = { ...it, qty: parseInt(e.target.value) || 0 }; updateStage(s.id, { items }); }}
                        style={{ width: 52, padding: "6px 6px", borderRadius: 6, border: "1px solid var(--color-border)", background: "var(--color-background)", color: "var(--color-foreground)", fontSize: 12, textAlign: "center" }}
                      />
                      <span style={{ color: "var(--color-muted-foreground)", fontSize: 11 }}>×</span>
                      <input
                        type="number" placeholder={currSym} value={it.unitPrice || ""}
                        onChange={e => { const items = [...s.items]; items[idx] = { ...it, unitPrice: parseFloat(e.target.value) || 0 }; updateStage(s.id, { items }); }}
                        style={{ width: 68, padding: "6px 6px", borderRadius: 6, border: "1px solid var(--color-border)", background: "var(--color-background)", color: "var(--color-foreground)", fontSize: 12, textAlign: "right" }}
                      />
                      <span style={{ width: 64, color: sub > 0 ? "#22c55e" : "var(--color-muted-foreground)", fontSize: 12, fontWeight: sub > 0 ? 700 : 400, textAlign: "right" }}>{sub > 0 ? fmt(sub, "") : "—"}</span>
                    </div>
                  );
                })}
                {itemsTotal > 0 && (
                  <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 6, borderTop: "1px solid var(--color-border)", marginTop: 4 }}>
                    <span style={{ color: "var(--color-primary)", fontSize: 13, fontWeight: 700 }}>{fmt(itemsTotal, currSym)}</span>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              {!hasDetail && (
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>Kwota ({currSym})</div>
                  <input type="number" value={s.amount} onChange={e => updateStage(s.id, { amount: e.target.value })} placeholder="0" style={smallInputStyle} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>Termin</div>
                <input value={s.deadline} onChange={e => updateStage(s.id, { deadline: e.target.value })} placeholder="RRRR-MM-DD" style={smallInputStyle} />
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ fontSize: 11, color: "var(--color-muted-foreground)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, marginTop: 8 }}>Dodaj etap</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {STAGE_PRESETS.map(p => (
          <div key={p.name} onClick={() => addStage(p.name, p.icon)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 20, border: "1px solid var(--color-border)", background: "var(--color-card)", cursor: "pointer", fontSize: 12, color: "var(--color-muted-foreground)" }}>
            <span>{p.icon}</span><span>{p.name}</span>
          </div>
        ))}
        <div onClick={() => addStage("Własny etap", "📋")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 20, border: "1px dashed var(--color-primary)", background: "transparent", cursor: "pointer", fontSize: 12, color: "var(--color-primary)" }}>
          ✏️ Własny etap
        </div>
      </div>

      {stagesTotal > 0 && (
        <div style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)", borderRadius: 12, border: "1.5px solid var(--color-primary)", padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "var(--color-primary)", fontSize: 12, fontWeight: 700 }}>Suma etapów</div>
            <div style={{ color: "var(--color-muted-foreground)", fontSize: 11, marginTop: 2 }}>{data.stages.length} {data.stages.length === 1 ? "etap" : data.stages.length < 5 ? "etapy" : "etapów"}</div>
          </div>
          <div style={{ color: "var(--color-foreground)", fontSize: 26, fontWeight: 800 }}>{fmt(stagesTotal, currSym)}</div>
        </div>
      )}
    </div>
  );
}

// ——— Step 3 (renovation): Per-room pricing
function StepPricing({ data, update, updateRoom, removeRoom, addRoom, newRoomName, setNewRoomName, currSym, roomsTotal }: {
  data: FormData; update: (u: Partial<FormData>) => void;
  updateRoom: (id: string, p: Partial<Room>) => void;
  removeRoom: (id: string) => void;
  addRoom: (name: string) => void;
  newRoomName: string; setNewRoomName: (v: string) => void;
  currSym: string; roomsTotal: number;
}) {
  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Wycena prac</h2>
      <p style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>Powierzchnia × stawka/m² – suma obliczana automatycznie.</p>

      {data.rooms.map(r => {
        const sub = r.area * r.pricePerM2;
        return (
          <div key={r.id} style={{ background: "var(--color-card)", borderRadius: 12, border: "1px solid var(--color-border)", padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
              <span style={{ flex: 1, color: "var(--color-foreground)", fontSize: 15, fontWeight: 700 }}>{r.name}</span>
              {sub > 0 && <span style={{ color: "var(--color-primary)", fontSize: 13, fontWeight: 700, marginRight: 10 }}>{fmt(sub, currSym)}</span>}
              <span onClick={() => removeRoom(r.id)} style={{ color: "var(--color-muted-foreground)", cursor: "pointer" }}>✕</span>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>Pow. (m²)</div>
                <input type="number" value={r.area || ""} onChange={e => updateRoom(r.id, { area: parseFloat(e.target.value) || 0 })} placeholder="0" style={smallInputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>Stawka ({currSym}/m²)</div>
                <input type="number" value={r.pricePerM2 || ""} onChange={e => updateRoom(r.id, { pricePerM2: parseFloat(e.target.value) || 0 })} placeholder="0" style={smallInputStyle} />
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {RATE_CHIPS.map(rate => {
                const active = r.pricePerM2 === rate;
                return (
                  <div key={rate} onClick={() => updateRoom(r.id, { pricePerM2: rate })} style={{ padding: "4px 10px", borderRadius: 12, border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`, background: active ? "color-mix(in srgb, var(--color-primary) 15%, transparent)" : "var(--color-background)", cursor: "pointer", fontSize: 11, color: active ? "var(--color-primary)" : "var(--color-muted-foreground)", fontWeight: active ? 700 : 400 }}>
                    {rate} {currSym}
                  </div>
                );
              })}
            </div>
            {r.area > 0 && r.pricePerM2 > 0 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-muted-foreground)", fontSize: 12 }}>{r.area} m² × {r.pricePerM2} {currSym}/m²</span>
                <span style={{ color: "#22c55e", fontSize: 13, fontWeight: 700 }}>= {fmt(sub, currSym)}</span>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Dodaj pomieszczenie</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            value={newRoomName}
            onChange={e => setNewRoomName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addRoom(newRoomName)}
            placeholder="Własna nazwa…"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={() => addRoom(newRoomName)} style={{ width: 44, height: 42, borderRadius: 10, border: "none", background: "var(--color-primary)", color: "#fff", fontSize: 22, cursor: "pointer", fontWeight: 300, flexShrink: 0 }}>+</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ROOM_PRESETS.map(name => (
            <div key={name} onClick={() => addRoom(name)} style={{ padding: "6px 12px", borderRadius: 16, border: "1px solid var(--color-border)", background: "var(--color-card)", cursor: "pointer", fontSize: 12, color: "var(--color-muted-foreground)" }}>{name}</div>
          ))}
        </div>
      </div>

      <div style={{ background: "var(--color-card)", borderRadius: 12, border: "1px solid var(--color-border)", padding: 14, marginBottom: 16 }}>
        <label style={labelStyle}>Materiały ({currSym})</label>
        <input type="number" value={data.materialsValue || ""} onChange={e => update({ materialsValue: parseFloat(e.target.value) || 0 })} placeholder="0" style={{ ...inputStyle, textAlign: "right" }} />
      </div>

      {roomsTotal > 0 && (
        <div style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)", borderRadius: 12, border: "1.5px solid var(--color-primary)", padding: 20, textAlign: "center" }}>
          <div style={{ color: "var(--color-primary)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>Łączna kwota (robocizna)</div>
          <div style={{ color: "var(--color-foreground)", fontSize: 32, fontWeight: 800 }}>{fmt(roomsTotal + data.materialsValue, currSym)}</div>
        </div>
      )}
    </div>
  );
}

// ——— Step payment
function StepPayment({ data, update, total, deposit, upfront, currSym, isRenovation }: {
  data: FormData; update: (u: Partial<FormData>) => void;
  total: number; deposit: number; upfront: number;
  currSym: string; isRenovation: boolean;
}) {
  const customTotal = data.upfrontPercent + data.depositPercent + data.afterPercent;
  const afterCompletion = total * (data.afterPercent / 100);

  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Płatność i depozyt</h2>
      <p style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
        {total > 0 ? `Jak zostanie podzielona kwota ${fmt(total, currSym)}?` : "Jak zostanie podzielona kwota?"}
      </p>

      {!isRenovation && (
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Kwota zlecenia ({currSym})</label>
          <input
            type="number"
            value={data.lumpSumPrice || ""}
            onChange={e => update({ lumpSumPrice: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            style={{ ...inputStyle, fontSize: 20, fontWeight: 700 }}
          />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {PAYMENT_OPTS.map(opt => {
          const active = data.paymentModel === opt.value;
          return (
            <div key={opt.value} onClick={() => update({ paymentModel: opt.value })} style={{ display: "flex", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`, background: active ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "var(--color-card)", cursor: "pointer" }}>
              <span style={{ fontSize: 20 }}>{opt.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: active ? "var(--color-primary)" : "var(--color-foreground)", fontSize: 14, fontWeight: 600 }}>{opt.label}</div>
                <div style={{ color: "var(--color-muted-foreground)", fontSize: 12, marginTop: 2 }}>{opt.desc}</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {active && <div style={{ width: 10, height: 10, borderRadius: 5, background: "var(--color-primary)" }} />}
              </div>
            </div>
          );
        })}
      </div>

      {data.paymentModel === "custom" && (
        <div style={{ background: "var(--color-card)", borderRadius: 12, border: "1px solid var(--color-border)", padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "var(--color-muted-foreground)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Podział (suma = 100%)</div>
          {[
            { label: "Z góry (%)", field: "upfrontPercent" as const },
            { label: "W depozycie (%)", field: "depositPercent" as const },
            { label: "Po wykonaniu (%)", field: "afterPercent" as const },
          ].map(({ label, field }) => (
            <div key={field} style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
              <span style={{ flex: 1, color: "var(--color-muted-foreground)", fontSize: 13 }}>{label}</span>
              <input
                type="number" min="0" max="100"
                value={data[field]}
                onChange={e => update({ [field]: Math.min(100, parseInt(e.target.value) || 0) })}
                style={{ width: 70, padding: "8px 10px", borderRadius: 8, border: `1px solid ${customTotal !== 100 ? "#f59e0b" : "var(--color-border)"}`, background: "var(--color-background)", color: "var(--color-foreground)", fontSize: 14, textAlign: "right" }}
              />
            </div>
          ))}
          {customTotal !== 100 && <div style={{ color: "#f59e0b", fontSize: 12 }}>⚠️ Suma: {customTotal}% – musi wynosić 100%</div>}
        </div>
      )}

      {total > 0 && data.paymentModel && (
        <div style={{ background: "var(--color-card)", borderRadius: 12, border: "1px solid var(--color-border)", padding: 16 }}>
          <div style={{ fontSize: 11, color: "var(--color-muted-foreground)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Podział płatności</div>
          {upfront > 0 && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: "#f59e0b", marginRight: 10, flexShrink: 0 }} />
              <span style={{ flex: 1, color: "var(--color-muted-foreground)", fontSize: 13 }}>Płatne z góry</span>
              <span style={{ color: "var(--color-foreground)", fontSize: 13, fontWeight: 600 }}>{fmt(upfront, currSym)}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: "var(--color-primary)", marginRight: 10, flexShrink: 0 }} />
            <span style={{ flex: 1, color: "var(--color-muted-foreground)", fontSize: 13 }}>W depozycie</span>
            <span style={{ color: "var(--color-primary)", fontSize: 13, fontWeight: 600 }}>{fmt(deposit, currSym)}</span>
          </div>
          {afterCompletion > 0 && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: "#22c55e", marginRight: 10, flexShrink: 0 }} />
              <span style={{ flex: 1, color: "var(--color-muted-foreground)", fontSize: 13 }}>Po wykonaniu</span>
              <span style={{ color: "#22c55e", fontSize: 13, fontWeight: 600 }}>{fmt(afterCompletion, currSym)}</span>
            </div>
          )}
          <div style={{ height: 1, background: "var(--color-border)", margin: "12px 0" }} />
          <div style={{ display: "flex" }}>
            <span style={{ flex: 1, color: "var(--color-foreground)", fontSize: 14, fontWeight: 700 }}>Łącznie</span>
            <span style={{ color: "var(--color-foreground)", fontSize: 16, fontWeight: 800 }}>{fmt(total, currSym)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ——— Step Summary
function StepSummary({ data, total, deposit, upfront, warnings, goToStep, isRenovation, currSym, roomsTotal, stagesTotal, paymentStep }: {
  data: FormData; total: number; deposit: number; upfront: number;
  warnings: string[]; goToStep: (s: number) => void;
  isRenovation: boolean; currSym: string;
  roomsTotal: number; stagesTotal: number; paymentStep: number;
}) {
  const Section = ({ title, editStep, children }: { title: string; editStep: number; children: React.ReactNode }) => (
    <div style={{ background: "var(--color-card)", borderRadius: 12, border: "1px solid var(--color-border)", padding: 14, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ color: "var(--color-primary)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{title}</span>
        <span onClick={() => goToStep(editStep)} style={{ color: "var(--color-primary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Edytuj →</span>
      </div>
      {children}
    </div>
  );

  const Row = ({ label, value, warn }: { label: string; value: string; warn?: boolean }) => (
    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 6 }}>
      <span style={{ color: "var(--color-muted-foreground)", fontSize: 13 }}>{label}</span>
      <span style={{ color: warn ? "#f59e0b" : "var(--color-foreground)", fontSize: 13, fontWeight: 500, textAlign: "right", marginLeft: 8 }}>{value}</span>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Podsumowanie</h2>
      <p style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>Sprawdź dane i utwórz umowę.</p>

      {warnings.length > 0 && (
        <div style={{ background: "rgba(245,158,11,0.1)", borderRadius: 10, border: "1px solid #f59e0b", padding: 12, marginBottom: 14 }}>
          <div style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>⚠️ Brakujące dane ({warnings.length})</div>
          {warnings.map(w => <div key={w} style={{ color: "#f59e0b", fontSize: 12, lineHeight: 1.8 }}>• {w}</div>)}
        </div>
      )}

      <Section title="Podstawy" editStep={1}>
        <Row label="Typ" value={CONTRACT_TYPES.find(t => t.value === data.contractType)?.label ?? "—"} warn={!data.contractType} />
        {data.deadline && <Row label="Termin" value={data.deadline} />}
        <Row label="Waluta" value={data.currency} />
      </Section>

      {isRenovation && data.stages.length > 0 && (
        <Section title={`Etapy (${data.stages.length})`} editStep={2}>
          {data.stages.map((s, i) => (
            <Row key={s.id} label={`${i + 1}. ${s.icon} ${s.name}`} value={s.amount ? fmt(parseFloat(s.amount), currSym) : s.deadline || "—"} />
          ))}
        </Section>
      )}

      {isRenovation && data.rooms.length > 0 && (
        <Section title={`Wycena (${data.rooms.length} pom.)`} editStep={3}>
          {data.rooms.map(r => (
            <Row key={r.id} label={r.name} value={r.area > 0 && r.pricePerM2 > 0 ? fmt(r.area * r.pricePerM2, currSym) : r.area > 0 ? `${r.area} m²` : "—"} />
          ))}
          {data.materialsValue > 0 && <Row label="Materiały" value={fmt(data.materialsValue, currSym)} />}
        </Section>
      )}

      <Section title="Płatność" editStep={paymentStep}>
        <Row label="Model" value={PAYMENT_OPTS.find(o => o.value === data.paymentModel)?.label ?? "—"} warn={!data.paymentModel} />
        {deposit > 0 && <Row label="Depozyt" value={fmt(deposit, currSym)} />}
        {upfront > 0 && <Row label="Z góry" value={fmt(upfront, currSym)} />}
      </Section>

      <div style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)", borderRadius: 12, border: "1.5px solid var(--color-primary)", padding: 20, textAlign: "center", margin: "16px 0 8px" }}>
        <div style={{ color: "var(--color-primary)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>Łączna kwota umowy</div>
        <div style={{ color: "var(--color-foreground)", fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>{fmt(total, currSym)}</div>
        {deposit > 0 && <div style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginTop: 4 }}>w tym {fmt(deposit, currSym)} w depozycie</div>}
      </div>
    </div>
  );
}
