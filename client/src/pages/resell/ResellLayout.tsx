import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { LayoutGrid, Plus, Clock, Calculator, Shield } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",       href: "/resell",            Icon: LayoutGrid },
  { label: "Add Product",     href: "/resell/add",        Icon: Plus },
  { label: "Product History", href: "/resell/history",    Icon: Clock },
  { label: "Calculator",      href: "/resell/calculator", Icon: Calculator },
  { label: "Compliance",      href: "/resell/compliance", Icon: Shield },
];

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 900);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

export function ResellLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();

  const isActive = (href: string) =>
    location === href || (href === "/resell" && (location === "/" || location === "/resell"));

  return (
    <div style={{
      display: "flex",
      minHeight: "100dvh",
      background: "linear-gradient(160deg, #0d0010 0%, #080014 40%, #0a0a14 100%)",
      fontFamily: "'Outfit', 'Inter', sans-serif",
    }}>

      {/* ── Desktop sidebar ── */}
      {!isMobile && (
        <div style={{
          width: 220,
          flexShrink: 0,
          background: "rgba(6,4,16,0.75)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(139,92,246,0.14)",
          display: "flex",
          flexDirection: "column",
          padding: "28px 12px",
          position: "sticky",
          top: 0,
          height: "100dvh",
          overflowY: "auto",
        }}>
          {/* Brand */}
          <div style={{ padding: "4px 8px", marginBottom: 36 }}>
            <div style={{ color: "#f5c842", fontWeight: 900, fontSize: 16, letterSpacing: 2, lineHeight: 1.2 }}>
              RESELLASSIST
            </div>
            <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 9, letterSpacing: 2.4, marginTop: 4 }}>
              GLOBAL INTELLIGENCE
            </div>
          </div>

          {/* Nav */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {NAV_ITEMS.map(({ label, href, Icon }) => {
              const active = isActive(href);
              return (
                <button
                  key={href}
                  onClick={() => setLocation(href)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 14px", borderRadius: 12,
                    border: active ? "1px solid rgba(139,92,246,0.30)" : "1px solid transparent",
                    cursor: "pointer", textAlign: "left", width: "100%",
                    background: active ? "rgba(109,40,217,0.40)" : "transparent",
                    color: active ? "#fff" : "rgba(255,255,255,0.46)",
                    fontSize: 13, fontWeight: active ? 700 : 500,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.80)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.46)";
                    }
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main area ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

        {/* Mobile top bar */}
        {isMobile && (
          <div style={{
            background: "rgba(6,4,16,0.88)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(139,92,246,0.14)",
            padding: "14px 16px 0",
            position: "sticky", top: 0, zIndex: 50,
          }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 12,
            }}>
              <div>
                <div style={{ color: "#f5c842", fontWeight: 900, fontSize: 15, letterSpacing: 1.8 }}>
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
                  boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
                }}
              >
                <Plus size={13} /> Add Product
              </button>
            </div>

            {/* Horizontal scrollable nav */}
            <div style={{
              display: "flex", gap: 6,
              overflowX: "auto", paddingBottom: 12,
              scrollbarWidth: "none" as const,
              WebkitOverflowScrolling: "touch",
            } as React.CSSProperties}>
              {NAV_ITEMS.map(({ label, href }) => {
                const active = isActive(href);
                return (
                  <button
                    key={href}
                    onClick={() => setLocation(href)}
                    style={{
                      padding: "7px 15px", borderRadius: 99, border: "none", cursor: "pointer",
                      background: active ? "rgba(109,40,217,0.55)" : "rgba(255,255,255,0.07)",
                      color: active ? "#fff" : "rgba(255,255,255,0.45)",
                      fontSize: 12, fontWeight: active ? 700 : 500,
                      whiteSpace: "nowrap", flexShrink: 0,
                      boxShadow: active ? "inset 0 0 0 1px rgba(139,92,246,0.40)" : "none",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Page content */}
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
