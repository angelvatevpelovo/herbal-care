"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AdminCard = {
  title: string;
  description: string;
  href: string;
};

type FeedbackMessage = {
  id: string;
  name: string | null;
  email: string | null;
  message: string;
  created_at: string | null;
};

type AdminStats = {
  herbs: number | null;
  symptoms: number | null;
  categories: number | null;
  feedback: number | null;
  aiHistory: number | null;
};

const adminCards: AdminCard[] = [
  {
    title: "Билки",
    description: "Бъдещо управление на билки, описания, противопоказания и взаимодействия.",
    href: "/herbs",
  },
  {
    title: "Симптоми",
    description: "Бъдещо редактиране на симптоми и връзки към образователни ресурси.",
    href: "/symptoms",
  },
  {
    title: "Категории",
    description: "Бъдеща организация на билките по тематични категории.",
    href: "/categories",
  },
  {
    title: "Обратна връзка",
    description: "Бъдещ преглед на изпратени идеи, корекции и въпроси от потребители.",
    href: "/contact",
  },
  {
    title: "AI история",
    description: "Бъдещ преглед на AI активност при спазване на поверителност и безопасност.",
    href: "/ai-history",
  },
];

const initialStats: AdminStats = {
  herbs: null,
  symptoms: null,
  categories: null,
  feedback: null,
  aiHistory: null,
};

const statCards = [
  { key: "herbs", label: "Билки" },
  { key: "symptoms", label: "Симптоми" },
  { key: "categories", label: "Категории" },
  { key: "feedback", label: "Съобщения" },
  { key: "aiHistory", label: "AI записи" },
] as const;

export default function AdminClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAdminAccess() {
      if (!supabase) {
        if (isMounted) {
          setMessage("Supabase не е конфигуриран.");
          setIsLoading(false);
        }
        return;
      }

      const client = supabase;

      const {
        data: { user },
      } = await client.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const { data, error } = await client
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        setMessage("Не успяхме да проверим администраторския достъп.");
        setIsLoading(false);
        return;
      }

      const hasAdminAccess = Boolean(data?.is_admin);
      setIsAdmin(hasAdminAccess);

      if (!hasAdminAccess) {
        setIsLoading(false);
        return;
      }

      const countRows = async (table: string) => {
        const { count, error } = await client
          .from(table)
          .select("*", { count: "exact", head: true });

        return error ? null : count;
      };

      const [herbsCount, symptomsCount, categoriesCount, feedbackCount, aiHistoryCount] =
        await Promise.all([
          countRows("herbs"),
          countRows("symptoms"),
          countRows("categories"),
          countRows("feedback"),
          countRows("ai_history"),
        ]);

      if (!isMounted) {
        return;
      }

      setStats({
        herbs: herbsCount,
        symptoms: symptomsCount,
        categories: categoriesCount,
        feedback: feedbackCount,
        aiHistory: aiHistoryCount,
      });

      const { data: feedback, error: feedbackError } = await client
        .from("feedback")
        .select("id, name, email, message, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!isMounted) {
        return;
      }

      if (feedbackError) {
        setMessage("Не успяхме да заредим обратната връзка.");
      } else {
        setFeedbackMessages((feedback ?? []) as FeedbackMessage[]);
      }

      setIsLoading(false);
    }

    void checkAdminAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="mt-8 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
        Проверяваме достъпа...
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mt-8 rounded-3xl bg-white/10 p-5 ring-1 ring-white/10 sm:p-6">
        <p className="text-emerald-100">
          Трябва да влезете в профила си, за да отворите админ панела.
        </p>
        <Link
          href="/auth"
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-yellow-300 px-5 py-3 text-center font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 sm:w-auto"
        >
          Вход / Регистрация
        </Link>
      </div>
    );
  }

  if (message) {
    return (
      <div className="mt-8 rounded-3xl border border-red-300/40 bg-red-950/50 p-5 text-red-50 sm:p-6">
        {message}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mt-8 rounded-3xl border border-yellow-300/40 bg-yellow-300/10 p-5 text-yellow-50 sm:p-6">
        <h2 className="text-xl font-bold text-yellow-100">Нямате администраторски достъп.</h2>
        <p className="mt-3 leading-7">
          Този раздел е ограничен до профили с администраторски права.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-8">
      <div className="rounded-3xl border border-yellow-300/40 bg-yellow-300/10 p-5 text-yellow-50 sm:p-6">
        <h2 className="text-xl font-bold text-yellow-100">Подготвителен панел</h2>
        <p className="mt-3 leading-7">
          Този панел е подготвен за бъдещо управление на съдържание. Засега не променя данни.
        </p>
      </div>

      <section className="mt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
          Статистика
        </p>
        <h2 className="mt-2 text-2xl font-bold text-yellow-200">Общ преглед</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map((card) => (
            <article
              key={card.key}
              className="rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                {card.label}
              </p>
              <p className="mt-3 text-4xl font-bold text-yellow-200">
                {stats[card.key] ?? "—"}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {adminCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-yellow-300 sm:p-6"
          >
            <article>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Бъдещо управление
              </p>
              <h2 className="mt-3 text-2xl font-bold text-yellow-200">{card.title}</h2>
              <p className="mt-4 leading-7 text-emerald-50">{card.description}</p>
              <p className="mt-5 text-sm font-semibold text-yellow-300 transition group-hover:text-yellow-100">
                Отвори секцията
              </p>
            </article>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Последни съобщения
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">Обратна връзка</h2>
          </div>
          <p className="text-sm text-emerald-200">Показват се последните 20 съобщения.</p>
        </div>

        {feedbackMessages.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Все още няма получени съобщения.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {feedbackMessages.map((feedback) => (
              <article
                key={feedback.id}
                className="rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6"
              >
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                      Име
                    </p>
                    <p className="mt-1 break-words text-emerald-50">
                      {feedback.name || "Не е посочено"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                      Имейл
                    </p>
                    <p className="mt-1 break-words text-emerald-50">
                      {feedback.email || "Не е посочен"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                      Получено
                    </p>
                    <p className="mt-1 text-emerald-50">
                      {feedback.created_at
                        ? new Date(feedback.created_at).toLocaleString("bg-BG")
                        : "Няма дата"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-800 bg-emerald-950/60 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                    Съобщение
                  </p>
                  <p className="mt-3 whitespace-pre-wrap leading-7 text-emerald-50">
                    {feedback.message}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
