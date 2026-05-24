import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Home, CreditCard, ArrowRightLeft, MessageSquare, FileText, Eye, EyeOff, Search } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/context/ThemeContext";
import { useLang } from "@/context/LanguageContext";
import { useFeatures } from "@/hooks/useFeatures";
import { useMessageBadge } from "@/context/MessageBadgeContext";

export function BottomNav() {
  const [location, setLocation] = useLocation();
  const { user, stealthMode, toggleStealthMode } = useAppStore();
  const { th } = useTheme();
  const { t, lang } = useLang();
  const { isEnabled } = useFeatures();
  const { unreadCount } = useMessageBadge();
  const pl = lang === "pl";

  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const pressStartRef = useRef<number>(0);

  if (!user || location === "/auth" || location === "/transfer" || location === "/transfer/new" || location === "/wallet/top-up" || location === "/agreements/new" || location.startsWith("/messages/") || location === "/split" || location === "/recurring" || location === "/savings" || location === "/kyc" || location === "/referral" || location === "/search" || location.startsWith("/u/")) return null;

  const isHome  = location === "/";
  const isCards = location === "/cards";
  const isMsgs  = location === "/messages";
  const isAgree = location === "/agreements" || location.startsWith("/agreements/");
  const isSearch = location === "/search";

  const homeActiveColor  = th.primary;
  const cardsActiveColor = th.tabCards;
  const msgsActiveColor  = th.tabMessages;
  const agreeActiveColor = th.tabAgreements;

  const handleOrbPointerDown = () => {
    pressStartRef.current = Date.now();
  };

  const handleOrbPointerUp = () => {
    setSpeedDialOpen(v => !v);
  };

  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 448,
      padding: "0 20px 26px",
      background: `linear-gradient(to top, ${th.navFade} 52%, rgba(0,0,0,0) 100%)`,
      zIndex: 50, pointerEvents: "none",
      transition: "background 0.5s ease",
    }}>
      {/* Speed dial overlay */}
      {speedDialOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 39 }} onClick={() => setSpeedDialOpen(false)} />
          <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {[
              { icon: "↑", label: pl ? "Wyślij" : "Send", route: "/transfer" },
              { icon: "↓", label: pl ? "Odbierz" : "Request", route: "/transfer?mode=request" },
              { icon: "÷", label: pl ? "Podziel" : "Split", route: "/split" },
              { icon: "📄", label: pl ? "Umowa" : "Contract", route: "/agreements/new" },
            ].map((item, i) => (
              <div key={i} onClick={() => { setLocation(item.route); setSpeedDialOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.70)" }}>{item.label}</span>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--color-primary-foreground)", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
                  {item.icon}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <nav style={{
        width: "100%", borderRadius: 999, padding: "12px 20px",
        background: th.navBg,
        border: `1px solid ${th.navBorder}`,
        display: "grid", gridTemplateColumns: "1fr 1fr auto 1fr 1fr",
        alignItems: "center", pointerEvents: "auto",
        boxShadow: [
          "0 2px 0 rgba(255,255,255,0.06)",
          "inset 0 1px 0 rgba(255,255,255,0.07)",
          "0 12px 48px rgba(0,0,0,0.65)",
          "0 4px 16px rgba(0,0,0,0.45)",
        ].join(", "),
        position: "relative", overflow: "visible",
        transition: "background 0.5s ease, border-color 0.5s ease",
      }}>
        {/* top glint */}
        <div style={{
          position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
          background: `linear-gradient(90deg, transparent, ${th.navGlint}, transparent)`,
          pointerEvents: "none",
        }} />

        {/* Stealth mode toggle */}
        <button onClick={toggleStealthMode} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 6, zIndex: 2 }}>
          {stealthMode ? <EyeOff size={16} style={{ color: "rgba(255,255,255,0.40)" }} /> : <Eye size={16} style={{ color: "rgba(255,255,255,0.25)" }} />}
        </button>

        {/* HOME */}
        {isEnabled("dashboard") ? (
          <Link href="/">
            <a
              data-testid="nav-home"
              style={{
                display: "grid", justifyItems: "center", gap: 4,
                cursor: "pointer", textDecoration: "none",
                fontSize: 15, fontWeight: 800, letterSpacing: 1.2,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isHome ? th.navActiveBg : "transparent",
                boxShadow: isHome ? th.navActiveGlow : "none",
                transition: "all 0.2s",
              }}>
                <Home size={19} style={{ color: isHome ? homeActiveColor : th.textMuted }} />
              </div>
              <span style={{ color: isHome ? homeActiveColor : th.textMuted, fontSize: 11, letterSpacing: 1.0 }}>
                {t.home}
              </span>
            </a>
          </Link>
        ) : <div />}

        {/* SEARCH */}
        <a
          data-testid="nav-search"
          onClick={() => setLocation("/search")}
          style={{
            display: "grid", justifyItems: "center", gap: 4,
            cursor: "pointer", textDecoration: "none",
            fontSize: 15, fontWeight: 800, letterSpacing: 1.2,
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: isSearch ? `${th.primary}1e` : "transparent",
            boxShadow: isSearch ? `0 0 14px ${th.primary}38, inset 0 1px 0 rgba(255,255,255,0.07)` : "none",
            transition: "all 0.2s",
          }}>
            <Search size={19} style={{ color: isSearch ? th.primary : th.textMuted }} />
          </div>
          <span style={{ color: isSearch ? th.primary : th.textMuted, fontSize: 11, letterSpacing: 1.0 }}>
            {pl ? "Szukaj" : "Search"}
          </span>
        </a>

        {/* Transfer — themed orb (center) */}
        {isEnabled("transfer") ? (
          <div
            data-testid="nav-transfer"
            onPointerDown={handleOrbPointerDown}
            onPointerUp={handleOrbPointerUp}
            style={{
              width: 68, height: 68, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: th.orbColor,
              background: th.orbBg,
              boxShadow: th.orbShadow,
              textDecoration: "none", position: "relative", overflow: "hidden",
              transition: "background 0.5s ease, box-shadow 0.5s ease, transform 0.3s ease",
              cursor: "pointer",
              transform: speedDialOpen ? "rotate(45deg)" : "rotate(0deg)",
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: "20%", right: "20%", height: "42%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)",
              borderRadius: "0 0 50% 50%", pointerEvents: "none",
            }} />
            <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 0.5, color: th.orbColor }}>Wyślij</span>
          </div>
        ) : <div style={{ width: 68 }} />}

        {/* MESSAGES */}
        {isEnabled("messages") ? (
          <Link href="/messages">
            <a
              data-testid="nav-messages"
              style={{
                display: "grid", justifyItems: "center", gap: 4,
                cursor: "pointer", textDecoration: "none",
                fontSize: 15, fontWeight: 800, letterSpacing: 1.2,
              }}
            >
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isMsgs ? `${th.tabMessages}1e` : "transparent",
                  boxShadow: isMsgs
                    ? `0 0 14px ${th.tabMessages}38, inset 0 1px 0 rgba(255,255,255,0.07)`
                    : "none",
                  transition: "all 0.2s",
                }}>
                  <MessageSquare size={19} style={{ color: isMsgs ? msgsActiveColor : th.textMuted }} />
                </div>
                {unreadCount > 0 && !isMsgs && (
                  <div
                    data-testid="badge-unread-messages"
                    style={{
                      position: "absolute", top: -4, right: -4,
                      minWidth: 18, height: 18, borderRadius: 999,
                      background: "#e84040",
                      color: "white", fontSize: 13, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "0 3px",
                      boxShadow: "0 0 0 2px rgba(2,8,20,1)",
                      lineHeight: 1,
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </div>
              <span style={{ color: isMsgs ? msgsActiveColor : th.textMuted, fontSize: 11, letterSpacing: 1.0 }}>
                {t.messages}
              </span>
            </a>
          </Link>
        ) : <div />}

        {/* UMOWA */}
        {isEnabled("agreements") ? (
          <Link href="/agreements">
            <a
              data-testid="nav-agreements"
              style={{
                display: "grid", justifyItems: "center", gap: 4,
                cursor: "pointer", textDecoration: "none",
                fontSize: 15, fontWeight: 800, letterSpacing: 1.2,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isAgree ? `${th.tabAgreements}1e` : "transparent",
                boxShadow: isAgree
                  ? `0 0 14px ${th.tabAgreements}38, inset 0 1px 0 rgba(255,255,255,0.07)`
                  : "none",
                transition: "all 0.2s",
              }}>
                <FileText size={19} style={{ color: isAgree ? agreeActiveColor : th.textMuted }} />
              </div>
              <span style={{ color: isAgree ? agreeActiveColor : th.textMuted, fontSize: 11, letterSpacing: 1.0 }}>
                {t.agreements}
              </span>
            </a>
          </Link>
        ) : <div />}

      </nav>
    </div>
  );
}
