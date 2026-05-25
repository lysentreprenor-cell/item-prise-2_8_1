import React from "react";
import { ProductHistory } from "@/components/resell/ProductHistory";
import { MOCK_PRODUCTS } from "@/lib/resell/mockData";

export default function HistoryPage() {
  return (
    <div style={{ padding: "28px 0 80px" }}>
      <h1 style={{ color: "#fff", fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 900, marginBottom: 6 }}>
        Historia produktów
      </h1>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 32 }}>
        Śledź i analizuj wszystkie swoje potencjalne oferty.
      </p>
      <ProductHistory products={MOCK_PRODUCTS} />
    </div>
  );
}
