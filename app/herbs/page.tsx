import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/app/components/Header";

export const dynamic = "force-dynamic";

type HerbListItem = {
  slug: string;
  name: string;
  latin: string | null;
  emoji: string | null;
  short_description: string | null;
  created_at: string | null;
};

async function getHerbs(): Promise<HerbListItem[]> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { data, error } = await supabase
    .from("herbs")
    .select("slug, name, latin, emoji, short_description, created_at")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export default async function HerbsPage() {
  const herbs = await getHerbs();

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-6 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <Header />

        <header className="mb-10 mt-10">
          <Link href="/" className="text-sm font-semibold text-yellow-300">
            ← Начало
          </Link>

          <h1 className="mt-4 text-4xl font-bold text-yellow-200">Билки</h1>

          <p className="mt-3 max-w-2xl leading-7 text-green-100">
            Тук ще откриеш образователна информация за билки, тяхната традиционна
            употреба и важни предпазни мерки. Информацията не е лечение и не замества
            медицинска консултация.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {herbs.map((herb) => (
            <Link
              key={herb.slug}
              href={`/herbs/${herb.slug}`}
              className="group rounded-3xl bg-white/10 p-6 shadow-xl ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            >
              <article>
                <div className="text-4xl" aria-hidden="true">
                  {herb.emoji ?? "🌿"}
                </div>

                <h2 className="mt-4 text-2xl font-bold text-yellow-200">
                  {herb.name}
                </h2>

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
          ))}
        </div>

        <div className="mt-10 rounded-3xl bg-yellow-100 p-6 text-yellow-950 ring-1 ring-yellow-200">
          <h3 className="font-bold">Важно предупреждение</h3>
          <p className="mt-2 leading-7">
            Информацията в Herbal Care е образователна и не замества лекарска
            консултация. При сериозни симптоми, бременност, хронични заболявания
            или прием на лекарства трябва да се консултираш с лекар или фармацевт.
          </p>
        </div>
      </section>
    </main>
  );
}
