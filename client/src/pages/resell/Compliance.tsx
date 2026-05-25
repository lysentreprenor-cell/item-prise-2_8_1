import React from "react";
import { useLocation } from "wouter";
import { Shield } from "lucide-react";
import { ComplianceChecklist } from "@/components/resell/ComplianceChecklist";
import { MOCK_COMPLIANCE } from "@/lib/resell/mockData";

export default function CompliancePage() {
  const [, setLocation] = useLocation();

  return (
    <div style={{ padding: "28px 0 80px" }}>
        <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Lista kontrolna</h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 24 }}>
          Zaznacz wszystkie punkty krytyczne, żeby odblokować eksport oferty. To chroni Cię prawnie.
        </p>

        <div style={{
          background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.18)",
          borderRadius: 14, padding: "14px 18px", marginBottom: 28,
        }}>
          <p style={{ color: "#86efac", fontSize: 12, lineHeight: 1.7, margin: 0 }}>
            Aplikacja nie pozwoli wyeksportować oferty bez potwierdzenia kluczowych wymogów. Chroni to przed naruszeniem regulaminów marketplace i prawa autorskiego. Każdy punkt jest ważny dla bezpiecznego prowadzenia biznesu resell.
          </p>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: "28px",
        }}>
          <ComplianceChecklist
            initial={MOCK_COMPLIANCE["prod-002"]?.checks}
            onExport={() => setLocation("/resell/generator")}
          />
        </div>
    </div>
  );
}
