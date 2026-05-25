import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  Search, BarChart2, Calculator, FileText, TrendingUp,
  AlertTriangle, Sparkles, Globe, Shield,
  Plus, ChevronRight, Link as LinkIcon, Package,
  ArrowRight, Zap, DollarSign, Activity,
} from "lucide-react";
import { DashboardCard } from "@/components/resell/DashboardCard";
import { RiskBadge } from "@/components/resell/RiskBadge";
import { MOCK_PRODUCTS, MOCK_MARKET_PRICES, COUNTRIES } from "@/lib/resell/mockData";
import { formatCurrency, getProfitabilityLabel } from "@/lib/resell/calculations";

// ─── FindOpportunityCard ──────────────────────────────────────────────────────

function FindOpportunityCard({ totalProducts }: { totalProducts: number }) {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [buyCountry, setBuyCountry] = useState("Poland");
  const [sellCountry, setSellCountry] = useState("USA");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"quick" | "url">("quick");

  const handleAnalyze = () => {
    if (!name && !url) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setLocation("/resell/analysis/prod-001"); }, 1800);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(0,0,0,0.30)",
    border: "1px solid rgba(139,92,246,0.25)",
    borderRadius: 12, padding: "11px 14px",
    color: "#fff", fontSize: 14, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(88,28,135,0.55) 0%, rgba(55,15,90,0.80) 45%, rgba(30,5,55,0.95) 100%)",
      border: "1px solid rgba(139,92,246,0.40)",
      borderRadius: 24, padding: "28px 28px 24px",
      marginBottom: 24, position: "relative", overflow: "hidden",
      boxShadow: "0 12px 48px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.08)",
    }}>
      <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.60), rgba(245,200,66,0.40), transparent)" }} />
      <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,0.12)", filter: "blur(40px)", pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, flexShrink: 0, background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(139,92,246,0.50)" }}>
            <Search size={22} color="#fff" />
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 900, letterSpacing: -0.3 }}>Find Opportunity</div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 1 }}>{totalProducts} products analyzed · AI scores in 2 seconds</div>
          </div>
        </div>
        <div style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(245,200,66,0.25)", borderRadius: 99, padding: "4px 12px", color: "#f5c842", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 5 }}>
          <Zap size={10} /> AI ANALYSIS
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {([
          { key: "quick" as const, label: "Manual", icon: <Package size={13} /> },
          { key: "url" as const, label: "From URL", icon: <LinkIcon size={13} /> },
        ] as const).map(m => (
          <button key={m.key} onClick={() => setMode(m.key)} style={{
            padding: "7px 16px", borderRadius: 99, border: "none", cursor: "pointer",
            background: mode === m.key ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "rgba(255,255,255,0.07)",
            color: mode === m.key ? "#fff" : "rgba(255,255,255,0.45)",
            fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5,
            boxShadow: mode === m.key ? "0 4px 12px rgba(139,92,246,0.35)" : "none", transition: "all 0.15s",
          }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {mode === "url" ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>LISTING URL (price analysis only)</div>
          <input style={inputStyle} placeholder="https://allegro.pl/... or olx.pl/..." value={url} onChange={e => setUrl(e.target.value)} />
          <div style={{ color: "rgba(139,92,246,0.75)", fontSize: 10, marginTop: 5 }}>⚠ We only analyze price — no photos or descriptions copied</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>PRODUCT NAME</div>
            <input style={inputStyle} placeholder="e.g. Levi's 501 jeans W32, Baltic Amber, Nokia 3310..." value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAnalyze()} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>BUY PRICE</div>
              <input type="number" style={inputStyle} placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>BUY IN</div>
              <select style={{ ...inputStyle, cursor: "pointer" } as React.CSSProperties} value={buyCountry} onChange={e => setBuyCountry(e.target.value)}>
                {COUNTRIES.slice(0, 8).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>SELL IN</div>
              <select style={{ ...inputStyle, cursor: "pointer" } as React.CSSProperties} value={sellCountry} onChange={e => setSellCountry(e.target.value)}>
                {COUNTRIES.slice(0, 8).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, background: "rgba(0,0,0,0.20)", borderRadius: 10, padding: "8px 14px" }}>
        <span style={{ color: "rgba(255,255,255,0.40)", fontSize: 11 }}>Route:</span>
        {[buyCountry, "AI Analysis", "Calculator", "Listing"].map((step, i) => (
          <React.Fragment key={step}>
            {i > 0 && <ArrowRight size={10} style={{ color: "rgba(139,92,246,0.50)" }} />}
            <span style={{ color: i === 0 ? "#f5c842" : i === 3 ? "#4ade80" : "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: i === 0 || i === 3 ? 700 : 400 }}>{step}</span>
          </React.Fragment>
        ))}
        <ArrowRight size={10} style={{ color: "rgba(139,92,246,0.50)" }} />
        <span style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700 }}>{sellCountry}</span>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={handleAnalyze}
          disabled={loading || (!name && !url)}
          style={{
            flex: 1, padding: "14px 0", borderRadius: 14, border: "none",
            cursor: (loading || (!name && !url)) ? "not-allowed" : "pointer",
            background: (loading || (!name && !url)) ? "rgba(139,92,246,0.25)" : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 60%, #6d28d9 100%)",
            color: "#fff", fontWeight: 800, fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: (loading || (!name && !url)) ? "none" : "0 8px 24px rgba(139,92,246,0.45)",
            transition: "all 0.2s",
          }}
        >
          {loading ? (
            <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />Analyzing market...</>
          ) : (
            <><Sparkles size={16} /> Analyze opportunity</>
          )}
        </button>
        <button onClick={() => setLocation("/resell/add")} style={{ padding: "14px 18px", borderRadius: 14, border: "1px solid rgba(139,92,246,0.30)", cursor: "pointer", background: "rgba(139,92,246,0.10)", color: "#a78bfa", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Full form
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color: string; icon?: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: 0.6 }}>{label}</span>
        {icon && <span style={{ opacity: 0.70 }}>{icon}</span>}
      </div>
      <div style={{ color, fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ color: "rgba(255,255,255,0.30)", fontSize: 11 }}>{sub}</div>}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function ResellDashboard() {
  const [, setLocation] = useLocation();

  const totalProducts = MOCK_PRODUCTS.length;
  const profitable = MOCK_PRODUCTS.filter(p => p.status === "profitable" || p.status === "draft_ready");
  const bestProduct = MOCK_PRODUCTS.reduce((a, b) => a.score > b.score ? a : b);
  const avgScore = Math.round(MOCK_PRODUCTS.reduce((s, p) => s + p.score, 0) / MOCK_PRODUCTS.length);
  const potentialProfit = MOCK_PRODUCTS.reduce((total, p) => {
    const prices = MOCK_MARKET_PRICES[p.id];
    if (!prices || prices.length === 0) return total;
    const avgSell = prices.reduce((s, mp) => s + mp.avgPrice, 0) / prices.length;
    const buyUSD = p.buyCurrency === "USD" ? p.buyPrice : p.buyPrice * 0.255;
    return total + Math.max(0, (avgSell - buyUSD) * p.quantity);
  }, 0);

  return (
    <div style={{ padding: "32px 28px 80px", maxWidth: 900, width: "100%", boxSizing: "border-box" }}>

      {/* Hero header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.20)", borderRadius: 99, padding: "4px 12px", marginBottom: 16 }}>
          <Shield size={10} style={{ color: "#4ade80" }} />
          <span style={{ color: "#86efac", fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>Legal assistant · No listing copying · Approval required</span>
        </div>
        <h1 style={{ color: "#fff", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, letterSpacing: -0.8, margin: "0 0 10px", lineHeight: 1.1 }}>
          Intelligent{" "}
          <span style={{ background: "linear-gradient(90deg, #8b5cf6, #a78bfa, #f5c842)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Dashboard</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          Real-time cross-border arbitrage metrics.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 36 }}>
        <StatCard label="Total Products" value={String(totalProducts)} sub="0 analyzed today" color="#f5c842" icon={<Package size={14} color="#f5c842" />} />
        <StatCard label="Average Score" value={`${avgScore}/100`} sub="portfolio average" color="#a78bfa" icon={<Activity size={14} color="#a78bfa" />} />
        <StatCard label="Potential Profit" value={`$${Math.round(potentialProfit)}`} sub="estimated total" color="#4ade80" icon={<DollarSign size={14} color="#4ade80" />} />
        <StatCard label="Active Markets" value="4" sub="eBay, Amazon, Etsy+" color="#60a5fa" icon={<Globe size={14} color="#60a5fa" />} />
      </div>

      {/* Best opportunity */}
      {bestProduct && (
        <div
          onClick={() => setLocation(`/resell/analysis/${bestProduct.id}`)}
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(245,200,66,0.08) 100%)", border: "1px solid rgba(139,92,246,0.35)", borderRadius: 20, padding: "20px 24px", marginBottom: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", boxShadow: "0 8px 32px rgba(0,0,0,0.30)", position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(245,200,66,0.45), transparent)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(245,200,66,0.25)", borderRadius: 12, padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={14} style={{ color: "#f5c842" }} />
              <span style={{ color: "#fde68a", fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>BEST OPPORTUNITY</span>
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{bestProduct.name}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 }}>{bestProduct.category} · {bestProduct.buyCountry} → {bestProduct.sellCountry}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <RiskBadge score={bestProduct.score} size="md" />
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#f5c842", fontWeight: 900, fontSize: 18 }}>{formatCurrency(bestProduct.buyPrice, bestProduct.buyCurrency)}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>buy price</div>
            </div>
            <ChevronRight size={20} style={{ color: "rgba(255,255,255,0.30)" }} />
          </div>
        </div>
      )}

      {/* Find opportunity card */}
      <FindOpportunityCard totalProducts={totalProducts} />

      {/* More tools */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>MORE TOOLS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <DashboardCard title="Compare Market" description="eBay, Amazon, Etsy prices. Min/avg/max + popularity and competition." icon={<BarChart2 size={22} color="#f5c842" />} href="/resell/history" gradient="linear-gradient(160deg, rgba(120,80,0,0.72) 0%, rgba(60,36,0,0.90) 100%)" accentColor="#f5c842" stats={[{ label: "markets", value: "4" }]} />
          <DashboardCard title="Calculate Profit" description="Calculator with duty, tax, fees, exchange rate and return risk." icon={<Calculator size={22} color="#34d399" />} href="/resell/calculator" gradient="linear-gradient(160deg, rgba(10,80,44,0.80) 0%, rgba(4,34,18,0.95) 100%)" accentColor="#34d399" stats={[{ label: "currencies", value: "PLN/USD/EUR/NOK" }]} />
          <DashboardCard title="Create Listing" description="AI generates original title and description. EN/PL/NO. Requires approval." icon={<FileText size={22} color="#60a5fa" />} href="/resell/generator" gradient="linear-gradient(160deg, rgba(18,42,100,0.72) 0%, rgba(8,20,52,0.90) 100%)" accentColor="#60a5fa" stats={[{ label: "drafts", value: "1" }]} />
        </div>
      </div>

      {/* Recent analyses */}
      <div style={{ marginTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>RECENT ANALYSES</div>
          <button onClick={() => setLocation("/resell/history")} style={{ color: "#8b5cf6", fontSize: 12, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>View all →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {MOCK_PRODUCTS.map(p => {
            const { color, bgColor } = getProfitabilityLabel(p.score);
            return (
              <button key={p.id} onClick={() => setLocation(`/resell/analysis/${p.id}`)}
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 18px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.25)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ flex: 1, paddingRight: 10 }}>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.40)", fontSize: 11 }}>{p.category}</div>
                  </div>
                  <div style={{ background: bgColor, color, borderRadius: 99, padding: "3px 10px", fontSize: 10, fontWeight: 800, border: `1px solid ${color}25`, flexShrink: 0 }}>{p.score}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{p.buyCountry}</span>
                    <span style={{ color: "#8b5cf6" }}>→</span>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{p.sellCountry}</span>
                  </div>
                  <span style={{ color: "#f5c842", fontWeight: 800, fontSize: 14 }}>{formatCurrency(p.buyPrice, p.buyCurrency)}</span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <RiskBadge score={p.score} size="sm" showScore={false} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Warning */}
      <div style={{ background: "rgba(245,200,66,0.05)", border: "1px solid rgba(245,200,66,0.15)", borderRadius: 14, padding: "16px 20px", marginTop: 48, display: "flex", alignItems: "flex-start", gap: 12 }}>
        <AlertTriangle size={16} style={{ color: "#f5c842", flexShrink: 0, marginTop: 1 }} />
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: 0, lineHeight: 1.7 }}>
          <strong style={{ color: "#fde68a" }}>Important:</strong> This app supports legal price arbitrage only. It does not automatically copy photos, descriptions, or listings. Every listing is a draft requiring manual approval. Check duties and taxes before every transaction.
        </p>
      </div>
    </div>
  );
}
