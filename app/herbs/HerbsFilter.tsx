"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { HerbCategory, HerbCategoryConnection, HerbListItem } from "./page";

type HerbsFilterProps = {
  herbs: HerbListItem[];
  categories: HerbCategory[];
  connections: HerbCategoryConnection[];
};

export default function HerbsFilter({ herbs, categories, connections }: HerbsFilterProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

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
    if (selectedCategoryId === "all") {
      return herbs;
    }

    const allowedHerbIds = herbIdsByCategory.get(selectedCategoryId) ?? new Set<string>();
    return herbs.filter((herb) => allowedHerbIds.has(herb.id));
  }, [herbIdsByCategory, herbs, selectedCategoryId]);

  return (
    <section>
      <div className="rounded-3xl border border-emerald-800/70 bg-emerald-950/70 p-5 shadow-xl shadow-black/20 sm:p-6">
        <h2 className="text-xl font-bold text-yellow-200">Филтър по категория</h2>
        <p className="mt-2 leading-7 text-emerald-100">
          Изберете категория, за да разгледате билки според традиционната им употреба.
        </p>

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
                <div className="text-4xl" aria-hidden="true">
                  {herb.emoji ?? "🌿"}
                </div>

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
            Няма намерени билки в тази категория.
          </div>
        )}
      </div>
    </section>
  );
}
