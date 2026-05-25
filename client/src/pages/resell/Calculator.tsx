import React from "react";
import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";
import { ProfitCalculator } from "@/components/resell/ProfitCalculator";

export default function CalculatorPage() {
  const [, setLocation] = useLocation();

  return (
    <div style={{ padding: "28px 0 80px" }}>
        <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Kalkulator zysku</h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 32 }}>
          Przeciągnij suwaki, wpisz ceny i sprawdź zysk netto w PLN, USD, EUR i NOK.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}>
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20, padding: "28px",
          }}>
            <ProfitCalculator initialBuyPrice={280} initialBuyCurrency="PLN" initialSellPrice={320} />
          </div>

          <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{
              background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.20)",
              borderRadius: 14, padding: "14px 16px",
            }}>
              <div style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>PRZYKŁADOWE STAWKI</div>
              {[
                { label: "Cło PL→USA", value: "0–7%" },
                { label: "VAT USA (śr.)", value: "~8%" },
                { label: "eBay prowizja", value: "13.25%" },
                { label: "Etsy prowizja", value: "6.5%" },
                { label: "Amazon FBA", value: "8–15%" },
                { label: "PayPal opłata", value: "3.4%" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>{r.label}</span>
                  <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{r.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setLocation("/resell/compliance")}
              style={{
                padding: "13px 0", borderRadius: 14, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                color: "#fff", fontWeight: 800, fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                boxShadow: "0 6px 20px rgba(139,92,246,0.35)",
              }}
            >
              Dalej: Zgodność <ChevronRight size={14} />
            </button>
          </div>
        </div>
    </div>
  );
}
