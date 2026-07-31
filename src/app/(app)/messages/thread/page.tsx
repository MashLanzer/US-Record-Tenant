"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Skeleton } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { fetchMessages, sendMessage, type MessageItem } from "@/lib/data";
import { cn } from "@/lib/cn";

const copy = {
  en: { ph: "Message…", empty: "Say hello 👋", demo: "Demo mode — sign in to send real messages." },
  es: { ph: "Mensaje…", empty: "Saluda 👋", demo: "Modo demo — inicia sesión para enviar mensajes reales." },
};

export default function ThreadScreen() {
  const c = useT(copy);
  const { user, demoMode } = useAuth();
  const [convId, setConvId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [msgs, setMsgs] = useState<MessageItem[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setConvId(p.get("id"));
    const n = p.get("name");
    setName(n ? decodeURIComponent(n) : "");
  }, []);

  useEffect(() => {
    if (!user || !convId) return;
    if (convId === "demo") {
      setMsgs([]);
      return;
    }
    let alive = true;
    fetchMessages(convId, user.id).then((m) => alive && setMsgs(m));
    return () => {
      alive = false;
    };
  }, [user, convId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || !user || !convId || sending) return;
    if (demoMode || convId === "demo") {
      setText("");
      return;
    }
    setSending(true);
    try {
      await sendMessage(convId, user.id, body);
      setText("");
      setMsgs(await fetchMessages(convId, user.id));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <AppHeader title={name || "…"} back />

      <div className="px-4 pb-4 pt-4">
        {msgs === null ? (
          <div className="space-y-3">
            <Skeleton className="ml-auto h-10 w-2/3 rounded-2xl" />
            <Skeleton className="h-10 w-1/2 rounded-2xl" />
            <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
          </div>
        ) : msgs.length === 0 ? (
          <div className="py-20 text-center text-[15px] text-ink-faint">{c.empty}</div>
        ) : (
          <div className="flex flex-col gap-2">
            {msgs.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-snug",
                  m.mine
                    ? "self-end rounded-br-md bg-brand-600 text-white"
                    : "self-start rounded-bl-md border border-line bg-surface text-ink",
                )}
              >
                {m.body}
                <span className={cn("mt-1 block text-[10px]", m.mine ? "text-white/70" : "text-ink-faint")}>
                  {m.timeLabel}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="safe-bottom sticky bottom-[64px] z-20 mx-auto flex w-full max-w-[640px] items-center gap-2 border-t border-line bg-canvas/90 px-4 py-3 backdrop-blur-xl lg:bottom-0"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={demoMode ? c.demo : c.ph}
          className="min-w-0 flex-1 rounded-full border border-line-strong bg-surface-2 px-4 py-2.5 text-[15px] text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-tint"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          aria-label="Send"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition-all active:scale-95 disabled:opacity-40"
        >
          <Send className="h-[18px] w-[18px]" />
        </button>
      </form>
    </>
  );
}
