import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Search, FileText, MessageCircle, ArrowUpRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useLang } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function GlobalSearch() {
  const [, setLocation] = useLocation();
  const { transactions, conversations, contacts } = useAppStore();
  const { lang } = useLang();
  const pl = lang === "pl";
  const [query, setQuery] = useState("");

  const contracts = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("itemprise_contracts") || "[]"); }
    catch { return []; }
  }, []);

  const q = query.toLowerCase().trim();

  const results = useMemo(() => {
    if (!q) return { transactions: [], contracts: [], messages: [], contacts: [] };
    return {
      transactions: transactions.filter(tx =>
        tx.title.toLowerCase().includes(q) || tx.subtitle.toLowerCase().includes(q)
      ).slice(0, 4),
      contracts: contracts.filter((c: any) =>
        c.data?.customTitle?.toLowerCase().includes(q) ||
        c.data?.subcategory?.toLowerCase().includes(q) ||
        c.data?.inviteContact?.toLowerCase().includes(q) ||
        c.data?.scopeDescription?.toLowerCase().includes(q)
      ).slice(0, 4),
      messages: conversations.flatMap((conv: any) =>
        conv.messages
          .filter((m: any) => m.text?.toLowerCase().includes(q))
          .map((m: any) => ({ ...m, contactName: conv.contactName, convId: conv.id }))
      ).slice(0, 4),
      contacts: contacts.filter(c =>
        c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q)
      ).slice(0, 4),
    };
  }, [q, transactions, contracts, conversations, contacts]);

  const hasResults = Object.values(results).some(arr => arr.length > 0);

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      <header className="px-6 pt-14 pb-4 sticky top-0 bg-background/90 backdrop-blur-xl z-20 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary border border-white/5 shrink-0" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder={pl ? "Szukaj wszędzie..." : "Search everywhere..."}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="h-12 pl-11 rounded-xl bg-card border-white/10 text-[15px]"
            />
          </div>
        </div>
      </header>
      <main className="px-6 py-6 space-y-6">
        {!q && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p>{pl ? "Wpisz frazę aby przeszukać transakcje, umowy, wiadomości i kontakty" : "Type to search transactions, contracts, messages and contacts"}</p>
          </div>
        )}
        {q && !hasResults && (
          <div className="text-center py-16 text-muted-foreground">
            <p>{pl ? `Brak wyników dla "${query}"` : `No results for "${query}"`}</p>
          </div>
        )}

        {results.transactions.length > 0 && (
          <section>
            <div className="text-[11px] font-bold tracking-widest text-muted-foreground mb-3 uppercase">{pl ? "Transakcje" : "Transactions"}</div>
            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
              {results.transactions.map((tx: any, i: number) => (
                <div key={tx.id} onClick={() => setLocation(`/transaction/${tx.id}`)} className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 ${i < results.transactions.length - 1 ? "border-b border-white/5" : ""}`}>
                  <ArrowUpRight className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold truncate">{tx.title}</div>
                    <div className="text-[12px] text-muted-foreground truncate">{tx.subtitle}</div>
                  </div>
                  <div className="text-[13px] font-bold text-primary shrink-0">{tx.amount > 0 ? "+" : ""}{tx.amount} PLN</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {results.contracts.length > 0 && (
          <section>
            <div className="text-[11px] font-bold tracking-widest text-muted-foreground mb-3 uppercase">{pl ? "Umowy" : "Contracts"}</div>
            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
              {results.contracts.map((c: any, i: number) => (
                <div key={c.id} onClick={() => setLocation("/agreements/new")} className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 ${i < results.contracts.length - 1 ? "border-b border-white/5" : ""}`}>
                  <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold truncate">{c.data?.customTitle || c.data?.subcategory || c.data?.category}</div>
                    <div className="text-[12px] text-muted-foreground truncate">{c.data?.inviteContact || c.phase}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {results.messages.length > 0 && (
          <section>
            <div className="text-[11px] font-bold tracking-widest text-muted-foreground mb-3 uppercase">{pl ? "Wiadomości" : "Messages"}</div>
            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
              {results.messages.map((m: any, i: number) => (
                <div key={m.id} onClick={() => setLocation(`/messages/${m.convId}`)} className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 ${i < results.messages.length - 1 ? "border-b border-white/5" : ""}`}>
                  <MessageCircle className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-muted-foreground">{m.contactName}</div>
                    <div className="text-[14px] truncate">{m.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {results.contacts.length > 0 && (
          <section>
            <div className="text-[11px] font-bold tracking-widest text-muted-foreground mb-3 uppercase">{pl ? "Kontakty" : "Contacts"}</div>
            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
              {results.contacts.map((c: any, i: number) => (
                <div key={c.id} onClick={() => setLocation(`/transfer/new?to=${c.handle}`)} className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 ${i < results.contacts.length - 1 ? "border-b border-white/5" : ""}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${c.color}`}>{c.initials}</div>
                  <div>
                    <div className="text-[14px] font-semibold">{c.name}</div>
                    <div className="text-[12px] text-muted-foreground">@{c.handle}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
