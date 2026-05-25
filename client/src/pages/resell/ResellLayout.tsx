import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { LayoutGrid, Plus, Clock, Calculator, Shield, Menu, X, ChevronLeft } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",       href: "/resell",            Icon: LayoutGrid },
  { label: "Add Product",     href: "/resell/add",        Icon: Plus },
  { label: "Product History", href: "/resell/history",    Icon: Clock },
  { label: "Calculator",      href: "/resell/calculator", Icon: Calculator },
  { label: "Compliance",      href: "/resell/compliance", Icon: Shield },
];

const SIDEBAR_W = 240;

export function ResellLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 900);
  const [open, setOpen] = useState(() => window.innerWidth >= 900);

  useEffect(() => {
    const h = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (!mobile) setOpen(true);   // always open on desktop by default
    };
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const isActive = (href: string) =>
    location === href || (href === "/resell" && (location === "/" || location === "/resell"));

  const close = () => setOpen(false);
  const toggle = () => setOpen(v => !v);

  return (
    <div style={{
      display: "flex",
      minHeight: "100dvh",
      background: "linear-gradient(160deg, #0d0010 0%, #080014 40%, #0a0a14 100%)",
      fontFamily: "'Outfit', 'Inter', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* ── Mobile backdrop ── */}
      {isMobile && open && (
        <div
          onClick={close}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.60)",
            backdropFilter: "blur(2px)",
            transition: "opacity 0.25s",
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <div style={{
        // Desktop: shifts layout; Mobile: overlays with fixed position
        ...(isMobile ? {
          position: "fixed",
          top: 0, left: 0,
          height: "100dvh",
          zIndex: 200,
        } : {
          position: "relative",
          flexShrink: 0,
        }),
        width: SIDEBAR_W,
        background: "rgba(6,4,16,0.95)",
        backdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(139,92,246,0.14)",
        display: "flex",
        flexDirection: "column",
        padding: "28px 12px 24px",
        overflowY: "auto",
        // Slide animation
        transform: open ? "translateX(0)" : `translateX(-${SIDEBAR_W}px)`,
        transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        // On desktop, width goes to 0 when closed so content fills the space
        ...((!isMobile && !open) ? { marginLeft: -SIDEBAR_W } : {}),
      }}>

        {/* Brand + close button */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "4px 4px", marginBottom: 32 }}>
          <div>
            <div style={{ color: "#f5c842", fontWeight: 900, fontSize: 16, letterSpacing: 2, lineHeight: 1.2 }}>
              RESELLASSIST
            </div>
            <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 9, letterSpacing: 2.4, marginTop: 4 }}>
              GLOBAL INTELLIGENCE
            </div>
          </div>
          <button
            onClick={close}
            style={{
              background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer",
              borderRadius: 8, padding: 6, color: "rgba(255,255,255,0.50)",
              display: "flex", alignItems: "center", flexShrink: 0,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.50)"; }}
            title="Close sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Nav items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV_ITEMS.map(({ label, href, Icon }) => {
            const active = isActive(href);
            return (
              <button
                key={href}
                onClick={() => { setLocation(href); if (isMobile) close(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 14px", borderRadius: 12,
                  border: active ? "1px solid rgba(139,92,246,0.30)" : "1px solid transparent",
                  cursor: "pointer", textAlign: "left", width: "100%",
                  background: active ? "rgba(109,40,217,0.40)" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.50)",
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.50)";
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

      {/* ── Desktop: collapsed tab to re-open ── */}
      {!isMobile && !open && (
        <button
          onClick={toggle}
          style={{
            position: "fixed", left: 0, top: "50%", transform: "translateY(-50%)",
            zIndex: 150,
            background: "rgba(109,40,217,0.70)",
            border: "1px solid rgba(139,92,246,0.40)",
            borderLeft: "none",
            borderRadius: "0 10px 10px 0",
            padding: "14px 8px",
            cursor: "pointer", color: "#fff",
            display: "flex", alignItems: "center",
            boxShadow: "4px 0 20px rgba(0,0,0,0.40)",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(109,40,217,1)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(109,40,217,0.70)"; }}
        >
          <Menu size={16} />
        </button>
      )}

      {/* ── Main area ── */}
      <div style={{
        flex: 1, minWidth: 0,
        display: "flex", flexDirection: "column",
        transition: "margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>

        {/* Top bar — always visible, contains hamburger */}
        <div style={{
          background: "rgba(6,4,16,0.80)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(139,92,246,0.12)",
          padding: "0 16px",
          position: "sticky", top: 0, zIndex: 50,
          display: "flex", alignItems: "center",
          height: 52,
          gap: 12,
        }}>
          {/* Hamburger / toggle */}
          <button
            onClick={toggle}
            style={{
              background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer",
              borderRadius: 10, padding: "7px 8px", color: "rgba(255,255,255,0.70)",
              display: "flex", alignItems: "center",
              transition: "all 0.15s", flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.70)"; }}
            title={open ? "Hide sidebar" : "Show sidebar"}
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>

          {/* Brand (shown when sidebar is closed) */}
          {!open && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div>
                <div style={{ color: "#f5c842", fontWeight: 900, fontSize: 14, letterSpacing: 1.8, lineHeight: 1 }}>RESELLASSIST</div>
                <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 8, letterSpacing: 2, marginTop: 2 }}>GLOBAL INTELLIGENCE</div>
              </div>
            </div>
          )}

          {/* Current page pill (mobile) */}
          {isMobile && (
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 600 }}>
                {NAV_ITEMS.find(n => isActive(n.href))?.label ?? ""}
              </span>
            </div>
          )}

          {/* Add product shortcut */}
          <button
            onClick={() => setLocation("/resell/add")}
            style={{
              marginLeft: "auto", padding: "6px 14px", borderRadius: 99, border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              color: "#fff", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 5,
              boxShadow: "0 3px 12px rgba(139,92,246,0.35)",
              flexShrink: 0,
            }}
          >
            <Plus size={13} /> Add
          </button>
        </div>

        {/* Page content */}
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
