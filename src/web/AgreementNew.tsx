import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, type CurrencyCode } from "@/lib/store";

// ——— Types
type Category = "usluga" | "remont" | "sprzedaz" | "wynajem" | "wlasna" | "pozyczka";
type PricingMethod = string;
type DeadlineType = "single" | "range" | "stages" | "cyclic" | "tbd";
type ProtocolStatus = "accepted" | "with_notes" | "needs_fixes" | "rejected";
type PaymentMethodType = "upfront" | "after" | "stages" | "deposit" | "partial_deposit";

interface Party {
  name: string;
  phone: string;
  email: string;
}

interface AdditionalItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  payer: "client" | "contractor";
  inDeposit: boolean;
}

interface Room {
  id: string;
  name: string;
  floorArea: number;
  wallArea: number;
  ceiling: boolean;
  floor: boolean;
  notes: string;
}

interface ElectronicsDetails {
  type: "telefon" | "laptop" | "konsola" | "tablet" | "tv" | "inne";
  brand: string;
  model: string;
  imei: string;
  condition: "nowy" | "bardzo_dobry" | "uzywany" | "uszkodzony";
  icloudLock: boolean;
  screenCrack: boolean;
  batteryPct: number;
  loggedOut: boolean;
  accessories: string[];
  processor: string;
  ram: string;
  storage: string;
  os: string;
  charger: boolean;
  consolePads: number;
  consoleGames: number;
  consoleDrive: string;
  consoleOnline: boolean;
}

interface WizardData {
  myRole: "client" | "contractor" | "";
  inviteContact: string;
  category: Category | "";
  subcategory: string;
  client: Party;
  contractor: Party;
  pricingMethod: PricingMethod;
  basePrice: number;
  pricePerUnit: string;
  currency: CurrencyCode;
  deadlineType: DeadlineType;
  deadlineSingle: string;
  deadlineFrom: string;
  deadlineTo: string;
  deadlineTbd: boolean;
  scopeDescription: string;
  scopeLocation: string;
  scopeMaterials: boolean;
  scopeWarranty: boolean;
  scopeAcceptance: boolean;
  scopeInstallations: string[];
  scopeDemolition: boolean;
  scopeCleaning: boolean;
  scopeBeforePhotos: boolean;
  itemDescription: string;
  itemCondition: string;
  itemSerial: string;
  rentalDescription: string;
  rentalConditionBefore: string;
  rentalProtocol: boolean;
  customTitle: string;
  customDesc: string;
  rooms: Room[];
  electronics: Partial<ElectronicsDetails>;
  rentalFrom: string;
  rentalTo: string;
  rentalDeposit: number;
  rentalReturnNotes: string;
  rentalDamageLiability: boolean;
  additionalItems: AdditionalItem[];
  paymentMethod: PaymentMethodType | "";
  depositCovers: string[];
  materialsBy: "client" | "contractor" | "split";
  transportBy: "client" | "contractor";
  weekendWork: boolean;
  requireApproval: boolean;
  priceChangeApproval: boolean;
  warranty: boolean;
  warrantyDays: number;
  latePenalty: boolean;
  latePenaltyAmount: number;
  protocolStatus: ProtocolStatus | "";
  beforePhotos: boolean;
  afterPhotos: boolean;
  protocolDesc: string;
  protocolIssues: string;
  protocolFixDeadline: string;
  releaseDeposit: boolean;
  signed: boolean;
}

const INITIAL: WizardData = {
  myRole: "", inviteContact: "",
  category: "", subcategory: "",
  client: { name: "", phone: "", email: "" },
  contractor: { name: "", phone: "", email: "" },
  pricingMethod: "", basePrice: 0, pricePerUnit: "", currency: "PLN",
  deadlineType: "single", deadlineSingle: "", deadlineFrom: "", deadlineTo: "", deadlineTbd: false,
  scopeDescription: "", scopeLocation: "", scopeMaterials: false, scopeWarranty: false, scopeAcceptance: false,
  scopeInstallations: [], scopeDemolition: false, scopeCleaning: false, scopeBeforePhotos: false,
  itemDescription: "", itemCondition: "", itemSerial: "",
  rentalDescription: "", rentalConditionBefore: "", rentalProtocol: false,
  customTitle: "", customDesc: "",
  rooms: [], electronics: {},
  rentalFrom: "", rentalTo: "", rentalDeposit: 0, rentalReturnNotes: "", rentalDamageLiability: false,
  additionalItems: [],
  paymentMethod: "", depositCovers: [],
  materialsBy: "contractor", transportBy: "contractor",
  weekendWork: false, requireApproval: true, priceChangeApproval: true,
  warranty: false, warrantyDays: 30, latePenalty: false, latePenaltyAmount: 50,
  protocolStatus: "", beforePhotos: false, afterPhotos: false,
  protocolDesc: "", protocolIssues: "", protocolFixDeadline: "", releaseDeposit: false,
  signed: false,
};

// ——— Style helpers
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1px solid var(--color-border)", background: "var(--color-card)",
  color: "var(--color-foreground)", fontSize: 14, boxSizing: "border-box",
};
const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: "vertical", minHeight: 80, fontFamily: "inherit",
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, textTransform: "uppercase",
  letterSpacing: 0.8, color: "var(--color-muted-foreground)", marginBottom: 8, display: "block",
};
const cardStyle = (active = false): React.CSSProperties => ({
  padding: 14, borderRadius: 12,
  border: active ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)",
  background: active ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "var(--color-card)",
  cursor: "pointer",
});
const sectionCard: React.CSSProperties = {
  padding: 14, borderRadius: 12, border: "1px solid var(--color-border)",
  background: "var(--color-card)", marginBottom: 12,
};
const tileGrid: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
};
const btnPrimary: React.CSSProperties = {
  padding: "10px 20px", borderRadius: 10, border: "none",
  background: "var(--color-primary)", color: "#fff",
  fontSize: 14, fontWeight: 700, cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
  padding: "10px 20px", borderRadius: 10,
  border: "1px solid var(--color-border)", background: "transparent",
  color: "var(--color-muted-foreground)", fontSize: 14, fontWeight: 600, cursor: "pointer",
};

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}
    >
      <span style={{ color: "var(--color-foreground)", fontSize: 14 }}>{label}</span>
      <div
        onClick={() => onChange(!on)}
        style={{
          width: 44, height: 24, borderRadius: 12, background: on ? "var(--color-primary)" : "var(--color-border)",
          position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: 3, left: on ? 22 : 3, width: 18, height: 18,
          borderRadius: 9, background: "#fff", transition: "left 0.2s",
        }} />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={labelStyle}>{children}</div>;
}

const SUBCATEGORIES: Record<string, string[]> = {
  usluga: ["Naprawa", "Montaż", "Transport", "Sprzątanie", "Pomoc/opieka", "Usługa techniczna", "Inna"],
  remont: ["Malowanie", "Szpachlowanie", "Podłogi", "Łazienka", "Kuchnia", "Elektryka", "Hydraulika", "Cały remont"],
  sprzedaz: ["Auto/pojazd", "Elektronika", "Meble", "Narzędzia", "Sprzęt domowy", "Towar firmowy", "Inna rzecz"],
  wynajem: ["Mieszkanie", "Pokój", "Lokal", "Garaż/parking", "Auto/pojazd", "Sprzęt", "Inny wynajem"],
};

const PRICING_OPTIONS: Record<string, { value: string; label: string }[]> = {
  usluga: [
    { value: "total", label: "Cena za całość" },
    { value: "hourly", label: "Za godzinę" },
    { value: "unit", label: "Za sztukę" },
    { value: "stages", label: "Etapami" },
  ],
  remont: [
    { value: "m2", label: "Cena za m²" },
    { value: "materials_labor", label: "Materiały + robocizna" },
    { value: "stages", label: "Etapami" },
    { value: "per_point", label: "Za punkt" },
    { value: "total", label: "Za całość" },
  ],
  sprzedaz: [
    { value: "fixed", label: "Cena stała" },
    { value: "negotiated", label: "Cena negocjowana" },
    { value: "deposit_pickup", label: "Z depozytem do odbioru" },
  ],
  wynajem: [
    { value: "per_day", label: "Za dzień" },
    { value: "per_week", label: "Za tydzień" },
    { value: "per_month", label: "Za miesiąc + kaucja" },
  ],
  wlasna: [
    { value: "price", label: "Cena" },
    { value: "value", label: "Wartość umowy" },
  ],
};

const ADDITIONAL_PRESETS = [
  "Materiały", "Transport", "Dojazd", "Demontaż", "Utylizacja",
  "Sprzątanie", "Poprawki", "Gwarancja", "Praca w weekend", "Pilny termin",
];

const DEPOSIT_COVERS_OPTIONS = [
  "Całość", "Robocizna", "Materiały", "Wybrane etapy",
  "Ostatnia rata", "Poprawki/usterki", "Kaucja za szkody",
];

const CATEGORY_LABELS: Record<string, string> = {
  usluga: "Usługa", remont: "Remont", sprzedaz: "Sprzedaż", wynajem: "Wynajem", wlasna: "Własna",
};

const STEP_HINTS: Record<string, { icon: string; text: string }> = {
  podkategoria: { icon: "🎯", text: "Precyzyjny typ umowy = mniej sporów i lepsza ochrona." },
  strony: { icon: "🔒", text: "Dane stron są używane wyłącznie w tej umowie. Obie strony muszą je zaakceptować." },
  wycena: { icon: "💡", text: "Jasna cena od początku eliminuje 80% konfliktów przy rozliczeniu." },
  termin: { icon: "📅", text: "Konkretny termin + kara za opóźnienie to najlepsza motywacja do dotrzymania słowa." },
  zakres: { icon: "📋", text: "Im dokładniejszy zakres, tym mniej miejsca na nieporozumienia." },
  pomieszczenia: { icon: "📐", text: "Pomiary i zdjęcia przed pracą to Twój dowód w razie sporu." },
  szczegoly: { icon: "🔍", text: "Numer seryjny i stan urządzenia to jedyne zabezpieczenie przy sporze o stan przed sprzedażą." },
  szczegoly_wynajmu: { icon: "🏠", text: "Protokół wydania chroni zarówno wynajmującego, jak i najemcę." },
  dodatki: { icon: "➕", text: "Zapomniane koszty to najczęstszy powód kłótni. Dodaj wszystko teraz." },
  wycena_koncowa: { icon: "💰", text: "Sprawdź dokładnie. Po podpisaniu zmiany wymagają aneksu." },
  platnosc: { icon: "🛡️", text: "Depozyt blokuje środki do odbioru — chronisz siebie bez ryzykowania relacji." },
  warunki: { icon: "⚖️", text: "Jasne warunki = brak zaskoczeń. Każda strona wie czego się spodziewać." },
  protokol: { icon: "✅", text: "Protokół odbioru to ostatni krok przed wypłatą — nie pomijaj go." },
  przeglad: { icon: "👁️", text: "Ostatnia szansa na sprawdzenie. Każdy błąd teraz = problem po podpisaniu." },
};

function getContextualNudge(data: WizardData): { icon: string; text: string; color: string } | null {
  if (data.category === "remont" && !data.paymentMethod) return { icon: "🛡️", text: "Przy remontach 9 na 10 sporów dotyczy wypłaty — depozyt eliminuje ten problem.", color: "#7c3aed" };
  if (data.category === "sprzedaz" && data.subcategory === "Elektronika") return { icon: "📱", text: "IMEI i numer seryjny to jedyny dowód tożsamości urządzenia. Bez nich nie masz ochrony.", color: "#0369a1" };
  if (data.category === "wynajem" && !data.rentalDeposit) return { icon: "⚠️", text: "Brak kaucji = brak ochrony przy zniszczeniu. Nawet symboliczna kwota ma znaczenie prawne.", color: "#b45309" };
  if (data.basePrice > 5000 && data.paymentMethod !== "deposit") return { icon: "💡", text: `Umowa na ${data.basePrice.toLocaleString("pl-PL")} ${data.currency} — rozważ depozyt. Przy tej kwocie to kluczowe zabezpieczenie.`, color: "#7c3aed" };
  return null;
}

function getSteps(category: string) {
  const base = [
    { id: "rola", label: "Rola" },
    { id: "kategoria", label: "Kategoria" },
    { id: "podkategoria", label: "Podkategoria" },
    { id: "strony", label: "Strony" },
    { id: "wycena", label: "Wycena" },
    { id: "termin", label: "Termin" },
    { id: "zakres", label: "Zakres" },
  ];
  if (category === "remont") base.push({ id: "pomieszczenia", label: "Pomieszczenia" });
  if (category === "sprzedaz") base.push({ id: "szczegoly", label: "Szczegóły" });
  if (category === "wynajem") base.push({ id: "szczegoly_wynajmu", label: "Wynajem" });
  base.push(
    { id: "dodatki", label: "Dodatki" },
    { id: "wycena_koncowa", label: "Podsumowanie" },
    { id: "platnosc", label: "Płatność" },
    { id: "warunki", label: "Warunki" },
    { id: "protokol", label: "Protokół" },
    { id: "przeglad", label: "Przegląd" },
    { id: "podpis", label: "Podpis" },
  );
  return base;
}

export default function AgreementNew() {
  const { defaultCurrency } = useAppStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<WizardData>({ ...INITIAL, currency: defaultCurrency });
  const [signed, setSigned] = useState(false);

  const update = (patch: Partial<WizardData>) => setData(prev => ({ ...prev, ...patch }));

  const steps = getSteps(data.category);
  const totalSteps = steps.length;
  const currentStep = steps[stepIndex]?.id ?? "";

  const additionalTotal = data.additionalItems.reduce((s, i) => s + i.qty * i.price, 0);
  const totalPrice = data.basePrice + additionalTotal + (data.rentalDeposit || 0);

  const warnings: string[] = [];
  if (!data.client.name && !data.contractor.name) warnings.push("Brak danych drugiej strony");
  if (data.category === "remont" && !data.scopeBeforePhotos) warnings.push("Brakuje zdjęć przed pracą");
  if (data.category !== "wlasna" && !data.scopeMaterials && data.category !== "sprzedaz" && data.category !== "wynajem")
    warnings.push("Nie ustalono kto kupuje materiały");
  if (data.paymentMethod === "deposit" && data.depositCovers.length === 0)
    warnings.push("Depozyt nie jest przypisany do konkretnych etapów");

  const canGoNext = () => {
    if (currentStep === "rola") return !!data.myRole;
    if (currentStep === "kategoria") return !!data.category && data.category !== "pozyczka";
    if (currentStep === "strony") {
      const mine = data.myRole === "contractor" ? data.contractor : data.client;
      return !!mine.name;
    }
    return true;
  };

  const goNext = () => {
    if (stepIndex < totalSteps - 1) setStepIndex(s => s + 1);
  };
  const goBack = () => {
    if (stepIndex > 0) setStepIndex(s => s - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case "rola": return <StepRola data={data} update={update} goNext={goNext} />;
      case "kategoria": return <StepKategoria data={data} update={update} goNext={goNext} />;
      case "podkategoria": return <StepPodkategoria data={data} update={update} goNext={goNext} />;
      case "strony": return <StepStrony data={data} update={update} />;
      case "wycena": return <StepWycena data={data} update={update} />;
      case "termin": return <StepTermin data={data} update={update} />;
      case "zakres": return <StepZakres data={data} update={update} />;
      case "pomieszczenia": return <StepPomieszczenia data={data} update={update} />;
      case "szczegoly": return <StepSzczegolySprzedaz data={data} update={update} />;
      case "szczegoly_wynajmu": return <StepSzczegolyWynajem data={data} update={update} />;
      case "dodatki": return <StepDodatki data={data} update={update} additionalTotal={additionalTotal} />;
      case "wycena_koncowa": return <StepWycenaKoncowa data={data} update={update} totalPrice={totalPrice} additionalTotal={additionalTotal} goBack={goBack} />;
      case "platnosc": return <StepPlatnosc data={data} update={update} totalPrice={totalPrice} />;
      case "warunki": return <StepWarunki data={data} update={update} />;
      case "protokol": return <StepProtokol data={data} update={update} />;
      case "przeglad": return <StepPrzeglad data={data} steps={steps} goToStep={setStepIndex} warnings={warnings} totalPrice={totalPrice} />;
      case "podpis": return <StepPodpis data={data} update={update} signed={signed} setSigned={setSigned} />;
      default: return null;
    }
  };

  if (signed) {
    const otherParty = data.myRole === "contractor" ? data.client : data.contractor;
    const myParty = data.myRole === "contractor" ? data.contractor : data.client;
    const invited = data.inviteContact || otherParty.email || otherParty.phone;
    const otherLabel = data.myRole === "contractor"
      ? (data.category === "wynajem" ? "Najemca" : data.category === "sprzedaz" ? "Kupujący" : "Zleceniodawca")
      : (data.category === "wynajem" ? "Wynajmujący" : data.category === "sprzedaz" ? "Sprzedający" : "Wykonawca");
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-background)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>📄</div>
          <h2 style={{ color: "var(--color-foreground)", fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Umowa podpisana ✓</h2>
          <p style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
            Twój podpis został dodany. Oczekuje na akceptację drugiej strony.
          </p>

          {totalPrice > 0 && (
            <div style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)", borderRadius: 12, border: "1.5px solid var(--color-primary)", padding: 16, marginBottom: 12 }}>
              <div style={{ color: "var(--color-muted-foreground)", fontSize: 11, marginBottom: 4 }}>Łączna kwota umowy</div>
              <div style={{ color: "var(--color-primary)", fontSize: 28, fontWeight: 800 }}>{totalPrice.toLocaleString("pl-PL")} {data.currency}</div>
            </div>
          )}

          <div style={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)", padding: 16, marginBottom: 12, textAlign: "left" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Status umowy</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: "#16a34a", flexShrink: 0 }} />
              <span style={{ color: "var(--color-foreground)", fontSize: 13 }}>
                <b>{myParty.name || "Ty"}</b> — podpisano ✓
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: "#f59e0b", flexShrink: 0 }} />
              <span style={{ color: "var(--color-foreground)", fontSize: 13 }}>
                <b>{otherParty.name || invited || otherLabel}</b> — oczekuje na akceptację
              </span>
            </div>
          </div>

          {invited && (
            <div style={{ borderRadius: 10, border: "1px solid color-mix(in srgb, #16a34a 30%, transparent)", background: "color-mix(in srgb, #16a34a 8%, transparent)", padding: 12, marginBottom: 12 }}>
              <div style={{ color: "#16a34a", fontSize: 12, fontWeight: 600 }}>📤 Zaproszenie wysłane do: {invited}</div>
            </div>
          )}

          <button onClick={() => { setSigned(false); setStepIndex(0); setData({ ...INITIAL, currency: defaultCurrency }); }} style={{ ...btnSecondary, width: "100%", marginTop: 4 }}>
            Nowa umowa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)", display: "flex", flexDirection: "column", maxWidth: 560, margin: "0 auto", paddingBottom: 88 }}>
      {/* Progress bar */}
      <div style={{ padding: "12px 16px 6px", position: "sticky", top: 0, background: "var(--color-background)", zIndex: 10, borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: 6 }}>
          {steps.map((s, i) => {
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <div key={s.id} onClick={() => done && setStepIndex(i)} style={{ flex: "0 0 auto", cursor: done ? "pointer" : "default", minWidth: 0 }}>
                <div style={{ height: 3, borderRadius: 2, background: active || done ? "var(--color-primary)" : "var(--color-border)", marginBottom: 3, width: "100%", minWidth: 28 }} />
                <div style={{ fontSize: 8, color: active ? "var(--color-primary)" : "var(--color-muted-foreground)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3, whiteSpace: "nowrap" }}>{s.label}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "var(--color-muted-foreground)", fontSize: 11, display: "flex", gap: 6, alignItems: "center" }}>
            {data.category && <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>{CATEGORY_LABELS[data.category]}</span>}
            {data.subcategory && <><span style={{ color: "var(--color-border)" }}>›</span><span>{data.subcategory}</span></>}
          </div>
          <div style={{ color: "var(--color-muted-foreground)", fontSize: 11, fontWeight: 600 }}>
            {Math.round((stepIndex / (totalSteps - 1)) * 100)}%
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "16px 16px 0", overflowY: "auto", overflowX: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
          >
            {STEP_HINTS[currentStep] && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: "color-mix(in srgb, var(--color-primary) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)", marginBottom: 16 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{STEP_HINTS[currentStep].icon}</span>
                <span style={{ color: "var(--color-muted-foreground)", fontSize: 12, lineHeight: 1.5 }}>{STEP_HINTS[currentStep].text}</span>
              </div>
            )}
            {(() => {
              const nudge = getContextualNudge(data);
              return nudge && (currentStep === "platnosc" || currentStep === "wycena" || currentStep === "szczegoly" || currentStep === "szczegoly_wynajmu") ? (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: `color-mix(in srgb, ${nudge.color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${nudge.color} 30%, transparent)`, marginBottom: 16 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{nudge.icon}</span>
                  <span style={{ color: "var(--color-foreground)", fontSize: 12, lineHeight: 1.5 }}>{nudge.text}</span>
                </div>
              ) : null;
            })()}
            {currentStep === "platnosc" && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 12px", borderRadius: 8, background: "color-mix(in srgb, #16a34a 8%, transparent)", border: "1px solid color-mix(in srgb, #16a34a 25%, transparent)", marginBottom: 14 }}>
                <span style={{ fontSize: 14 }}>👥</span>
                <span style={{ color: "#16a34a", fontSize: 11, fontWeight: 600 }}>93% użytkowników wybiera depozyt przy umowach powyżej 1000 zł</span>
              </div>
            )}
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 560, background: "var(--color-background)", borderTop: "1px solid var(--color-border)", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box" }}>
        <button
          onClick={goBack}
          disabled={stepIndex === 0}
          style={{ width: 44, height: 44, borderRadius: 22, border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-muted-foreground)", fontSize: 20, cursor: stepIndex === 0 ? "not-allowed" : "pointer", opacity: stepIndex === 0 ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          ←
        </button>
        <div style={{ color: "var(--color-muted-foreground)", fontSize: 12 }}>{stepIndex + 1} / {totalSteps}</div>
        {currentStep !== "podpis" && (
          <button
            onClick={goNext}
            disabled={!canGoNext()}
            style={{ width: 44, height: 44, borderRadius: 22, border: "none", background: canGoNext() ? "var(--color-primary)" : "var(--color-border)", color: "#fff", fontSize: 20, cursor: canGoNext() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}

// ——— STEP 0: Rola
function StepRola({ data, update, goNext }: { data: WizardData; update: (p: Partial<WizardData>) => void; goNext: () => void }) {
  const roles: { value: "client" | "contractor"; icon: string; label: string; desc: string }[] = [
    { value: "client", icon: "🤝", label: "Klient / Zleceniodawca", desc: "Zamawiasz usługę, kupujesz, wynajmujesz" },
    { value: "contractor", icon: "🔨", label: "Wykonawca / Sprzedający", desc: "Wykonujesz usługę, sprzedajesz, wynajmujesz" },
  ];
  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Tworzysz jako...</h2>
      <p style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
        Określ swoją rolę w tej umowie.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {roles.map(r => (
          <div
            key={r.value}
            onClick={() => { update({ myRole: r.value }); goNext(); }}
            style={{ ...cardStyle(false), display: "flex", alignItems: "center", gap: 14, padding: 18, cursor: "pointer" }}
          >
            <div style={{ fontSize: 32, flexShrink: 0 }}>{r.icon}</div>
            <div>
              <div style={{ color: "var(--color-foreground)", fontSize: 16, fontWeight: 700, marginBottom: 3 }}>{r.label}</div>
              <div style={{ color: "var(--color-muted-foreground)", fontSize: 12, lineHeight: 1.4 }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ——— STEP 1: Kategoria
function StepKategoria({ data, update, goNext }: { data: WizardData; update: (p: Partial<WizardData>) => void; goNext: () => void }) {
  const categories: { value: Category; label: string; icon: string }[] = [
    { value: "usluga", label: "Usługa", icon: "🛠️" },
    { value: "remont", label: "Remont", icon: "🔨" },
    { value: "sprzedaz", label: "Sprzedaż", icon: "🛍️" },
    { value: "wynajem", label: "Wynajem", icon: "🏠" },
    { value: "wlasna", label: "Stwórz własną", icon: "📝" },
  ];
  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Nowa umowa</h2>
      <p style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>Wybierz kategorię umowy.</p>
      <div style={{ ...tileGrid, gridTemplateColumns: "1fr 1fr" }}>
        {categories.map(c => (
          <div
            key={c.value}
            onClick={() => { update({ category: c.value, subcategory: "" }); goNext(); }}
            style={{ ...cardStyle(false), cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", minWidth: 0 }}
          >
            <span style={{ fontSize: 22, flexShrink: 0 }}>{c.icon}</span>
            <span style={{ color: "var(--color-foreground)", fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ——— STEP 2: Podkategoria
function StepPodkategoria({ data, update, goNext }: { data: WizardData; update: (p: Partial<WizardData>) => void; goNext: () => void }) {
  if (data.category === "wlasna") {
    return (
      <div>
        <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Własna umowa</h2>
        <p style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginBottom: 16 }}>Podaj szczegóły na kolejnych krokach.</p>
      </div>
    );
  }
  const subs = SUBCATEGORIES[data.category] ?? [];
  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Podkategoria</h2>
      <p style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>Wybierz rodzaj umowy.</p>
      <div style={tileGrid}>
        {subs.map(s => (
          <div key={s} onClick={() => { update({ subcategory: s }); goNext(); }} style={{ ...cardStyle(false), cursor: "pointer", padding: "12px 14px", minWidth: 0 }}>
            <div style={{ color: "var(--color-foreground)", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ——— STEP 3: Strony
function StepStrony({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  const PartyForm = ({ title, party, onChange, highlight }: { title: string; party: Party; onChange: (p: Party) => void; highlight?: boolean }) => (
    <div style={{ ...sectionCard, border: highlight ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <SectionLabel>{title}</SectionLabel>
        {highlight && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-primary)", background: "color-mix(in srgb, var(--color-primary) 12%, transparent)", borderRadius: 20, padding: "2px 8px", whiteSpace: "nowrap", marginBottom: 8 }}>Twoje dane</span>}
      </div>
      <div style={{ marginBottom: 8 }}>
        <input value={party.name} onChange={e => onChange({ ...party, name: e.target.value })} placeholder="Imię i nazwisko" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <input value={party.phone} onChange={e => onChange({ ...party, phone: e.target.value })} placeholder="Telefon" type="tel" style={inputStyle} />
      </div>
      <input value={party.email} onChange={e => onChange({ ...party, email: e.target.value })} placeholder="Email (opcjonalnie)" type="email" style={inputStyle} />
    </div>
  );
  const clientLabel = data.category === "wynajem" ? "Najemca" : data.category === "sprzedaz" ? "Kupujący" : "Zleceniodawca";
  const contractorLabel = data.category === "wynajem" ? "Wynajmujący" : data.category === "sprzedaz" ? "Sprzedający" : "Wykonawca";
  const iAmClient = data.myRole === "client";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, margin: 0 }}>Strony umowy</h2>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", background: "color-mix(in srgb, #16a34a 12%, transparent)", border: "1px solid color-mix(in srgb, #16a34a 30%, transparent)", borderRadius: 20, padding: "2px 8px", whiteSpace: "nowrap" }}>🔒 Dane chronione</span>
      </div>
      <PartyForm title={clientLabel} party={data.client} onChange={v => update({ client: v })} highlight={iAmClient} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 4px 2px" }}>
        <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
        <span style={{ color: "var(--color-muted-foreground)", fontSize: 11 }}>druga strona</span>
        <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
      </div>
      <PartyForm title={contractorLabel} party={data.contractor} onChange={v => update({ contractor: v })} highlight={!iAmClient} />
      <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 10, background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
        <span style={{ color: "var(--color-muted-foreground)", fontSize: 12 }}>💡 Nie znasz danych drugiej strony? Wprowadź swoje i zaproś ją na końcu kreatora.</span>
      </div>
    </div>
  );
}

// ——— STEP 4: Wycena
function StepWycena({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  const opts = PRICING_OPTIONS[data.category] ?? PRICING_OPTIONS["wlasna"];
  const currencies: CurrencyCode[] = ["PLN", "EUR", "USD", "GBP", "CZK"];
  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Sposób wyceny</h2>
      <p style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginBottom: 16 }}>Wybierz model rozliczenia.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {opts.map(o => {
          const active = data.pricingMethod === o.value;
          return (
            <div key={o.value} onClick={() => update({ pricingMethod: o.value })} style={{ ...cardStyle(active), display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: active ? "var(--color-primary)" : "var(--color-foreground)", fontSize: 14, fontWeight: 600 }}>{o.label}</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {active && <div style={{ width: 10, height: 10, borderRadius: 5, background: "var(--color-primary)" }} />}
              </div>
            </div>
          );
        })}
      </div>
      <div style={sectionCard}>
        <SectionLabel>Kwota bazowa</SectionLabel>
        <input
          type="number"
          value={data.basePrice || ""}
          onChange={e => update({ basePrice: parseFloat(e.target.value) || 0 })}
          placeholder="0"
          style={{ ...inputStyle, fontSize: 20, fontWeight: 700, marginBottom: 10 }}
        />
        <SectionLabel>Waluta</SectionLabel>
        <div style={{ display: "flex", gap: 6 }}>
          {currencies.map(c => {
            const active = data.currency === c;
            return (
              <div key={c} onClick={() => update({ currency: c })} style={{ flex: 1, textAlign: "center", padding: "8px 2px", borderRadius: 8, border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`, background: active ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "var(--color-card)", cursor: "pointer" }}>
                <div style={{ color: active ? "var(--color-primary)" : "var(--color-muted-foreground)", fontSize: 11, fontWeight: 700 }}>{c}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ——— STEP 5: Termin
function StepTermin({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  const opts: { value: DeadlineType; label: string }[] = [
    { value: "single", label: "Jedna data" },
    { value: "range", label: "Od – do" },
    { value: "stages", label: "Etapy" },
    { value: "cyclic", label: "Cyklicznie" },
    { value: "tbd", label: "Do uzgodnienia" },
  ];
  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Termin</h2>
      <p style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginBottom: 16 }}>Kiedy ma być wykonana umowa?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {opts.map(o => {
          const active = data.deadlineType === o.value;
          return (
            <div key={o.value} onClick={() => update({ deadlineType: o.value })} style={{ ...cardStyle(active), display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ color: active ? "var(--color-primary)" : "var(--color-foreground)", fontSize: 14, fontWeight: 600, flex: 1 }}>{o.label}</div>
              <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {active && <div style={{ width: 10, height: 10, borderRadius: 5, background: "var(--color-primary)" }} />}
              </div>
            </div>
          );
        })}
      </div>
      {data.deadlineType === "single" && (
        <div style={sectionCard}>
          <SectionLabel>Data realizacji</SectionLabel>
          <input type="date" value={data.deadlineSingle} onChange={e => update({ deadlineSingle: e.target.value })} style={inputStyle} />
        </div>
      )}
      {data.deadlineType === "range" && (
        <div style={sectionCard}>
          <SectionLabel>Od</SectionLabel>
          <input type="date" value={data.deadlineFrom} onChange={e => update({ deadlineFrom: e.target.value })} style={{ ...inputStyle, marginBottom: 10 }} />
          <SectionLabel>Do</SectionLabel>
          <input type="date" value={data.deadlineTo} onChange={e => update({ deadlineTo: e.target.value })} style={inputStyle} />
        </div>
      )}
      {data.deadlineType === "cyclic" && (
        <div style={sectionCard}>
          <SectionLabel>Pierwsza realizacja</SectionLabel>
          <input type="date" value={data.deadlineFrom} onChange={e => update({ deadlineFrom: e.target.value })} style={{ ...inputStyle, marginBottom: 10 }} />
          <SectionLabel>Koniec cyklu</SectionLabel>
          <input type="date" value={data.deadlineTo} onChange={e => update({ deadlineTo: e.target.value })} style={inputStyle} />
        </div>
      )}
      {data.deadlineType === "tbd" && (
        <div style={{ ...sectionCard, background: "rgba(245,158,11,0.08)", border: "1px solid #f59e0b" }}>
          <div style={{ color: "#f59e0b", fontSize: 13, fontWeight: 600 }}>Termin zostanie ustalony odrębnie przez strony.</div>
        </div>
      )}
    </div>
  );
}

// ——— STEP 6: Zakres i szczegóły
function StepZakres({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  const toggleInstallation = (name: string) => {
    const list = data.scopeInstallations.includes(name)
      ? data.scopeInstallations.filter(x => x !== name)
      : [...data.scopeInstallations, name];
    update({ scopeInstallations: list });
  };

  if (data.category === "usluga") return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Zakres usługi</h2>
      <div style={{ marginBottom: 12 }}>
        <SectionLabel>Co ma być wykonane?</SectionLabel>
        <textarea value={data.scopeDescription} onChange={e => update({ scopeDescription: e.target.value })} placeholder="Opisz zakres prac..." style={textareaStyle} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <SectionLabel>Gdzie?</SectionLabel>
        <input value={data.scopeLocation} onChange={e => update({ scopeLocation: e.target.value })} placeholder="Adres lub lokalizacja" style={inputStyle} />
      </div>
      <div style={sectionCard}>
        <Toggle on={data.scopeMaterials} onChange={v => update({ scopeMaterials: v })} label="Potrzebne materiały" />
        <Toggle on={data.scopeWarranty} onChange={v => update({ scopeWarranty: v })} label="Gwarancja na wykonanie" />
        <Toggle on={data.scopeAcceptance} onChange={v => update({ scopeAcceptance: v })} label="Wymagany odbiór" />
      </div>
    </div>
  );

  if (data.category === "remont") return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Zakres remontu</h2>
      <div style={{ marginBottom: 12 }}>
        <SectionLabel>Zakres prac</SectionLabel>
        <textarea value={data.scopeDescription} onChange={e => update({ scopeDescription: e.target.value })} placeholder="Opisz prace remontowe..." style={textareaStyle} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <SectionLabel>Instalacje</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Elektryka", "Hydraulika", "Wentylacja", "Ogrzewanie"].map(inst => {
            const active = data.scopeInstallations.includes(inst);
            return (
              <div key={inst} onClick={() => toggleInstallation(inst)} style={{ padding: "6px 14px", borderRadius: 20, border: active ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)", background: active ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "var(--color-card)", cursor: "pointer", fontSize: 13, color: active ? "var(--color-primary)" : "var(--color-muted-foreground)", fontWeight: active ? 700 : 400 }}>
                {inst}
              </div>
            );
          })}
        </div>
      </div>
      <div style={sectionCard}>
        <Toggle on={data.scopeMaterials} onChange={v => update({ scopeMaterials: v })} label="Materiały wliczone" />
        <Toggle on={data.scopeDemolition} onChange={v => update({ scopeDemolition: v })} label="Demontaż" />
        <Toggle on={data.scopeCleaning} onChange={v => update({ scopeCleaning: v })} label="Sprzątanie po pracach" />
        <Toggle on={data.scopeBeforePhotos} onChange={v => update({ scopeBeforePhotos: v })} label="Zdjęcia przed pracą" />
      </div>
    </div>
  );

  if (data.category === "sprzedaz") return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Opis przedmiotu</h2>
      <div style={{ marginBottom: 12 }}>
        <SectionLabel>Opis przedmiotu</SectionLabel>
        <textarea value={data.itemDescription} onChange={e => update({ itemDescription: e.target.value })} placeholder="Opisz przedmiot sprzedaży..." style={textareaStyle} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <SectionLabel>Stan przedmiotu</SectionLabel>
        <input value={data.itemCondition} onChange={e => update({ itemCondition: e.target.value })} placeholder="np. Nowy, Używany, Uszkodzony" style={inputStyle} />
      </div>
      <div>
        <SectionLabel>Numer seryjny / VIN / IMEI</SectionLabel>
        <input value={data.itemSerial} onChange={e => update({ itemSerial: e.target.value })} placeholder="Opcjonalnie" style={inputStyle} />
      </div>
    </div>
  );

  if (data.category === "wynajem") return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Opis przedmiotu/lokalu</h2>
      <div style={{ marginBottom: 12 }}>
        <SectionLabel>Opis</SectionLabel>
        <textarea value={data.rentalDescription} onChange={e => update({ rentalDescription: e.target.value })} placeholder="Opis lokalu lub przedmiotu wynajmu..." style={textareaStyle} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <SectionLabel>Stan przed wydaniem</SectionLabel>
        <input value={data.rentalConditionBefore} onChange={e => update({ rentalConditionBefore: e.target.value })} placeholder="np. Dobry, po remoncie" style={inputStyle} />
      </div>
      <div style={sectionCard}>
        <Toggle on={data.rentalProtocol} onChange={v => update({ rentalProtocol: v })} label="Protokół wydania i zwrotu" />
      </div>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Własna umowa</h2>
      <div style={{ marginBottom: 12 }}>
        <SectionLabel>Nazwa umowy</SectionLabel>
        <input value={data.customTitle} onChange={e => update({ customTitle: e.target.value })} placeholder="np. Umowa o świadczenie usług" style={inputStyle} />
      </div>
      <div>
        <SectionLabel>Opis ustaleń</SectionLabel>
        <textarea value={data.customDesc} onChange={e => update({ customDesc: e.target.value })} placeholder="Opisz wszystkie ustalenia..." style={{ ...textareaStyle, minHeight: 120 }} />
      </div>
    </div>
  );
}

// ——— STEP 7a: Pomieszczenia (remont)
function StepPomieszczenia({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  const presets = ["Salon", "Sypialnia", "Łazienka", "Kuchnia", "Przedpokój", "Gabinet", "Taras", "Garaż", "Biuro", "Piwnica"];
  const [customName, setCustomName] = useState("");

  const addRoom = (name: string) => {
    if (!name.trim()) return;
    update({ rooms: [...data.rooms, { id: Date.now().toString(), name: name.trim(), floorArea: 0, wallArea: 0, ceiling: false, floor: false, notes: "" }] });
    setCustomName("");
  };
  const updateRoom = (id: string, patch: Partial<Room>) =>
    update({ rooms: data.rooms.map(r => r.id === id ? { ...r, ...patch } : r) });
  const removeRoom = (id: string) =>
    update({ rooms: data.rooms.filter(r => r.id !== id) });

  const totalFloor = data.rooms.reduce((s, r) => s + r.floorArea, 0);
  const totalWall = data.rooms.reduce((s, r) => s + r.wallArea, 0);

  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Pomieszczenia</h2>
      {data.rooms.map(r => (
        <div key={r.id} style={{ ...sectionCard, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
            <span style={{ flex: 1, color: "var(--color-foreground)", fontSize: 15, fontWeight: 700 }}>{r.name}</span>
            <span onClick={() => removeRoom(r.id)} style={{ color: "var(--color-muted-foreground)", cursor: "pointer", fontSize: 18 }}>✕</span>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <SectionLabel>Podłoga (m²)</SectionLabel>
              <input type="number" value={r.floorArea || ""} onChange={e => updateRoom(r.id, { floorArea: parseFloat(e.target.value) || 0 })} placeholder="0" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <SectionLabel>Ściany (m²)</SectionLabel>
              <input type="number" value={r.wallArea || ""} onChange={e => updateRoom(r.id, { wallArea: parseFloat(e.target.value) || 0 })} placeholder="0" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <Toggle on={r.ceiling} onChange={v => updateRoom(r.id, { ceiling: v })} label="Sufit" />
            <Toggle on={r.floor} onChange={v => updateRoom(r.id, { floor: v })} label="Podłoga" />
          </div>
          <input value={r.notes} onChange={e => updateRoom(r.id, { notes: e.target.value })} placeholder="Uwagi..." style={inputStyle} />
        </div>
      ))}

      <div style={sectionCard}>
        <SectionLabel>Dodaj pomieszczenie</SectionLabel>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input value={customName} onChange={e => setCustomName(e.target.value)} onKeyDown={e => e.key === "Enter" && addRoom(customName)} placeholder="Własna nazwa..." style={{ ...inputStyle, flex: 1 }} />
          <button onClick={() => addRoom(customName)} style={{ ...btnPrimary, width: 44, flexShrink: 0 }}>+</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {presets.map(p => (
            <div key={p} onClick={() => addRoom(p)} style={{ padding: "6px 12px", borderRadius: 16, border: "1px solid var(--color-border)", background: "var(--color-card)", cursor: "pointer", fontSize: 12, color: "var(--color-muted-foreground)" }}>{p}</div>
          ))}
        </div>
      </div>

      {data.rooms.length > 0 && (
        <div style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)", borderRadius: 12, border: "1.5px solid var(--color-primary)", padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "var(--color-muted-foreground)", fontSize: 13 }}>Łącznie podłogi</span>
            <span style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: 13 }}>{totalFloor} m²</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--color-muted-foreground)", fontSize: 13 }}>Łącznie ściany</span>
            <span style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: 13 }}>{totalWall} m²</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ——— STEP 7b: Szczegóły sprzedaż/elektronika
function StepSzczegolySprzedaz({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  const isElectronics = data.subcategory === "Elektronika";
  const el = data.electronics;
  const updateEl = (patch: Partial<ElectronicsDetails>) => update({ electronics: { ...el, ...patch } });
  const deviceTypes = ["Telefon", "Laptop", "Konsola", "Tablet", "TV", "Inne"];
  const accessories = ["Ładowarka", "Pudełko", "Kabel", "Gwarancja"];

  if (!isElectronics) return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Szczegóły sprzedaży</h2>
      <p style={{ color: "var(--color-muted-foreground)", fontSize: 13 }}>Szczegóły przedmiotu już uzupełnione w poprzednim kroku.</p>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Szczegóły urządzenia</h2>
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>Typ urządzenia</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {deviceTypes.map(t => {
            const active = el.type === t.toLowerCase();
            return (
              <div key={t} onClick={() => updateEl({ type: t.toLowerCase() as ElectronicsDetails["type"] })} style={{ padding: "8px 16px", borderRadius: 20, border: active ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)", background: active ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "var(--color-card)", cursor: "pointer", fontSize: 13, color: active ? "var(--color-primary)" : "var(--color-muted-foreground)", fontWeight: active ? 700 : 400 }}>
                {t}
              </div>
            );
          })}
        </div>
      </div>

      {(el.type === "telefon" || el.type === "tablet") && (
        <div style={sectionCard}>
          <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <div style={{ flex: 1 }}><SectionLabel>Marka</SectionLabel><input value={el.brand ?? ""} onChange={e => updateEl({ brand: e.target.value })} placeholder="np. Apple" style={inputStyle} /></div>
            <div style={{ flex: 1 }}><SectionLabel>Model</SectionLabel><input value={el.model ?? ""} onChange={e => updateEl({ model: e.target.value })} placeholder="np. iPhone 15" style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: 8 }}><SectionLabel>IMEI</SectionLabel><input value={el.imei ?? ""} onChange={e => updateEl({ imei: e.target.value })} placeholder="15 cyfr" style={inputStyle} /></div>
          <div style={{ marginBottom: 8 }}>
            <SectionLabel>Stan</SectionLabel>
            <div style={{ display: "flex", gap: 6 }}>
              {["nowy", "bardzo_dobry", "uzywany", "uszkodzony"].map(c => {
                const labels: Record<string, string> = { nowy: "Nowy", bardzo_dobry: "B. dobry", uzywany: "Używany", uszkodzony: "Uszkodzony" };
                const active = el.condition === c;
                return <div key={c} onClick={() => updateEl({ condition: c as ElectronicsDetails["condition"] })} style={{ flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 8, border: active ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)", background: active ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "var(--color-card)", cursor: "pointer", fontSize: 11, color: active ? "var(--color-primary)" : "var(--color-muted-foreground)", fontWeight: active ? 700 : 400 }}>{labels[c]}</div>;
              })}
            </div>
          </div>
          <Toggle on={el.icloudLock ?? false} onChange={v => updateEl({ icloudLock: v })} label="Blokada iCloud/Google" />
          <Toggle on={el.screenCrack ?? false} onChange={v => updateEl({ screenCrack: v })} label="Pęknięcia ekranu" />
          <Toggle on={el.loggedOut ?? false} onChange={v => updateEl({ loggedOut: v })} label="Wylogowany z kont" />
          <div style={{ marginTop: 8 }}><SectionLabel>Stan baterii (%)</SectionLabel><input type="number" value={el.batteryPct ?? ""} onChange={e => updateEl({ batteryPct: parseInt(e.target.value) || 0 })} placeholder="np. 85" style={inputStyle} /></div>
          <div style={{ marginTop: 8 }}>
            <SectionLabel>Akcesoria</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {accessories.map(acc => {
                const active = (el.accessories ?? []).includes(acc);
                return <div key={acc} onClick={() => { const list = active ? (el.accessories ?? []).filter(a => a !== acc) : [...(el.accessories ?? []), acc]; updateEl({ accessories: list }); }} style={{ padding: "6px 14px", borderRadius: 20, border: active ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)", background: active ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "var(--color-card)", cursor: "pointer", fontSize: 12, color: active ? "var(--color-primary)" : "var(--color-muted-foreground)", fontWeight: active ? 700 : 400 }}>{acc}</div>;
              })}
            </div>
          </div>
        </div>
      )}

      {el.type === "laptop" && (
        <div style={sectionCard}>
          <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <div style={{ flex: 1 }}><SectionLabel>Marka</SectionLabel><input value={el.brand ?? ""} onChange={e => updateEl({ brand: e.target.value })} placeholder="np. Dell" style={inputStyle} /></div>
            <div style={{ flex: 1 }}><SectionLabel>Model</SectionLabel><input value={el.model ?? ""} onChange={e => updateEl({ model: e.target.value })} placeholder="np. XPS 15" style={inputStyle} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <div style={{ flex: 1 }}><SectionLabel>Procesor</SectionLabel><input value={el.processor ?? ""} onChange={e => updateEl({ processor: e.target.value })} placeholder="np. i7-12700H" style={inputStyle} /></div>
            <div style={{ flex: 1 }}><SectionLabel>RAM</SectionLabel><input value={el.ram ?? ""} onChange={e => updateEl({ ram: e.target.value })} placeholder="np. 16GB" style={inputStyle} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <div style={{ flex: 1 }}><SectionLabel>Dysk</SectionLabel><input value={el.storage ?? ""} onChange={e => updateEl({ storage: e.target.value })} placeholder="np. 512GB SSD" style={inputStyle} /></div>
            <div style={{ flex: 1 }}><SectionLabel>Bateria (%)</SectionLabel><input type="number" value={el.batteryPct ?? ""} onChange={e => updateEl({ batteryPct: parseInt(e.target.value) || 0 })} placeholder="np. 90" style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: 8 }}><SectionLabel>System operacyjny</SectionLabel><input value={el.os ?? ""} onChange={e => updateEl({ os: e.target.value })} placeholder="np. Windows 11" style={inputStyle} /></div>
          <Toggle on={el.charger ?? false} onChange={v => updateEl({ charger: v })} label="Ładowarka w zestawie" />
        </div>
      )}

      {el.type === "konsola" && (
        <div style={sectionCard}>
          <div style={{ marginBottom: 8 }}>
            <SectionLabel>Model konsoli</SectionLabel>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["PS5", "Xbox", "Switch", "Inne"].map(m => {
                const active = el.model === m;
                return <div key={m} onClick={() => updateEl({ model: m })} style={{ padding: "8px 16px", borderRadius: 8, border: active ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)", background: active ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "var(--color-card)", cursor: "pointer", fontSize: 13, color: active ? "var(--color-primary)" : "var(--color-muted-foreground)", fontWeight: active ? 700 : 400 }}>{m}</div>;
              })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <div style={{ flex: 1 }}><SectionLabel>Pady (szt.)</SectionLabel><input type="number" value={el.consolePads ?? ""} onChange={e => updateEl({ consolePads: parseInt(e.target.value) || 0 })} placeholder="0" style={inputStyle} /></div>
            <div style={{ flex: 1 }}><SectionLabel>Gry (szt.)</SectionLabel><input type="number" value={el.consoleGames ?? ""} onChange={e => updateEl({ consoleGames: parseInt(e.target.value) || 0 })} placeholder="0" style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: 8 }}><SectionLabel>Stan napędu</SectionLabel><input value={el.consoleDrive ?? ""} onChange={e => updateEl({ consoleDrive: e.target.value })} placeholder="np. Sprawny" style={inputStyle} /></div>
          <Toggle on={el.consoleOnline ?? false} onChange={v => updateEl({ consoleOnline: v })} label="Działa online" />
        </div>
      )}
    </div>
  );
}

// ——— STEP 7c: Szczegóły wynajmu
function StepSzczegolyWynajem({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Szczegóły wynajmu</h2>
      <div style={sectionCard}>
        <SectionLabel>Okres najmu</SectionLabel>
        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <div style={{ flex: 1 }}><SectionLabel>Od</SectionLabel><input type="date" value={data.rentalFrom} onChange={e => update({ rentalFrom: e.target.value })} style={inputStyle} /></div>
          <div style={{ flex: 1 }}><SectionLabel>Do</SectionLabel><input type="date" value={data.rentalTo} onChange={e => update({ rentalTo: e.target.value })} style={inputStyle} /></div>
        </div>
        <SectionLabel>Kaucja ({data.currency})</SectionLabel>
        <input type="number" value={data.rentalDeposit || ""} onChange={e => update({ rentalDeposit: parseFloat(e.target.value) || 0 })} placeholder="0" style={inputStyle} />
      </div>
      <div style={sectionCard}>
        <SectionLabel>Warunki zwrotu</SectionLabel>
        <textarea value={data.rentalReturnNotes} onChange={e => update({ rentalReturnNotes: e.target.value })} placeholder="Opisz warunki zwrotu przedmiotu..." style={textareaStyle} />
      </div>
      <div style={sectionCard}>
        <Toggle on={data.rentalDamageLiability} onChange={v => update({ rentalDamageLiability: v })} label="Odpowiedzialność za szkody" />
      </div>
    </div>
  );
}

// ——— STEP 8: Dodatkowe pozycje
function StepDodatki({ data, update, additionalTotal }: { data: WizardData; update: (p: Partial<WizardData>) => void; additionalTotal: number }) {
  const [customName, setCustomName] = useState("");

  const addItem = (name: string) => {
    if (!name.trim()) return;
    update({ additionalItems: [...data.additionalItems, { id: Date.now().toString(), name: name.trim(), qty: 1, price: 0, payer: "client", inDeposit: false }] });
    setCustomName("");
  };
  const updateItem = (id: string, patch: Partial<AdditionalItem>) =>
    update({ additionalItems: data.additionalItems.map(i => i.id === id ? { ...i, ...patch } : i) });
  const removeItem = (id: string) =>
    update({ additionalItems: data.additionalItems.filter(i => i.id !== id) });
  const existingNames = data.additionalItems.map(i => i.name);

  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Dodatkowe pozycje</h2>
      <p style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginBottom: 16 }}>Opcjonalne pozycje dodatkowe do umowy.</p>

      {data.additionalItems.map(item => (
        <div key={item.id} style={sectionCard}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span style={{ flex: 1, color: "var(--color-foreground)", fontSize: 14, fontWeight: 600 }}>{item.name}</span>
            <span onClick={() => removeItem(item.id)} style={{ color: "var(--color-muted-foreground)", cursor: "pointer", fontSize: 18 }}>✕</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1 }}><SectionLabel>Ilość</SectionLabel><input type="number" value={item.qty} onChange={e => updateItem(item.id, { qty: parseInt(e.target.value) || 0 })} style={inputStyle} /></div>
            <div style={{ flex: 1 }}><SectionLabel>Cena ({data.currency})</SectionLabel><input type="number" value={item.price || ""} onChange={e => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })} placeholder="0" style={inputStyle} /></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <SectionLabel>Kto płaci</SectionLabel>
              <div style={{ display: "flex", gap: 6 }}>
                {[{ v: "client", l: "Zamawiający" }, { v: "contractor", l: "Wykonawca" }].map(o => {
                  const active = item.payer === o.v;
                  return <div key={o.v} onClick={() => updateItem(item.id, { payer: o.v as "client" | "contractor" })} style={{ flex: 1, textAlign: "center", padding: "6px 4px", borderRadius: 8, border: active ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)", background: active ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "var(--color-card)", cursor: "pointer", fontSize: 11, color: active ? "var(--color-primary)" : "var(--color-muted-foreground)", fontWeight: active ? 700 : 400 }}>{o.l}</div>;
                })}
              </div>
            </div>
            <div style={{ flex: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
              <Toggle on={item.inDeposit} onChange={v => updateItem(item.id, { inDeposit: v })} label="W depozycie" />
            </div>
          </div>
        </div>
      ))}

      <div style={sectionCard}>
        <SectionLabel>Szybkie dodanie</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {ADDITIONAL_PRESETS.filter(p => !existingNames.includes(p)).map(p => (
            <div key={p} onClick={() => addItem(p)} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid var(--color-border)", background: "var(--color-card)", cursor: "pointer", fontSize: 12, color: "var(--color-muted-foreground)" }}>{p}</div>
          ))}
        </div>
        <SectionLabel>Dodaj własną</SectionLabel>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={customName} onChange={e => setCustomName(e.target.value)} onKeyDown={e => e.key === "Enter" && addItem(customName)} placeholder="Nazwa pozycji..." style={{ ...inputStyle, flex: 1 }} />
          <button onClick={() => addItem(customName)} style={{ ...btnPrimary, width: 44, flexShrink: 0 }}>+</button>
        </div>
      </div>

      {additionalTotal > 0 && (
        <div style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)", borderRadius: 12, border: "1.5px solid var(--color-primary)", padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "var(--color-muted-foreground)", fontSize: 13 }}>Suma dodatków</span>
          <span style={{ color: "var(--color-primary)", fontSize: 18, fontWeight: 800 }}>{additionalTotal.toLocaleString("pl-PL")} {data.currency}</span>
        </div>
      )}
    </div>
  );
}

// ——— STEP 9: Wycena końcowa
function StepWycenaKoncowa({ data, totalPrice, additionalTotal, goBack }: { data: WizardData; update: (p: Partial<WizardData>) => void; totalPrice: number; additionalTotal: number; goBack: () => void }) {
  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Wycena końcowa</h2>
      <div style={sectionCard}>
        {data.basePrice > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid var(--color-border)", marginBottom: 8 }}>
            <span style={{ color: "var(--color-muted-foreground)", fontSize: 14 }}>Robocizna / cena bazowa</span>
            <span style={{ color: "var(--color-foreground)", fontSize: 14, fontWeight: 600 }}>{data.basePrice.toLocaleString("pl-PL")} {data.currency}</span>
          </div>
        )}
        {data.scopeMaterials && (
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid var(--color-border)", marginBottom: 8 }}>
            <span style={{ color: "var(--color-muted-foreground)", fontSize: 14 }}>Materiały</span>
            <span style={{ color: "var(--color-foreground)", fontSize: 14, fontWeight: 600 }}>wliczone</span>
          </div>
        )}
        {data.additionalItems.map(item => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 6, marginBottom: 6 }}>
            <span style={{ color: "var(--color-muted-foreground)", fontSize: 13 }}>{item.name} (×{item.qty})</span>
            <span style={{ color: "var(--color-foreground)", fontSize: 13, fontWeight: 500 }}>{(item.qty * item.price).toLocaleString("pl-PL")} {data.currency}</span>
          </div>
        ))}
        {data.rentalDeposit > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid var(--color-border)", marginBottom: 8 }}>
            <span style={{ color: "var(--color-muted-foreground)", fontSize: 14 }}>Kaucja/depozyt</span>
            <span style={{ color: "var(--color-foreground)", fontSize: 14, fontWeight: 600 }}>{data.rentalDeposit.toLocaleString("pl-PL")} {data.currency}</span>
          </div>
        )}
        <div style={{ height: 1, background: "var(--color-border)", margin: "12px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "var(--color-foreground)", fontSize: 16, fontWeight: 800 }}>RAZEM</span>
          <span style={{ color: "var(--color-primary)", fontSize: 28, fontWeight: 800 }}>{totalPrice.toLocaleString("pl-PL")} {data.currency}</span>
        </div>
      </div>
      <button onClick={goBack} style={{ ...btnSecondary, width: "100%", marginTop: 8 }}>
        ← Edytuj wycenę
      </button>
    </div>
  );
}

// ——— STEP 10: Płatność i depozyt
function StepPlatnosc({ data, update, totalPrice }: { data: WizardData; update: (p: Partial<WizardData>) => void; totalPrice: number }) {
  const paymentMethods: { value: PaymentMethodType; label: string; icon: string; desc: string }[] = [
    { value: "upfront", label: "Płatność z góry", icon: "💵", desc: "Cała kwota przed realizacją" },
    { value: "after", label: "Po wykonaniu", icon: "✅", desc: "Płatność po odbiorze prac" },
    { value: "stages", label: "Etapami", icon: "📋", desc: "Kolejne płatności za etapy" },
    { value: "deposit", label: "Depozyt", icon: "🔒", desc: "Środki trzymane w depozycie" },
    { value: "partial_deposit", label: "Część z góry + depozyt", icon: "📦", desc: "Zaliczka i reszta w depozycie" },
  ];

  const toggleDepositCover = (v: string) => {
    const list = data.depositCovers.includes(v)
      ? data.depositCovers.filter(x => x !== v)
      : [...data.depositCovers, v];
    update({ depositCovers: list });
  };

  const depositAmount = data.paymentMethod === "deposit" ? totalPrice
    : data.paymentMethod === "partial_deposit" ? totalPrice * 0.7
    : 0;

  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Płatność i depozyt</h2>
      <p style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginBottom: 16 }}>Jak zostanie podzielona kwota {totalPrice > 0 ? `${totalPrice.toLocaleString("pl-PL")} ${data.currency}` : ""}?</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {paymentMethods.map(pm => {
          const active = data.paymentMethod === pm.value;
          return (
            <div key={pm.value} onClick={() => update({ paymentMethod: pm.value })} style={{ ...cardStyle(active), display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>{pm.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: active ? "var(--color-primary)" : "var(--color-foreground)", fontSize: 14, fontWeight: 600 }}>{pm.label}</div>
                <div style={{ color: "var(--color-muted-foreground)", fontSize: 12, marginTop: 2 }}>{pm.desc}</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {active && <div style={{ width: 10, height: 10, borderRadius: 5, background: "var(--color-primary)" }} />}
              </div>
            </div>
          );
        })}
      </div>

      {(data.paymentMethod === "deposit" || data.paymentMethod === "partial_deposit") && (
        <div style={sectionCard}>
          <SectionLabel>Co ma być objęte depozytem?</SectionLabel>
          {DEPOSIT_COVERS_OPTIONS.map(opt => (
            <div key={opt} onClick={() => toggleDepositCover(opt)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--color-border)", cursor: "pointer" }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${data.depositCovers.includes(opt) ? "var(--color-primary)" : "var(--color-border)"}`, background: data.depositCovers.includes(opt) ? "var(--color-primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {data.depositCovers.includes(opt) && <span style={{ color: "#fff", fontSize: 12, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ color: "var(--color-foreground)", fontSize: 14 }}>{opt}</span>
            </div>
          ))}
          {depositAmount > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-muted-foreground)", fontSize: 13 }}>Kwota depozytu</span>
              <span style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: 14 }}>{depositAmount.toLocaleString("pl-PL")} {data.currency}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ——— STEP 11: Warunki wykonania
function StepWarunki({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Warunki wykonania</h2>

      <div style={sectionCard}>
        <SectionLabel>Kto kupuje materiały?</SectionLabel>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ v: "client", l: "Zamawiający" }, { v: "contractor", l: "Wykonawca" }, { v: "split", l: "Podział" }].map(o => {
            const active = data.materialsBy === o.v;
            return <div key={o.v} onClick={() => update({ materialsBy: o.v as "client" | "contractor" | "split" })} style={{ flex: 1, textAlign: "center", padding: "10px 4px", borderRadius: 10, border: active ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)", background: active ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "var(--color-card)", cursor: "pointer", fontSize: 12, color: active ? "var(--color-primary)" : "var(--color-muted-foreground)", fontWeight: active ? 700 : 400 }}>{o.l}</div>;
          })}
        </div>
      </div>

      <div style={sectionCard}>
        <SectionLabel>Kto odpowiada za transport?</SectionLabel>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ v: "client", l: "Zamawiający" }, { v: "contractor", l: "Wykonawca" }].map(o => {
            const active = data.transportBy === o.v;
            return <div key={o.v} onClick={() => update({ transportBy: o.v as "client" | "contractor" })} style={{ flex: 1, textAlign: "center", padding: "10px 4px", borderRadius: 10, border: active ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)", background: active ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "var(--color-card)", cursor: "pointer", fontSize: 12, color: active ? "var(--color-primary)" : "var(--color-muted-foreground)", fontWeight: active ? 700 : 400 }}>{o.l}</div>;
          })}
        </div>
      </div>

      <div style={sectionCard}>
        <Toggle on={data.weekendWork} onChange={v => update({ weekendWork: v })} label="Praca w weekend" />
        <Toggle on={data.requireApproval} onChange={v => update({ requireApproval: v })} label="Dodatkowe prace wymagają akceptacji" />
        <Toggle on={data.priceChangeApproval} onChange={v => update({ priceChangeApproval: v })} label="Zmiany ceny wymagają akceptacji obu stron" />
        <Toggle on={data.warranty} onChange={v => update({ warranty: v })} label="Gwarancja na wykonanie" />
        {data.warranty && (
          <div style={{ paddingTop: 8 }}>
            <SectionLabel>Gwarancja — ile dni?</SectionLabel>
            <input type="number" value={data.warrantyDays} onChange={e => update({ warrantyDays: parseInt(e.target.value) || 0 })} style={inputStyle} />
          </div>
        )}
        <Toggle on={data.latePenalty} onChange={v => update({ latePenalty: v })} label="Kara za opóźnienie" />
        {data.latePenalty && (
          <div style={{ paddingTop: 8 }}>
            <SectionLabel>Kara za opóźnienie (zł/dzień)</SectionLabel>
            <input type="number" value={data.latePenaltyAmount} onChange={e => update({ latePenaltyAmount: parseFloat(e.target.value) || 0 })} style={inputStyle} />
          </div>
        )}
      </div>
    </div>
  );
}

// ——— STEP 12: Protokół odbioru
function StepProtokol({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  const title = data.category === "sprzedaz"
    ? "Potwierdzenie przekazania rzeczy"
    : data.category === "wynajem"
    ? "Protokół wydania i zwrotu"
    : "Protokół odbioru";

  const statuses: { value: ProtocolStatus; label: string; color: string }[] = [
    { value: "accepted", label: "Odebrane bez uwag", color: "#22c55e" },
    { value: "with_notes", label: "Odebrane z uwagami", color: "#f59e0b" },
    { value: "needs_fixes", label: "Wymaga poprawek", color: "#ef4444" },
    { value: "rejected", label: "Odrzucone", color: "#6b7280" },
  ];

  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>{title}</h2>

      <div style={{ marginBottom: 16 }}>
        <SectionLabel>Status odbioru</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {statuses.map(s => {
            const active = data.protocolStatus === s.value;
            return (
              <div key={s.value} onClick={() => update({ protocolStatus: s.value })} style={{ ...cardStyle(active), display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 12, height: 12, borderRadius: 6, background: s.color, flexShrink: 0 }} />
                <span style={{ flex: 1, color: active ? "var(--color-primary)" : "var(--color-foreground)", fontSize: 14, fontWeight: active ? 700 : 400 }}>{s.label}</span>
                <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {active && <div style={{ width: 10, height: 10, borderRadius: 5, background: "var(--color-primary)" }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={sectionCard}>
        <Toggle on={data.beforePhotos} onChange={v => update({ beforePhotos: v })} label="Zdjęcia przed" />
        <Toggle on={data.afterPhotos} onChange={v => update({ afterPhotos: v })} label="Zdjęcia po" />
      </div>

      <div style={{ marginBottom: 12 }}>
        <SectionLabel>Opis wykonania</SectionLabel>
        <textarea value={data.protocolDesc} onChange={e => update({ protocolDesc: e.target.value })} placeholder="Opisz wykonane prace..." style={textareaStyle} />
      </div>

      {(data.protocolStatus === "with_notes" || data.protocolStatus === "needs_fixes") && (
        <div style={{ marginBottom: 12 }}>
          <SectionLabel>Lista usterek</SectionLabel>
          <textarea value={data.protocolIssues} onChange={e => update({ protocolIssues: e.target.value })} placeholder="Wypisz usterki..." style={textareaStyle} />
          <SectionLabel>Termin poprawek</SectionLabel>
          <input type="date" value={data.protocolFixDeadline} onChange={e => update({ protocolFixDeadline: e.target.value })} style={inputStyle} />
        </div>
      )}

      <div style={sectionCard}>
        <Toggle on={data.releaseDeposit} onChange={v => update({ releaseDeposit: v })} label="Wypłata depozytu" />
      </div>
    </div>
  );
}

// ——— STEP 13: Przegląd
function StepPrzeglad({ data, steps, goToStep, warnings, totalPrice }: { data: WizardData; steps: { id: string; label: string }[]; goToStep: (i: number) => void; warnings: string[]; totalPrice: number }) {
  const [expanded, setExpanded] = useState<string[]>(["podstawy"]);
  const toggle = (id: string) => setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const Section = ({ id, title, stepId, children }: { id: string; title: string; stepId: string; children: React.ReactNode }) => {
    const stepIdx = steps.findIndex(s => s.id === stepId);
    const open = expanded.includes(id);
    return (
      <div style={sectionCard}>
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => toggle(id)}>
          <span style={{ flex: 1, color: "var(--color-foreground)", fontSize: 14, fontWeight: 700 }}>{title}</span>
          {stepIdx >= 0 && <span onClick={e => { e.stopPropagation(); goToStep(stepIdx); }} style={{ color: "var(--color-primary)", fontSize: 12, fontWeight: 600, cursor: "pointer", marginRight: 12 }}>Edytuj →</span>}
          <span style={{ color: "var(--color-muted-foreground)", fontSize: 16 }}>{open ? "▲" : "▼"}</span>
        </div>
        {open && <div style={{ marginTop: 12 }}>{children}</div>}
      </div>
    );
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 6 }}>
      <span style={{ color: "var(--color-muted-foreground)", fontSize: 13 }}>{label}</span>
      <span style={{ color: "var(--color-foreground)", fontSize: 13, fontWeight: 500, textAlign: "right", marginLeft: 8, maxWidth: "60%" }}>{value || "—"}</span>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Podsumowanie</h2>
      <p style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginBottom: 16 }}>Sprawdź wszystkie dane przed podpisaniem.</p>

      {warnings.length > 0 && (
        <div style={{ background: "rgba(245,158,11,0.1)", borderRadius: 10, border: "1px solid #f59e0b", padding: 12, marginBottom: 14 }}>
          <div style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>⚠️ Uwagi ({warnings.length})</div>
          {warnings.map(w => <div key={w} style={{ color: "#f59e0b", fontSize: 12, lineHeight: 1.8 }}>• {w}</div>)}
        </div>
      )}

      <Section id="podstawy" title="Kategoria i strony" stepId="kategoria">
        <Row label="Kategoria" value={data.category} />
        <Row label="Podkategoria" value={data.subcategory} />
        <Row label="Zleceniodawca" value={data.client.name} />
        <Row label="Wykonawca" value={data.contractor.name} />
      </Section>
      <Section id="wycena" title="Wycena" stepId="wycena">
        <Row label="Model wyceny" value={data.pricingMethod} />
        <Row label="Kwota bazowa" value={`${data.basePrice.toLocaleString("pl-PL")} ${data.currency}`} />
        {data.additionalItems.length > 0 && <Row label="Pozycje dodatkowe" value={`${data.additionalItems.length} pozycji`} />}
      </Section>
      <Section id="termin" title="Termin" stepId="termin">
        <Row label="Typ terminu" value={data.deadlineType} />
        <Row label="Data od" value={data.deadlineFrom || data.deadlineSingle} />
        <Row label="Data do" value={data.deadlineTo} />
      </Section>
      <Section id="warunki" title="Warunki" stepId="warunki">
        <Row label="Materiały" value={data.materialsBy === "client" ? "Zamawiający" : data.materialsBy === "contractor" ? "Wykonawca" : "Podział"} />
        <Row label="Gwarancja" value={data.warranty ? `${data.warrantyDays} dni` : "Nie"} />
        <Row label="Kara za opóźnienie" value={data.latePenalty ? `${data.latePenaltyAmount} zł/dzień` : "Nie"} />
      </Section>
      <Section id="platnosc" title="Płatność" stepId="platnosc">
        <Row label="Model płatności" value={data.paymentMethod} />
        <Row label="Depozyt obejmuje" value={data.depositCovers.join(", ")} />
      </Section>

      <div style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)", borderRadius: 12, border: "1.5px solid var(--color-primary)", padding: 20, textAlign: "center", margin: "16px 0 8px" }}>
        <div style={{ color: "var(--color-primary)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>Łączna kwota umowy</div>
        <div style={{ color: "var(--color-foreground)", fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>{totalPrice.toLocaleString("pl-PL")} {data.currency}</div>
      </div>
    </div>
  );
}

// ——— STEP 14: Podpis
function StepPodpis({ data, update, setSigned }: { data: WizardData; update: (p: Partial<WizardData>) => void; signed: boolean; setSigned: (v: boolean) => void }) {
  const [accepted, setAccepted] = useState(false);
  const myParty = data.myRole === "contractor" ? data.contractor : data.client;
  const otherParty = data.myRole === "contractor" ? data.client : data.contractor;
  const myLabel = data.myRole === "contractor"
    ? (data.category === "wynajem" ? "Wynajmujący" : data.category === "sprzedaz" ? "Sprzedający" : "Wykonawca")
    : (data.category === "wynajem" ? "Najemca" : data.category === "sprzedaz" ? "Kupujący" : "Zleceniodawca");
  const otherLabel = data.myRole === "contractor"
    ? (data.category === "wynajem" ? "Najemca" : data.category === "sprzedaz" ? "Kupujący" : "Zleceniodawca")
    : (data.category === "wynajem" ? "Wynajmujący" : data.category === "sprzedaz" ? "Sprzedający" : "Wykonawca");
  const hasOtherContact = !!(otherParty.email || otherParty.phone || data.inviteContact);

  return (
    <div>
      <h2 style={{ color: "var(--color-foreground)", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Podpis i zaproszenie</h2>
      <p style={{ color: "var(--color-muted-foreground)", fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
        Podpisz jako {myLabel.toLowerCase()} i zaproś drugą stronę.
      </p>

      {/* Mój podpis */}
      <div style={{ ...sectionCard, border: "1.5px solid var(--color-primary)", marginBottom: 16 }}>
        <SectionLabel>Twój podpis ({myLabel})</SectionLabel>
        <div style={{ color: "var(--color-foreground)", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
          {myParty.name || "—"}
        </div>
        <div
          onClick={() => setAccepted(v => !v)}
          style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
            border: `2px solid ${accepted ? "var(--color-primary)" : "var(--color-border)"}`,
            background: accepted ? "var(--color-primary)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {accepted && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{ color: "var(--color-foreground)", fontSize: 13, lineHeight: 1.5 }}>
            Akceptuję warunki umowy i potwierdzam podpisanie jako {myLabel.toLowerCase()}.
          </span>
        </div>
      </div>

      {/* Zaproszenie drugiej strony */}
      <div style={sectionCard}>
        <SectionLabel>Zaproś {otherLabel.toLowerCase()}</SectionLabel>
        {otherParty.name && (
          <div style={{ color: "var(--color-foreground)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            {otherParty.name}
          </div>
        )}
        <input
          value={data.inviteContact}
          onChange={e => update({ inviteContact: e.target.value })}
          placeholder="Email, telefon lub @nick"
          style={{ ...inputStyle, marginBottom: 0 }}
        />
        {!hasOtherContact && (
          <div style={{ color: "var(--color-muted-foreground)", fontSize: 11, marginTop: 6 }}>
            Możesz też skopiować link i wysłać ręcznie po podpisaniu.
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
        <button
          onClick={() => { if (accepted) setSigned(true); }}
          disabled={!accepted}
          style={{ ...btnPrimary, width: "100%", padding: "16px 0", fontSize: 15, opacity: accepted ? 1 : 0.45, cursor: accepted ? "pointer" : "not-allowed" }}
        >
          ✍️ Podpisz{hasOtherContact ? " i wyślij zaproszenie" : " umowę"}
        </button>
        <button
          onClick={() => alert("Zapisano jako szkic")}
          style={{ ...btnSecondary, width: "100%", padding: "14px 0", fontSize: 14 }}
        >
          💾 Zapisz jako szkic
        </button>
      </div>

      <div style={{ marginTop: 20, padding: 14, borderRadius: 12, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.25)" }}>
        <div style={{ color: "#7c3aed", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Po podpisaniu:</div>
        <div style={{ color: "var(--color-muted-foreground)", fontSize: 12, lineHeight: 1.8 }}>
          🔒 Umowa zostaje zablokowana do edycji<br />
          📤 Druga strona otrzymuje link do przeglądu i akceptacji<br />
          💳 Depozyt aktywuje się po akceptacji obu stron<br />
          📄 Możesz pobrać PDF
        </div>
      </div>
    </div>
  );
}
