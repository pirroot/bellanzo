"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Mail, MailOpen } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Paginated } from "@/lib/types";

interface Message {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesAdmin() {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<Paginated<Message>>("/messages/", { auth: true })
      .then((d) => setItems(d.results))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  async function toggleRead(m: Message) {
    await apiFetch(`/messages/${m.id}/`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify({ is_read: !m.is_read }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-ink mb-1">پیام‌های تماس</h1>
      <p className="text-muted mb-6">پیام‌های دریافتی از فرم تماس با ما</p>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted py-10 text-center">پیامی وجود ندارد.</p>
      ) : (
        <div className="grid gap-4">
          {items.map((m) => (
            <div
              key={m.id}
              className={`bg-white rounded-2xl border p-6 ${
                m.is_read ? "border-line" : "border-brand"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-ink">
                      {m.subject || "بدون موضوع"}
                    </h3>
                    {!m.is_read && (
                      <span className="bg-brand text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        جدید
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted mt-1">
                    {m.full_name} • {m.phone} {m.email && `• ${m.email}`}
                  </p>
                </div>
                <button
                  onClick={() => toggleRead(m)}
                  className="text-muted hover:text-brand shrink-0"
                  title={m.is_read ? "علامت‌گذاری نخوانده" : "علامت‌گذاری خوانده"}
                >
                  {m.is_read ? <MailOpen size={20} /> : <Mail size={20} />}
                </button>
              </div>
              <p className="mt-4 text-ink-soft leading-7 bg-surface rounded-xl p-4">
                {m.message}
              </p>
              <p className="mt-2 text-xs text-muted">
                {new Date(m.created_at).toLocaleString("fa-IR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
