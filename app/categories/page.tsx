import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Category = {
  slug: string;
  name: string;
  description: string | null;
};

type CategoriesPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
  }>;
};

function normalizeText(text: string) {
  return text.toLocaleLowerCase("bg-BG").trim();
}

function filterAndSortCategories(categories: Category[], query: string, sort: string) {
  const normalizedQuery = normalizeText(query);
  const filteredCategories = normalizedQuery
    ? categories.filter((category) => {
        const searchableText = normalizeText(
          [category.name, category.slug, category.description].filter(Boolean).join(" "),
        );

        return searchableText.includes(normalizedQuery);
      })
    : categories;

  return [...filteredCategories].sort((firstCategory, secondCategory) => {
    if (sort === "name-desc") {
      return secondCategory.name.localeCompare(firstCategory.name, "bg-BG");
    }

    return firstCategory.name.localeCompare(secondCategory.name, "bg-BG");
  });
}

async function getCategories(): Promise<Category[]> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { data, error } = await supabase
    .from("categories")
    .select("slug, name, description")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Category[];
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const { q, sort } = await searchParams;
  const query = q?.trim() ?? "";
  const sortOption = sort === "name-desc" ? "name-desc" : "name-asc";
  const categories = await getCategories();
  const filteredCategories = filterAndSortCategories(categories, query, sortOption);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-6xl">
        <Header />

        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Библиотека по теми
          </p>
          <h1 className="mt-3 text-3xl font-bold text-yellow-200 sm:text-5xl">
            Категории
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Разгледайте билките по образователни категории като храносмилане, имунитет, нервна
            система, кожа и обща грижа. Информацията не е диагноза и не замества лекар.
          </p>

          <p className="mt-5 rounded-2xl border border-emerald-700 bg-emerald-950/70 p-4 leading-7 text-emerald-100">
            Разглеждайте билките по теми като имунитет, храносмилане, нервна система, кожа и други.
          </p>

          <div className="mt-4 rounded-2xl border border-yellow-300/40 bg-yellow-300/10 p-4 text-yellow-50">
            Информацията е образователна и не замества лекарска консултация.
          </div>
        </header>

        <form
          action="/categories"
          className="mt-8 rounded-3xl border border-emerald-800/70 bg-emerald-950/70 p-5 shadow-xl shadow-black/20 sm:p-6"
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_240px_auto] lg:items-end">
            <div>
              <label htmlFor="q" className="block text-sm font-bold text-emerald-100">
                Търсене
              </label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Търси категория..."
                className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none placeholder:text-emerald-200/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
              />
            </div>

            <div>
              <label htmlFor="sort" className="block text-sm font-bold text-emerald-100">
                Подреждане
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={sortOption}
                className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
              >
                <option value="name-asc">По име А-Я</option>
                <option value="name-desc">По име Я-А</option>
              </select>
            </div>

            <button
              type="submit"
              className="min-h-12 rounded-2xl bg-yellow-300 px-6 py-3 font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:ring-offset-2 focus:ring-offset-emerald-950"
            >
              Приложи
            </button>
          </div>

          <p className="mt-5 text-sm font-semibold text-emerald-100">
            Показани категории: {filteredCategories.length}
          </p>
        </form>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-yellow-300 sm:p-6"
              >
                <article>
                  <div className="text-4xl" aria-hidden="true">
                    🌿
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-yellow-200">{category.name}</h2>
                  <p className="mt-4 leading-7 text-emerald-50">
                    {category.description ??
                      "Образователна категория за традиционна употреба, предпазни мерки и подготовка за разговор със специалист."}
                  </p>
                  <p className="mt-5 text-sm font-semibold text-yellow-300 transition group-hover:text-yellow-100">
                    Виж свързаните билки
                  </p>
                </article>
              </Link>
            ))
          ) : (
            <div className="rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6 md:col-span-2 lg:col-span-3">
              Няма намерени категории за избраното търсене.
            </div>
          )}
        </div>

        <div className="mt-10 rounded-3xl bg-yellow-100 p-5 text-yellow-950 ring-1 ring-yellow-200 sm:p-6">
          <h2 className="font-bold">Важно предупреждение</h2>
          <p className="mt-2 leading-7">
            Категориите са само за ориентация. Билките може да имат противопоказания и лекарствени
            взаимодействия. При силни, внезапни или продължителни симптоми потърсете медицинска
            помощ.
          </p>
        </div>
      </section>
    </main>
  );
}
