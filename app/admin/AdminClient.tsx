"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminHerbForm from "./AdminHerbForm";

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

type AdminHerb = {
  slug: string;
  name: string;
  latin: string | null;
};

type AdminSymptom = {
  slug: string;
  name: string;
  description: string | null;
};

type AdminCategory = {
  slug: string;
  name: string;
  description: string | null;
};

type AiHistoryEntry = {
  id: string;
  question: string;
  answer: string;
  is_emergency: boolean;
  created_at: string | null;
};

type AdminProfile = {
  email: string | null;
  is_admin: boolean | null;
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

function getAnswerPreview(answer: string) {
  return answer.length > 220 ? `${answer.slice(0, 220)}...` : answer;
}

export default function AdminClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [herbs, setHerbs] = useState<AdminHerb[]>([]);
  const [symptoms, setSymptoms] = useState<AdminSymptom[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>([]);
  const [aiHistoryEntries, setAiHistoryEntries] = useState<AiHistoryEntry[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [showOnlyEmergencyAi, setShowOnlyEmergencyAi] = useState(false);
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

      const [
        { data: herbsData, error: herbsError },
        { data: symptomsData, error: symptomsError },
        { data: categoriesData, error: categoriesError },
        { data: aiHistoryData, error: aiHistoryError },
        { data: feedback, error: feedbackError },
        { data: profilesData, error: profilesError },
      ] = await Promise.all([
        client
          .from("herbs")
          .select("slug, name, latin")
          .order("name", { ascending: true }),
        client
          .from("symptoms")
          .select("slug, name, description")
          .order("name", { ascending: true }),
        client
          .from("categories")
          .select("slug, name, description")
          .order("name", { ascending: true }),
        client
          .from("ai_history")
          .select("id, question, answer, is_emergency, created_at")
          .order("created_at", { ascending: false })
          .limit(20),
        client
          .from("feedback")
          .select("id, name, email, message, created_at")
          .order("created_at", { ascending: false })
          .limit(20),
        client
          .from("profiles")
          .select("email, is_admin, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (!isMounted) {
        return;
      }

      if (
        herbsError ||
        symptomsError ||
        categoriesError ||
        aiHistoryError ||
        feedbackError ||
        profilesError
      ) {
        setMessage("Не успяхме да заредим админ данните.");
      } else {
        setHerbs((herbsData ?? []) as AdminHerb[]);
        setSymptoms((symptomsData ?? []) as AdminSymptom[]);
        setCategories((categoriesData ?? []) as AdminCategory[]);
        setAiHistoryEntries((aiHistoryData ?? []) as AiHistoryEntry[]);
        setFeedbackMessages((feedback ?? []) as FeedbackMessage[]);
        setProfiles((profilesData ?? []) as AdminProfile[]);
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

  const emergencyAiCount = aiHistoryEntries.filter((entry) => entry.is_emergency).length;
  const visibleAiHistoryEntries = showOnlyEmergencyAi
    ? aiHistoryEntries.filter((entry) => entry.is_emergency)
    : aiHistoryEntries;

  function handleHerbCreated(herb: AdminHerb) {
    setHerbs((current) =>
      [...current, herb].sort((first, second) => first.name.localeCompare(second.name, "bg"))
    );
    setStats((current) => ({
      ...current,
      herbs: current.herbs === null ? current.herbs : current.herbs + 1,
    }));
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
              Съдържание
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">Добавяне на нова билка</h2>
          </div>
          <p className="text-sm text-emerald-200">
            Задължителни полета: slug, име и кратко описание.
          </p>
        </div>

        <AdminHerbForm onCreated={handleHerbCreated} />
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Достъп
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">Потребители</h2>
          </div>
          <p className="text-sm text-emerald-200">Показват се последните 50 профила.</p>
        </div>

        {profiles.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Все още няма профили.
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-3xl bg-white/10 shadow-xl ring-1 ring-white/10">
            <div className="hidden grid-cols-[2fr_1fr_1fr] gap-4 border-b border-emerald-800/70 bg-emerald-950/70 px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300 md:grid">
              <span>Имейл</span>
              <span>Роля</span>
              <span>Създаден</span>
            </div>

            <div className="divide-y divide-emerald-800/70">
              {profiles.map((profile, index) => (
                <article
                  key={`${profile.email ?? "profile"}-${profile.created_at ?? index}`}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[2fr_1fr_1fr] md:items-center md:gap-4"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Имейл
                    </p>
                    <p className="break-words text-emerald-50">
                      {profile.email || "Няма имейл"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Роля
                    </p>
                    {profile.is_admin ? (
                      <span className="inline-flex rounded-full border border-yellow-200/50 bg-yellow-300/20 px-3 py-1 text-sm font-bold text-yellow-100">
                        Админ
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-emerald-700 bg-emerald-900/70 px-3 py-1 text-sm font-bold text-emerald-50">
                        Потребител
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Създаден
                    </p>
                    <p className="text-emerald-100">
                      {profile.created_at
                        ? new Date(profile.created_at).toLocaleString("bg-BG")
                        : "Няма дата"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Съдържание
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">Билки в базата</h2>
          </div>
          <p className="text-sm text-emerald-200">Подредени по име.</p>
        </div>

        {herbs.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Все още няма добавени билки.
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-3xl bg-white/10 shadow-xl ring-1 ring-white/10">
            <div className="hidden grid-cols-[1fr_1fr_1fr_auto] gap-4 border-b border-emerald-800/70 bg-emerald-950/70 px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300 md:grid">
              <span>Име</span>
              <span>Латинско име</span>
              <span>Slug</span>
              <span className="text-right">Връзка</span>
            </div>

            <div className="divide-y divide-emerald-800/70">
              {herbs.map((herb) => (
                <article
                  key={herb.slug}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center md:gap-4"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Име
                    </p>
                    <p className="font-bold text-yellow-200">{herb.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Латинско име
                    </p>
                    <p className="break-words italic text-emerald-100">
                      {herb.latin || "Не е посочено"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Slug
                    </p>
                    <p className="break-words font-mono text-sm text-emerald-50">{herb.slug}</p>
                  </div>
                  <Link
                    href={`/herbs/${herb.slug}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-emerald-700 bg-emerald-900/70 px-4 py-2 text-sm font-bold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
                  >
                    Виж
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Безопасност
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">AI история и сигнали</h2>
          </div>
          <p className="text-sm text-emerald-200">Показват се последните 20 AI записа.</p>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-3xl border border-emerald-800/70 bg-emerald-950/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-yellow-200">Спешни сигнали: {emergencyAiCount}</p>
          <button
            type="button"
            onClick={() => setShowOnlyEmergencyAi((current) => !current)}
            className={
              showOnlyEmergencyAi
                ? "min-h-11 rounded-2xl border border-yellow-200 bg-yellow-300 px-4 py-2 text-sm font-bold text-green-950 shadow-lg"
                : "min-h-11 rounded-2xl border border-emerald-700 bg-emerald-900/70 px-4 py-2 text-sm font-bold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
            }
          >
            {showOnlyEmergencyAi ? "Покажи всички AI записи" : "Покажи само спешни сигнали"}
          </button>
        </div>

        {aiHistoryEntries.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Все още няма AI история.
          </div>
        ) : visibleAiHistoryEntries.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Няма спешни сигнали в последните AI записи.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {visibleAiHistoryEntries.map((entry) => (
              <article
                key={entry.id}
                className={
                  entry.is_emergency
                    ? "rounded-3xl border border-red-300/50 bg-red-950/50 p-5 shadow-xl shadow-black/20 sm:p-6"
                    : "rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6"
                }
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                      Въпрос
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-yellow-200">{entry.question}</h3>
                    <p className="mt-2 text-sm text-emerald-200">
                      {entry.created_at
                        ? new Date(entry.created_at).toLocaleString("bg-BG")
                        : "Няма дата"}
                    </p>
                  </div>

                  <span
                    className={
                      entry.is_emergency
                        ? "rounded-full border border-red-200/40 bg-red-900/70 px-3 py-2 text-sm font-bold text-red-50"
                        : "rounded-full border border-emerald-700 bg-emerald-900/70 px-3 py-2 text-sm font-bold text-emerald-50"
                    }
                  >
                    {entry.is_emergency ? "Спешен сигнал" : "Образователен отговор"}
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-800 bg-emerald-950/60 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                    Преглед на отговора
                  </p>
                  <p className="mt-3 leading-7 text-emerald-50">{getAnswerPreview(entry.answer)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Съдържание
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">Симптоми в базата</h2>
          </div>
          <p className="text-sm text-emerald-200">Подредени по име.</p>
        </div>

        {symptoms.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Все още няма добавени симптоми.
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-3xl bg-white/10 shadow-xl ring-1 ring-white/10">
            <div className="hidden grid-cols-[1fr_1fr_2fr] gap-4 border-b border-emerald-800/70 bg-emerald-950/70 px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300 md:grid">
              <span>Име</span>
              <span>Slug</span>
              <span>Описание</span>
            </div>

            <div className="divide-y divide-emerald-800/70">
              {symptoms.map((symptom) => (
                <article
                  key={symptom.slug}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_2fr] md:items-start md:gap-4"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Име
                    </p>
                    <p className="font-bold text-yellow-200">{symptom.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Slug
                    </p>
                    <p className="break-words font-mono text-sm text-emerald-50">{symptom.slug}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Описание
                    </p>
                    <p className="leading-7 text-emerald-100">
                      {symptom.description || "Няма добавено описание."}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Съдържание
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">Категории в базата</h2>
          </div>
          <p className="text-sm text-emerald-200">Подредени по име.</p>
        </div>

        {categories.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Все още няма добавени категории.
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-3xl bg-white/10 shadow-xl ring-1 ring-white/10">
            <div className="hidden grid-cols-[1fr_1fr_2fr_auto] gap-4 border-b border-emerald-800/70 bg-emerald-950/70 px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300 md:grid">
              <span>Име</span>
              <span>Slug</span>
              <span>Описание</span>
              <span className="text-right">Връзка</span>
            </div>

            <div className="divide-y divide-emerald-800/70">
              {categories.map((category) => (
                <article
                  key={category.slug}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_2fr_auto] md:items-start md:gap-4"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Име
                    </p>
                    <p className="font-bold text-yellow-200">{category.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Slug
                    </p>
                    <p className="break-words font-mono text-sm text-emerald-50">{category.slug}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Описание
                    </p>
                    <p className="leading-7 text-emerald-100">
                      {category.description || "Няма добавено описание."}
                    </p>
                  </div>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-emerald-700 bg-emerald-900/70 px-4 py-2 text-sm font-bold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
                  >
                    Виж
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

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
