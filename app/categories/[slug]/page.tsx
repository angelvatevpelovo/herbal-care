import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

type Herb = {
  slug: string;
  name: string;
  latin: string | null;
  emoji: string | null;
  short_description: string | null;
};

type HerbCategoryRow = {
  herbs: Herb | Herb[] | null;
};

async function getCategoryWithHerbs(slug: string): Promise<{ category: Category; herbs: Herb[] } | null> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, slug, name, description")
    .eq("slug", slug)
    .maybeSingle();

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  if (!category) {
    return null;
  }

  const { data: links, error: linksError } = await supabase
    .from("herb_categories")
    .select("herbs(slug, name, latin, emoji, short_description)")
    .eq("category_id", category.id);

  if (linksError) {
    throw new Error(linksError.message);
  }

  const herbs = ((links ?? []) as HerbCategoryRow[])
    .flatMap((row) => {
      if (!row.herbs) {
        return [];
      }

      return Array.isArray(row.herbs) ? row.herbs : [row.herbs];
    })
    .sort((a, b) => a.name.localeCompare(b.name, "bg"));

  return { category: category as Category, herbs };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getCategoryWithHerbs(slug);

  if (!result) {
    notFound();
  }

  const { category, herbs } = result;

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-6xl">
        <Header />

        <Link href="/categories" className="mt-8 inline-flex text-sm font-semibold text-yellow-300">
          ← Назад към категориите
        </Link>

        <header className="mt-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Категория
          </p>
          <h1 className="mt-3 text-3xl font-bold text-yellow-200 sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            {category.description ??
              "Образователна категория за билки, традиционна употреба, предпазни мерки и подготовка за разговор със специалист."}
          </p>
        </header>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-yellow-200">Свързани билки</h2>

          {herbs.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {herbs.map((herb) => (
                <Link
                  key={herb.slug}
                  href={`/herbs/${herb.slug}`}
                  className="group rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-yellow-300 sm:p-6"
                >
                  <article>
                    <div className="text-4xl" aria-hidden="true">
                      {herb.emoji ?? "🌿"}
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-yellow-200">{herb.name}</h3>
                    {herb.latin ? (
                      <p className="mt-1 text-sm italic text-emerald-100">{herb.latin}</p>
                    ) : null}
                    <p className="mt-4 leading-7 text-emerald-50">
                      {herb.short_description ??
                        "Традиционно използвана билка с нужда от внимателен и образователен подход."}
                    </p>
                    <p className="mt-5 text-sm font-semibold text-yellow-300 transition group-hover:text-yellow-100">
                      Виж подробности
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
              Все още няма свързани билки към тази категория.
            </div>
          )}
        </section>

        <div className="mt-10 rounded-3xl bg-yellow-100 p-5 text-yellow-950 ring-1 ring-yellow-200 sm:p-6">
          <h2 className="font-bold">Важно предупреждение</h2>
          <p className="mt-2 leading-7">
            Информацията е образователна и не замества консултация с лекар или фармацевт. Билките
            може да имат противопоказания, алергии и взаимодействия с лекарства.
          </p>
        </div>
      </section>
    </main>
  );
}
