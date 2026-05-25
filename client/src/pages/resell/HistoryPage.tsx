import React from "react";
import { ProductHistory } from "@/components/resell/ProductHistory";
import { MOCK_PRODUCTS } from "@/lib/resell/mockData";

export default function HistoryPage() {
  return (
    <div style={{ padding: "32px 28px 80px", maxWidth: 900, width: "100%", boxSizing: "border-box" }}>
      <h1 style={{ color: "#fff", fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 900, marginBottom: 6 }}>
        Product History
      </h1>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 32 }}>
        Track and analyze all your potential deals.
      </p>
      <ProductHistory products={MOCK_PRODUCTS} />
    </div>
  );
}
