import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Category = {
  slug: string;
  name: string;
  description: string | null;
};

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

export default async function CategoriesPage() {
  const categories = await getCategories();

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
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
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
          ))}
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
