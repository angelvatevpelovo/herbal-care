"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import { supabase } from "@/lib/supabase";

type HistoryItem = {
  id: string;
  question: string;
  answer: string;
  is_emergency: boolean;
  created_at: string | null;
};

export default function AiHistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      if (!supabase) {
        if (isMounted) {
          setMessage("Supabase не е конфигуриран.");
          setIsLoading(false);
        }
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      setIsLoggedIn(true);
      setUserId(user.id);

      const { data, error } = await supabase
        .from("ai_history")
        .select("id, question, answer, is_emergency, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        setMessage("Не успяхме да заредим AI историята.");
      } else {
        setItems((data ?? []) as HistoryItem[]);
      }

      setIsLoading(false);
    }

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  async function deleteItem(id: string) {
    if (!supabase || !userId) {
      return;
    }

    const { error } = await supabase
      .from("ai_history")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setMessage("Не успяхме да изтрием записа. Моля, опитайте отново.");
      return;
    }

    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-5xl">
        <Header />

        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Лична история
          </p>
          <h1 className="mt-3 text-3xl font-bold text-yellow-200 sm:text-5xl">
            AI история
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Тук се показват предишните Ви въпроси към AI помощника и получените образователни
            отговори. Информацията не е диагноза, лечение или заместител на медицинска консултация.
          </p>
        </header>

        <div className="mt-8 rounded-3xl border border-yellow-300/40 bg-yellow-300/10 p-5 text-yellow-50 sm:p-6">
          <h2 className="text-xl font-bold text-yellow-100">Медицинска безопасност</h2>
          <p className="mt-3 leading-7">
            При силни, внезапни, опасни или продължителни симптоми потърсете лекар или спешна
            медицинска помощ. AI отговорите може да са непълни или неточни.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-8 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Зареждаме AI историята...
          </div>
        ) : !isLoggedIn ? (
          <div className="mt-8 rounded-3xl bg-white/10 p-5 ring-1 ring-white/10 sm:p-6">
            <p className="text-emerald-100">
              Трябва да влезете в профила си, за да виждате AI историята.
            </p>
            <Link
              href="/auth"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-yellow-300 px-5 py-3 text-center font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 sm:w-auto"
            >
              Вход / Регистрация
            </Link>
          </div>
        ) : message ? (
          <div className="mt-8 rounded-3xl border border-red-300/40 bg-red-950/50 p-5 text-red-50 sm:p-6">
            {message}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Все още нямате запазени AI въпроси.
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {items.map((item) => (
              <article
                key={item.id}
                className={
                  item.is_emergency
                    ? "rounded-3xl border border-red-300/50 bg-red-950/50 p-5 shadow-xl shadow-black/20 sm:p-6"
                    : "rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6"
                }
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
                      Въпрос
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-yellow-200">{item.question}</h2>
                    {item.created_at ? (
                      <p className="mt-2 text-sm text-emerald-200">
                        {new Date(item.created_at).toLocaleString("bg-BG")}
                      </p>
                    ) : null}
                  </div>
                  {item.is_emergency ? (
                    <span className="rounded-full border border-red-200/40 bg-red-900/60 px-3 py-2 text-sm font-bold text-red-50">
                      Спешно предупреждение
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-800 bg-emerald-950/60 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                    Отговор
                  </p>
                  <p className="mt-3 leading-7 text-emerald-50">{item.answer}</p>
                </div>

                <button
                  type="button"
                  onClick={() => void deleteItem(item.id)}
                  className="mt-5 min-h-11 rounded-2xl border border-red-300/40 bg-red-950/40 px-4 py-2 text-sm font-bold text-red-50 transition hover:border-red-200 hover:bg-red-900/60"
                >
                  Изтрий
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
