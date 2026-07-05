"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { HerbCategory, HerbCategoryConnection, HerbListItem } from "./page";

type HerbsFilterProps = {
  herbs: HerbListItem[];
  categories: HerbCategory[];
  connections: HerbCategoryConnection[];
};

type SortOption = "name-asc" | "name-desc" | "newest" | "oldest";

function normalizeText(text: string) {
  return text.toLocaleLowerCase("bg-BG").trim();
}

export default function HerbsFilter({ herbs, categories, connections }: HerbsFilterProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");

  const herbIdsByCategory = useMemo(() => {
    const categoryMap = new Map<string, Set<string>>();

    for (const connection of connections) {
      const existing = categoryMap.get(connection.category_id) ?? new Set<string>();
      existing.add(connection.herb_id);
      categoryMap.set(connection.category_id, existing);
    }

    return categoryMap;
  }, [connections]);

  const filteredHerbs = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);
    const categoryHerbs =
      selectedCategoryId === "all"
        ? herbs
        : herbs.filter((herb) => {
            const allowedHerbIds = herbIdsByCategory.get(selectedCategoryId) ?? new Set<string>();
            return allowedHerbIds.has(herb.id);
          });

    const searchedHerbs = normalizedQuery
      ? categoryHerbs.filter((herb) => {
          const searchableText = normalizeText(
            [
              herb.name,
              herb.slug,
              herb.short_description,
              herb.description,
              herb.traditional_uses,
            ]
              .filter(Boolean)
              .join(" "),
          );

          return searchableText.includes(normalizedQuery);
        })
      : categoryHerbs;

    return [...searchedHerbs].sort((firstHerb, secondHerb) => {
      if (sortOption === "name-desc") {
        return secondHerb.name.localeCompare(firstHerb.name, "bg-BG");
      }

      if (sortOption === "newest") {
        return new Date(secondHerb.created_at ?? 0).getTime() - new Date(firstHerb.created_at ?? 0).getTime();
      }

      if (sortOption === "oldest") {
        return new Date(firstHerb.created_at ?? 0).getTime() - new Date(secondHerb.created_at ?? 0).getTime();
      }

      return firstHerb.name.localeCompare(secondHerb.name, "bg-BG");
    });
  }, [herbIdsByCategory, herbs, searchQuery, selectedCategoryId, sortOption]);

  return (
    <section>
      <div className="rounded-3xl border border-emerald-800/70 bg-emerald-950/70 p-5 shadow-xl shadow-black/20 sm:p-6">
        <h2 className="text-xl font-bold text-yellow-200">Филтриране на билките</h2>
        <p className="mt-2 leading-7 text-emerald-100">
          Изберете категория, за да разгледате билки според традиционната им употреба.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_260px]">
          <div>
            <label htmlFor="herb-search" className="block text-sm font-bold text-emerald-100">
              Търсене
            </label>
            <input
              id="herb-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Търси билка..."
              className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none placeholder:text-emerald-200/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
            />
          </div>

          <div>
            <label htmlFor="herb-sort" className="block text-sm font-bold text-emerald-100">
              Подреждане
            </label>
            <select
              id="herb-sort"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as SortOption)}
              className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
            >
              <option value="name-asc">По име А-Я</option>
              <option value="name-desc">По име Я-А</option>
              <option value="newest">Най-нови</option>
              <option value="oldest">Най-стари</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategoryId("all")}
            className={
              selectedCategoryId === "all"
                ? "min-h-11 rounded-full border border-yellow-200 bg-yellow-300 px-4 py-2 text-sm font-bold text-green-950 shadow-lg"
                : "min-h-11 rounded-full border border-emerald-700 bg-emerald-900/70 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
            }
          >
            Всички
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategoryId(category.id)}
              className={
                selectedCategoryId === category.id
                  ? "min-h-11 rounded-full border border-yellow-200 bg-yellow-300 px-4 py-2 text-sm font-bold text-green-950 shadow-lg"
                  : "min-h-11 rounded-full border border-emerald-700 bg-emerald-900/70 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
              }
            >
              {category.name}
            </button>
          ))}
        </div>

        <p className="mt-5 text-sm font-semibold text-emerald-100">
          Показани билки: {filteredHerbs.length}
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredHerbs.length > 0 ? (
          filteredHerbs.map((herb) => (
            <Link
              key={herb.slug}
              href={`/herbs/${herb.slug}`}
              className="group rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-yellow-300 sm:p-6"
            >
              <article>
                {herb.image_url ? (
                  <img
                    src={herb.image_url}
                    alt={herb.image_alt || "Снимка на билка"}
                    className="h-44 w-full rounded-2xl object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <div className="flex h-44 w-full flex-col items-center justify-center rounded-2xl border border-emerald-700 bg-emerald-950/60 text-emerald-100">
                    <span className="text-4xl" aria-hidden="true">
                      {herb.emoji ?? "🌿"}
                    </span>
                    <span className="mt-3 text-sm font-semibold">Няма снимка</span>
                  </div>
                )}

                <h2 className="mt-4 text-2xl font-bold text-yellow-200">{herb.name}</h2>

                {herb.latin ? (
                  <p className="mt-1 text-sm italic text-green-100">{herb.latin}</p>
                ) : null}

                <p className="mt-4 leading-7 text-green-50">
                  {herb.short_description ??
                    "Традиционно използвана билка с нужда от внимателен и образователен подход."}
                </p>

                <p className="mt-5 text-sm font-semibold text-yellow-300 transition group-hover:text-yellow-100">
                  Виж подробности
                </p>
              </article>
            </Link>
          ))
        ) : (
          <div className="rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6 md:col-span-2 lg:col-span-3">
            {searchQuery.trim()
              ? "Няма намерени билки за избраното търсене."
              : "Няма намерени билки в тази категория."}
          </div>
        )}
      </div>
    </section>
  );
}
