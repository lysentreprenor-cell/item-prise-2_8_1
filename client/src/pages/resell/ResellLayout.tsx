import React from "react";
import { useLocation } from "wouter";
import { LayoutGrid, Plus, Clock, Calculator, Shield } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",   href: "/resell",            Icon: LayoutGrid },
  { label: "Add Product", href: "/resell/add",        Icon: Plus },
  { label: "History",     href: "/resell/history",    Icon: Clock },
  { label: "Calculator",  href: "/resell/calculator", Icon: Calculator },
  { label: "Compliance",  href: "/resell/compliance", Icon: Shield },
];

export function ResellLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  const isActive = (href: string) =>
    location === href || (href === "/resell" && (location === "/" || location === "/resell"));

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(160deg, #0d0010 0%, #080014 40%, #0a0a14 100%)",
      fontFamily: "'Outfit', 'Inter', sans-serif",
    }}>

      {/* ── Top bar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(6,4,16,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(139,92,246,0.14)",
      }}>
        {/* Brand row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px 8px",
        }}>
          <div>
            <div style={{ color: "#f5c842", fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>
              RESELLASSIST
            </div>
            <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 8, letterSpacing: 2.2, marginTop: 2 }}>
              GLOBAL INTELLIGENCE
            </div>
          </div>
          <button
            onClick={() => setLocation("/resell/add")}
            style={{
              padding: "7px 16px", borderRadius: 99, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              color: "#fff", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 5,
              boxShadow: "0 3px 12px rgba(139,92,246,0.40)",
            }}
          >
            <Plus size={13} /> Add
          </button>
        </div>

        {/* Nav tabs */}
        <div style={{
          display: "flex",
          overflowX: "auto",
          scrollbarWidth: "none",
          padding: "0 12px 0",
          gap: 2,
        }}>
          {NAV_ITEMS.map(({ label, href, Icon }) => {
            const active = isActive(href);
            return (
              <button
                key={href}
                onClick={() => setLocation(href)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px",
                  background: "none", border: "none", cursor: "pointer",
                  color: active ? "#fff" : "rgba(255,255,255,0.42)",
                  fontSize: 12, fontWeight: active ? 700 : 500,
                  whiteSpace: "nowrap", flexShrink: 0,
                  borderBottom: active
                    ? "2px solid #8b5cf6"
                    : "2px solid transparent",
                  transition: "all 0.15s",
                  marginBottom: -1,
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Page content — full width single column ── */}
      <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", padding: "24px 16px 80px", boxSizing: "border-box" }}>
        {children}
      </div>
    </div>
  );
}
