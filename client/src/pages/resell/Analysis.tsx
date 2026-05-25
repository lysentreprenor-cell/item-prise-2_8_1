import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import {
  ArrowLeft, ChevronRight, TrendingUp, AlertTriangle, CheckCircle2,
  Star, Globe, Package, BarChart2, Zap, ShieldCheck,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";
import { MOCK_PRODUCTS, MOCK_ANALYSES, MOCK_MARKET_PRICES } from "@/lib/resell/mockData";
import { RiskBadge } from "@/components/resell/RiskBadge";
import { MarketComparisonTable } from "@/components/resell/MarketComparisonTable";
import {
  getProfitabilityLabel, formatCurrency, getAverageSellPrice, convertCurrency,
} from "@/lib/resell/calculations";
import type { MarketPrice } from "@/lib/resell/types";

// ─── helpers ────────────────────────────────────────────────────────────────

const CONDITION_LABELS: Record<string, string> = {
  new: "Nowy", like_new: "Jak nowy", good: "Dobry", fair: "Przeciętny", poor: "Zły",
};

const MARKETPLACE_COLORS: Record<string, string> = {
  ebay: "#e43137", amazon: "#ff9900", etsy: "#f56400",
};

// Build a 30-day fake timeline from market prices
function buildTimeline(prices: MarketPrice[]) {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    // simulate some variance
    const noise = (v: number) => Math.round(v * (0.85 + Math.random() * 0.30));
    const entry: Record<string, number | string> = { day: label };
    prices.forEach(mp => {
      entry[`${mp.marketplace}_min`] = noise(mp.minPrice);
      entry[`${mp.marketplace}_avg`] = noise(mp.avgPrice);
      entry[`${mp.marketplace}_max`] = noise(mp.maxPrice);
    });
    return entry;
  });
}

// ─── sub-components ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700,
        letterSpacing: 1.2, marginBottom: 14, textTransform: "uppercase",
      }}>{title}</div>
      {children}
    </div>
  );
}

// ─── Score Gauge ─────────────────────────────────────────────────────────────

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const R = 54;
  const circ = 2 * Math.PI * R;
  const dash = (score / 100) * circ;
  return (
    <svg width={130} height={130} viewBox="0 0 130 130" style={{ display: "block", margin: "0 auto" }}>
      {/* track */}
      <circle cx={65} cy={65} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} />
      {/* glow */}
      <circle
        cx={65} cy={65} r={R} fill="none"
        stroke={color} strokeWidth={10}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        strokeDashoffset={circ / 4}
        style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dasharray 0.8s ease" }}
      />
      <text x={65} y={60} textAnchor="middle" fill={color} fontSize={28} fontWeight={900} fontFamily="Outfit,Inter,sans-serif">
        {score}
      </text>
      <text x={65} y={78} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={11} fontFamily="Outfit,Inter,sans-serif">
        / 100
      </text>
    </svg>
  );
}

// ─── Verdict card ─────────────────────────────────────────────────────────────

function VerdictCard({ score }: { score: number }) {
  let verdict: "BUY" | "WAIT" | "SKIP";
  let verdictPL: string;
  let bg: string;
  let border: string;
  let textColor: string;
  let desc: string;

  if (score >= 75) {
    verdict = "BUY";
    verdictPL = "Kup — warto";
    bg = "linear-gradient(135deg, rgba(74,222,128,0.12), rgba(34,197,94,0.06))";
    border = "rgba(74,222,128,0.30)";
    textColor = "#4ade80";
    desc = "Silny potencjał arbitrażowy. Wysoka marża i relatywnie niska konkurencja tworzą dobrą okazję.";
  } else if (score >= 45) {
    verdict = "WAIT";
    verdictPL = "Poczekaj — ryzykowne";
    bg = "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(234,179,8,0.06))";
    border = "rgba(251,191,36,0.30)";
    textColor = "#fbbf24";
    desc = "Średni potencjał. Rozważ negocjację niższej ceny zakupu lub poczekaj na lepszy moment.";
  } else {
    verdict = "SKIP";
    verdictPL = "Pomiń — nieopłacalne";
    bg = "linear-gradient(135deg, rgba(248,113,113,0.12), rgba(239,68,68,0.06))";
    border = "rgba(248,113,113,0.30)";
    textColor = "#f87171";
    desc = "Zbyt duże ryzyko i/lub zbyt mała marża. Ten produkt nie rokuje przy obecnych cenach.";
  }

  return (
    <div style={{
      background: bg, border: `1px solid ${border}`,
      borderRadius: 16, padding: "18px 20px",
      display: "flex", alignItems: "flex-start", gap: 16,
    }}>
      <div style={{
        background: `${textColor}15`,
        border: `2px solid ${textColor}40`,
        borderRadius: 12, padding: "8px 14px",
        color: textColor, fontWeight: 900, fontSize: 20,
        letterSpacing: 1, flexShrink: 0,
        boxShadow: `0 0 20px ${textColor}30`,
      }}>
        {verdict}
      </div>
      <div>
        <div style={{ color: textColor, fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{verdictPL}</div>
        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

// ─── Risk Meter ──────────────────────────────────────────────────────────────

function RiskMeter({ score }: { score: number }) {
  // Invert score → risk (high score = low risk)
  const risk = Math.round(10 - (score / 10));
  const pct = risk * 10;
  const riskColor = risk <= 3 ? "#4ade80" : risk <= 6 ? "#fbbf24" : "#f87171";
  const riskLabel = risk <= 3 ? "Niskie" : risk <= 6 ? "Średnie" : "Wysokie";

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, padding: "16px 18px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600 }}>Ryzyko</span>
        <span style={{ color: riskColor, fontSize: 13, fontWeight: 800 }}>{riskLabel} ({risk}/10)</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          borderRadius: 4,
          background: `linear-gradient(90deg, #4ade80, #fbbf24 50%, #f87171)`,
          clipPath: `inset(0 ${100 - pct}% 0 0)`,
          transition: "width 0.8s ease",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ color: "#4ade80", fontSize: 9 }}>Niskie</span>
        <span style={{ color: "#fbbf24", fontSize: 9 }}>Średnie</span>
        <span style={{ color: "#f87171", fontSize: 9 }}>Wysokie</span>
      </div>
    </div>
  );
}

// ─── Cost Flow ───────────────────────────────────────────────────────────────

function CostFlow({ buyPricePLN, sellPriceUSD }: { buyPricePLN: number; sellPriceUSD: number }) {
  const shipping = 18;
  const duty = Math.round(buyPricePLN * 0.05);
  const fees = Math.round(sellPriceUSD * 3.92 * 0.13);
  const netProfit = Math.round(sellPriceUSD * 3.92 - buyPricePLN - shipping - duty - fees);
  const netColor = netProfit > 0 ? "#4ade80" : "#f87171";

  const steps = [
    { label: "Zakup", value: `${buyPricePLN} zł`, color: "#f5c842" },
    { label: "Wysyłka", value: `${shipping} zł`, color: "#60a5fa" },
    { label: "Cło", value: `${duty} zł`, color: "#a78bfa" },
    { label: "Prowizje", value: `${fees} zł`, color: "#fb923c" },
    { label: "Zysk netto", value: `${netProfit} zł`, color: netColor },
  ];

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, padding: "16px 18px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 0,
        overflowX: "auto", paddingBottom: 4,
      }}>
        {steps.map((step, i) => (
          <React.Fragment key={step.label}>
            <div style={{ textAlign: "center", flexShrink: 0, minWidth: 72 }}>
              <div style={{
                background: `${step.color}15`, border: `1px solid ${step.color}40`,
                borderRadius: 10, padding: "8px 6px", marginBottom: 5,
              }}>
                <div style={{ color: step.color, fontWeight: 900, fontSize: 12, whiteSpace: "nowrap" }}>{step.value}</div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.40)", fontSize: 9, letterSpacing: 0.3 }}>{step.label}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                color: "rgba(255,255,255,0.20)", fontSize: 16, flexShrink: 0, margin: "0 4px",
                paddingBottom: 18,
              }}>→</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const AreaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1a1a2e", border: "1px solid rgba(139,92,246,0.30)",
      borderRadius: 10, padding: "10px 14px",
    }}>
      <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, fontSize: 12, fontWeight: 700 }}>
          {p.name}: ${p.value}
        </div>
      ))}
    </div>
  );
};

// ─── Similar Products ─────────────────────────────────────────────────────────

function SimilarProducts({ currentId, onNavigate }: { currentId: string; onNavigate: (id: string) => void }) {
  const others = MOCK_PRODUCTS.filter(p => p.id !== currentId).slice(0, 3);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {others.map(p => {
        const { color, bgColor } = getProfitabilityLabel(p.score);
        return (
          <button
            key={p.id}
            onClick={() => onNavigate(p.id)}
            style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12, padding: "10px 14px", cursor: "pointer", textAlign: "left",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.25)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1, paddingRight: 8 }}>
                <div style={{ color: "#fff", fontSize: 12, fontWeight: 700, marginBottom: 2, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>{p.category}</div>
              </div>
              <div style={{
                background: bgColor, color, borderRadius: 99,
                padding: "2px 8px", fontSize: 10, fontWeight: 800,
                border: `1px solid ${color}25`, flexShrink: 0,
              }}>
                {p.score}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AnalysisPage() {
  const [, params] = useRoute("/resell/analysis/:id");
  const [, setLocation] = useLocation();
  const productId = params?.id ?? "prod-001";

  const product = MOCK_PRODUCTS.find(p => p.id === productId) ?? MOCK_PRODUCTS[0];
  const analysis = MOCK_ANALYSES.find(a => a.productId === product.id) ?? MOCK_ANALYSES[0];
  const marketPrices = MOCK_MARKET_PRICES[product.id] ?? [];

  const avgSellUSD = getAverageSellPrice(marketPrices);
  const buyInUSD = convertCurrency(product.buyPrice, product.buyCurrency, "USD");
  const profitUSD = avgSellUSD - buyInUSD - 20;
  const { label, color, bgColor } = getProfitabilityLabel(product.score);

  // Tabs for market data
  const marketplaceNames = [...new Set(marketPrices.map(mp => mp.marketplace))];
  const [activeTab, setActiveTab] = useState<string>(marketplaceNames[0] ?? "ebay");

  // Timeline data (memoised-ish — just compute once per render cycle)
  const [timeline] = useState(() => buildTimeline(marketPrices));

  // Responsive: detect desktop (≥ 768px)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const activeMarketPrices = marketPrices.filter(mp => mp.marketplace === activeTab);
  const allTabLabel: Record<string, string> = { ebay: "eBay", amazon: "Amazon", etsy: "Etsy", shopify: "Shopify", manual: "Manual" };

  // Build area chart series keys
  const areaKeys: { key: string; color: string; name: string }[] = [];
  marketPrices.forEach(mp => {
    const c = MARKETPLACE_COLORS[mp.marketplace] ?? "#8b5cf6";
    areaKeys.push({ key: `${mp.marketplace}_min`, color: c, name: `${allTabLabel[mp.marketplace] ?? mp.marketplace} Min` });
    areaKeys.push({ key: `${mp.marketplace}_avg`, color: c, name: `${allTabLabel[mp.marketplace] ?? mp.marketplace} Śr.` });
  });

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(160deg, #0d0010 0%, #080014 40%, #0a0a14 100%)",
      fontFamily: "'Outfit','Inter',sans-serif",
    }}>
      {/* ── Topbar ── */}
      <div style={{
        background: "rgba(0,0,0,0.50)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(139,92,246,0.18)",
        padding: "0 24px", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", height: 60, gap: 14 }}>
          <button
            onClick={() => setLocation("/resell")}
            style={{
              display: "flex", alignItems: "center", gap: 8, background: "none",
              border: "none", cursor: "pointer", color: "rgba(255,255,255,0.55)",
              fontSize: 13, fontWeight: 600, flexShrink: 0,
            }}
          >
            <ArrowLeft size={15} /> Powrót
          </button>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.10)", flexShrink: 0 }} />
          <div style={{
            color: "#fff", fontWeight: 700, fontSize: 14,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
          }}>
            {product.name}
          </div>
          <RiskBadge score={product.score} size="sm" showScore={false} />
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 80px" }}>
        {/* two-col on desktop */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "1fr 320px" : "1fr",
          gap: 24,
          alignItems: "start",
        }}>
          {/* ═══ LEFT ═══ */}
          <div>
            {/* ─ Hero: gauge + verdict ─ */}
            <div style={{
              background: bgColor,
              border: `1px solid ${color}30`,
              borderRadius: 22, padding: "28px 24px", marginBottom: 28,
            }}>
              <div style={{
                display: "flex",
                flexDirection: isDesktop ? "row" : "column",
                gap: 24, alignItems: isDesktop ? "center" : "stretch",
              }}>
                {/* gauge */}
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <ScoreGauge score={product.score} color={color} />
                  <div style={{ color, fontSize: 13, fontWeight: 800, marginTop: 4 }}>{label}</div>
                </div>

                {/* metrics */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                    {[
                      { label: "Cena zakupu", value: formatCurrency(product.buyPrice, product.buyCurrency), c: "#fff" },
                      { label: "Śr. sprzedaży", value: `$${avgSellUSD.toFixed(0)}`, c: "#60a5fa" },
                      { label: "Potencjalny zysk", value: `$${profitUSD.toFixed(0)}`, c: profitUSD > 0 ? "#4ade80" : "#f87171" },
                    ].map(item => (
                      <div key={item.label} style={{
                        background: "rgba(0,0,0,0.18)", borderRadius: 12, padding: "12px 10px", textAlign: "center",
                      }}>
                        <div style={{ color: "rgba(255,255,255,0.40)", fontSize: 9, letterSpacing: 0.4, marginBottom: 4 }}>{item.label}</div>
                        <div style={{ color: item.c, fontWeight: 900, fontSize: 17 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {/* Verdict */}
                  <VerdictCard score={product.score} />
                </div>
              </div>
            </div>

            {/* ─ AI Rekomendacja ─ */}
            <Section title="AI REKOMENDACJA">
              <div style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.10), rgba(245,200,66,0.05))",
                border: "1px solid rgba(139,92,246,0.22)", borderRadius: 16, padding: "20px 22px",
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
                }}>
                  <div style={{
                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                    borderRadius: 8, padding: "4px 10px",
                    color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <Zap size={10} /> AI ANALIZA
                  </div>
                  <span style={{ color: "#a78bfa", fontSize: 12, fontWeight: 700 }}>
                    {analysis.aiCategory}
                  </span>
                </div>
                <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 14, lineHeight: 1.85 }}>
                  {analysis.aiSuggestion}
                </div>
              </div>
            </Section>

            {/* ─ Price Timeline ─ */}
            {marketPrices.length > 0 && (
              <Section title="HISTORIA CEN — OSTATNIE 30 DNI">
                <div style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16, padding: "18px 16px 8px",
                }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={timeline} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                      <defs>
                        {marketPrices.map(mp => (
                          <linearGradient key={mp.marketplace} id={`grad_${mp.marketplace}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={MARKETPLACE_COLORS[mp.marketplace] ?? "#8b5cf6"} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={MARKETPLACE_COLORS[mp.marketplace] ?? "#8b5cf6"} stopOpacity={0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<AreaTooltip />} />
                      {marketPrices.map(mp => (
                        <Area
                          key={`${mp.marketplace}_avg`}
                          type="monotone"
                          dataKey={`${mp.marketplace}_avg`}
                          name={`${allTabLabel[mp.marketplace] ?? mp.marketplace} Śr.`}
                          stroke={MARKETPLACE_COLORS[mp.marketplace] ?? "#8b5cf6"}
                          fill={`url(#grad_${mp.marketplace})`}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      ))}
                      {marketPrices.map(mp => (
                        <Area
                          key={`${mp.marketplace}_min`}
                          type="monotone"
                          dataKey={`${mp.marketplace}_min`}
                          name={`${allTabLabel[mp.marketplace] ?? mp.marketplace} Min`}
                          stroke={MARKETPLACE_COLORS[mp.marketplace] ?? "#8b5cf6"}
                          strokeDasharray="4 3"
                          fill="none"
                          strokeWidth={1}
                          dot={false}
                          opacity={0.5}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                  {/* legend */}
                  <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 4, flexWrap: "wrap" }}>
                    {marketPrices.map(mp => {
                      const c = MARKETPLACE_COLORS[mp.marketplace] ?? "#8b5cf6";
                      return (
                        <div key={mp.marketplace} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 20, height: 2, background: c, borderRadius: 1 }} />
                          <span style={{ color: "rgba(255,255,255,0.40)", fontSize: 10 }}>
                            {allTabLabel[mp.marketplace] ?? mp.marketplace}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Section>
            )}

            {/* ─ Cost Flow ─ */}
            <Section title="PRZEPŁYW KOSZTÓW">
              <CostFlow buyPricePLN={product.buyPrice} sellPriceUSD={avgSellUSD} />
            </Section>

            {/* ─ Risk Meter ─ */}
            <Section title="WSKAŹNIK RYZYKA">
              <RiskMeter score={product.score} />
            </Section>

            {/* ─ Tabbed market data ─ */}
            {marketPrices.length > 0 && (
              <Section title="DANE RYNKOWE">
                {/* Tab buttons */}
                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                  {marketplaceNames.map(mp => {
                    const isActive = activeTab === mp;
                    const c = MARKETPLACE_COLORS[mp] ?? "#8b5cf6";
                    return (
                      <button
                        key={mp}
                        onClick={() => setActiveTab(mp)}
                        style={{
                          padding: "7px 18px", borderRadius: 99,
                          border: isActive ? `1px solid ${c}50` : "1px solid rgba(255,255,255,0.10)",
                          background: isActive ? `${c}18` : "rgba(255,255,255,0.04)",
                          color: isActive ? c : "rgba(255,255,255,0.45)",
                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {allTabLabel[mp] ?? mp}
                      </button>
                    );
                  })}
                  {/* "All" tab */}
                  <button
                    onClick={() => setActiveTab("all")}
                    style={{
                      padding: "7px 18px", borderRadius: 99,
                      border: activeTab === "all" ? "1px solid rgba(139,92,246,0.50)" : "1px solid rgba(255,255,255,0.10)",
                      background: activeTab === "all" ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)",
                      color: activeTab === "all" ? "#a78bfa" : "rgba(255,255,255,0.45)",
                      fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    Wszystkie
                  </button>
                </div>

                {/* Tab content */}
                <MarketComparisonTable prices={activeTab === "all" ? marketPrices : activeMarketPrices} />
              </Section>
            )}
          </div>

          {/* ═══ RIGHT SIDEBAR ═══ */}
          <div>
            {/* Product info */}
            <Section title="SZCZEGÓŁY PRODUKTU">
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, overflow: "hidden",
              }}>
                {[
                  { label: "Kupujesz w", value: product.buyCountry, icon: <Globe size={11} /> },
                  { label: "Sprzedajesz w", value: product.sellCountry, icon: <Globe size={11} /> },
                  { label: "Stan", value: CONDITION_LABELS[product.condition] ?? product.condition, icon: <Star size={11} /> },
                  { label: "Ilość", value: String(product.quantity), icon: <Package size={11} /> },
                  { label: "Kategoria", value: product.category, icon: <BarChart2 size={11} /> },
                  ...(product.brand ? [{ label: "Marka", value: product.brand, icon: <ShieldCheck size={11} /> }] : []),
                ].map((row, i, arr) => (
                  <div key={row.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 16px",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}>
                    <span style={{ color: "rgba(255,255,255,0.40)", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ opacity: 0.6 }}>{row.icon}</span> {row.label}
                    </span>
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              <button
                onClick={() => setLocation("/resell/calculator")}
                style={{
                  padding: "13px 0", borderRadius: 14, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #34d399, #059669)",
                  color: "#fff", fontWeight: 800, fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 6px 20px rgba(52,211,153,0.28)",
                }}
              >
                <TrendingUp size={15} /> Kalkulator zysku
              </button>
              <button
                onClick={() => setLocation("/resell/market")}
                style={{
                  padding: "13px 0", borderRadius: 14, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, rgba(245,200,66,0.20), rgba(245,200,66,0.10))",
                  color: "#f5c842", fontWeight: 800, fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  border: "1px solid rgba(245,200,66,0.30)" as any,
                }}
              >
                <Globe size={15} /> Porównaj rynek
              </button>
              <button
                onClick={() => setLocation("/resell/compliance")}
                style={{
                  padding: "13px 0", borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.10)",
                  cursor: "pointer", background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.65)", fontWeight: 700, fontSize: 14,
                }}
              >
                Sprawdź zgodność →
              </button>
            </div>

            {/* Risks */}
            <Section title="RYZYKA">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {analysis.risks.map((r, i) => (
                  <div key={i} style={{
                    background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)",
                    borderRadius: 10, padding: "9px 12px",
                    display: "flex", alignItems: "flex-start", gap: 8,
                  }}>
                    <AlertTriangle size={12} style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }} />
                    <span style={{ color: "#fca5a5", fontSize: 12, lineHeight: 1.45 }}>{r}</span>
                  </div>
                ))}
              </div>
            </Section>

            {analysis.opportunities.length > 0 && (
              <Section title="SZANSE">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {analysis.opportunities.map((o, i) => (
                    <div key={i} style={{
                      background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)",
                      borderRadius: 10, padding: "9px 12px",
                      display: "flex", alignItems: "flex-start", gap: 8,
                    }}>
                      <CheckCircle2 size={12} style={{ color: "#4ade80", flexShrink: 0, marginTop: 1 }} />
                      <span style={{ color: "#86efac", fontSize: 12, lineHeight: 1.45 }}>{o}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Similar products */}
            <Section title="PODOBNE PRODUKTY">
              <SimilarProducts currentId={product.id} onNavigate={id => setLocation(`/resell/analysis/${id}`)} />
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
