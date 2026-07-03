"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AdminCard = {
  title: string;
  description: string;
  href: string;
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

export default function AdminClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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

      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        setMessage("Не успяхме да проверим администраторския достъп.");
      } else {
        setIsAdmin(Boolean(data?.is_admin));
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
    </section>
  );
}
