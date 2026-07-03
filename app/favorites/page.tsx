"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/app/components/Header";

type FavoriteHerb = {
  id: string;
  slug: string;
  name: string;
  latin: string | null;
  emoji: string | null;
  short_description: string | null;
};

type FavoriteRow = {
  herbs: FavoriteHerb | FavoriteHerb[] | null;
};

export default function FavoritesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteHerb[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFavorites() {
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
        .from("favorite_herbs")
        .select("herbs(id, slug, name, latin, emoji, short_description)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        setMessage("Не успяхме да заредим любимите билки.");
      } else {
        const favoriteHerbs = ((data ?? []) as FavoriteRow[]).flatMap((row) => {
          if (!row.herbs) {
            return [];
          }

          return Array.isArray(row.herbs) ? row.herbs : [row.herbs];
        });

        setFavorites(favoriteHerbs);
      }

      setIsLoading(false);
    }

    void loadFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-6xl">
        <Header />

        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Личен списък
          </p>
          <h1 className="mt-3 text-3xl font-bold text-yellow-200 sm:text-5xl">
            Любими билки
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Тук ще виждате билките, които сте запазили за по-бърз достъп.
          </p>
        </header>

        {isLoading ? (
          <div className="mt-8 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Зареждаме любимите...
          </div>
        ) : !isLoggedIn ? (
          <div className="mt-8 rounded-3xl bg-white/10 p-5 ring-1 ring-white/10 sm:p-6">
            <p className="text-emerald-100">
              Трябва да влезете в профила си, за да виждате любимите билки.
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
        ) : favorites.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Все още нямате любими билки.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((herb) => (
              <Link
                key={herb.id}
                href={`/herbs/${herb.slug}`}
                className="rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/15 sm:p-6"
              >
                <div className="text-4xl" aria-hidden="true">
                  {herb.emoji ?? "🌿"}
                </div>
                <h2 className="mt-4 text-2xl font-bold text-yellow-200">{herb.name}</h2>
                {herb.latin ? (
                  <p className="mt-1 text-sm italic text-green-100">{herb.latin}</p>
                ) : null}
                <p className="mt-4 leading-7 text-green-50">
                  {herb.short_description ?? "Няма добавено кратко описание."}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
