import { useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Star, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useLang } from "@/context/LanguageContext";

export default function PublicProfile() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/u/:handle");
  const handle = params?.handle || "";
  const { contacts } = useAppStore();
  const { lang } = useLang();
  const pl = lang === "pl";

  const contact = contacts.find(c => c.handle.toLowerCase() === handle.toLowerCase());
  const displayName = contact?.name || handle;

  const ratings = useMemo(() => {
    try {
      const all = JSON.parse(localStorage.getItem("finlys_ratings") || "[]");
      return all.filter((r: any) => r.ratedUser?.toLowerCase().includes(handle.toLowerCase()));
    } catch { return []; }
  }, [handle]);

  const avgRating = ratings.length > 0 ? ratings.reduce((s: number, r: any) => s + r.rating, 0) / ratings.length : 0;

  const contracts = useMemo(() => {
    try {
      const all = JSON.parse(localStorage.getItem("itemprise_contracts") || "[]");
      return all.filter((c: any) =>
        c.data?.inviteContact?.toLowerCase().includes(handle.toLowerCase()) ||
        c.data?.client?.name?.toLowerCase().includes(handle.toLowerCase()) ||
        c.data?.contractor?.name?.toLowerCase().includes(handle.toLowerCase())
      );
    } catch { return []; }
  }, [handle]);

  const completedContracts = contracts.filter((c: any) => c.phase === "completed").length;
  const activeContracts = contracts.filter((c: any) => c.phase && c.phase !== "completed").length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-14 pb-6">
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary border border-white/5 mb-6" onClick={() => setLocation(-1 as any)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-4 border-2 border-primary/30 ${contact?.color || "bg-secondary"}`}>
            {contact?.initials || handle[0]?.toUpperCase()}
          </div>
          <h1 className="text-2xl font-heading">{displayName}</h1>
          <p className="text-muted-foreground text-sm mt-1">@{handle}</p>
          {avgRating > 0 && (
            <div className="flex items-center gap-1 mt-3">
              {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={avgRating >= s ? "var(--color-primary)" : "none"} stroke="var(--color-primary)" />)}
              <span className="text-sm font-bold text-primary ml-1">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({ratings.length})</span>
            </div>
          )}
        </div>
      </header>

      <main className="px-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: pl ? "Ukończone" : "Completed", value: completedContracts, icon: <CheckCircle size={18} className="text-green-400" /> },
            { label: pl ? "Aktywne" : "Active", value: activeContracts, icon: <FileText size={18} className="text-primary" /> },
            { label: pl ? "Oceny" : "Ratings", value: ratings.length, icon: <Star size={18} className="text-primary" /> },
          ].map(stat => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 12px", textAlign: "center" }}>
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Reviews */}
        {ratings.length > 0 && (
          <div>
            <div className="text-[11px] font-bold tracking-widest text-muted-foreground mb-3 uppercase">{pl ? "Opinie" : "Reviews"}</div>
            <div className="space-y-3">
              {ratings.slice(0, 5).map((r: any, i: number) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 14 }}>
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={r.rating >= s ? "var(--color-primary)" : "none"} stroke="var(--color-primary)" />)}
                    <span className="text-xs text-muted-foreground ml-2">{new Date(r.date).toLocaleDateString(pl ? "pl-PL" : "en-US")}</span>
                  </div>
                  {r.note && <p className="text-sm text-muted-foreground">{r.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {ratings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {pl ? "Brak opinii dla tego użytkownika" : "No reviews for this user yet"}
          </div>
        )}

        <Button className="w-full" onClick={() => setLocation(`/transfer/new?to=${handle}`)}>
          {pl ? "Wyślij pieniądze" : "Send money"}
        </Button>
      </main>
    </div>
  );
}
