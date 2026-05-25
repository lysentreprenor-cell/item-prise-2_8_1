import React, { useState } from "react";
import { useLocation } from "wouter";
import { Sparkles, Info, Package } from "lucide-react";
import { ProductForm } from "@/components/resell/ProductForm";
import type { Product } from "@/lib/resell/types";

export default function AddProduct() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (_data: Partial<Product>) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLocation("/resell/analysis/prod-001");
    }, 2000);
  };

  return (
    <div style={{ padding: "28px 0 80px" }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 20px rgba(139,92,246,0.45)",
          }}>
            <Package size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: -0.3 }}>
              Add New Product
            </h1>
            <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 13, margin: "3px 0 0" }}>
              Enter product details for arbitrage analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Legal notice */}
      <div style={{
        background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.20)",
        borderRadius: 14, padding: "12px 16px", marginBottom: 24,
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <Info size={14} style={{ color: "#8b5cf6", flexShrink: 0, marginTop: 1 }} />
        <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
          If you paste a link — we only use it for price analysis.{" "}
          <strong style={{ color: "#a78bfa" }}>We never copy photos or descriptions</strong> from
          other listings. You must add your own photos and write your own listing description.
        </p>
      </div>

      {/* Form card */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: "24px 20px",
      }}>
        <ProductForm onSubmit={handleSubmit} loading={loading} />
      </div>

      {/* AI hint */}
      <div style={{
        marginTop: 16,
        background: "rgba(245,200,66,0.05)", border: "1px solid rgba(245,200,66,0.15)",
        borderRadius: 12, padding: "12px 16px",
        display: "flex", gap: 10, alignItems: "center",
      }}>
        <Sparkles size={14} style={{ color: "#f5c842", flexShrink: 0 }} />
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: 0 }}>
          After submitting, AI will score the arbitrage opportunity in ~2 seconds.
        </p>
      </div>
    </div>
  );
}
