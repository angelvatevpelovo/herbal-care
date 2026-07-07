import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "./components/Header";

export const dynamic = "force-dynamic";

type FeaturedHerb = {
  slug: string;
  name: string;
  image_url?: string | null;
  image_alt?: string | null;
  short_description: string | null;
  created_at?: string | null;
};

async function getFeaturedHerb(): Promise<FeaturedHerb | null> {
  if (!supabase) {
    return null;
  }

  const latest = await supabase
    .from("herbs")
    .select("slug, name, image_url, image_alt, short_description, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest.error && latest.data) {
    return latest.data as FeaturedHerb;
  }

  const fallback = await supabase
    .from("herbs")
    .select("slug, name, image_url, image_alt, short_description")
    .order("name", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (fallback.error) {
    throw new Error(fallback.error.message);
  }

  return (fallback.data as FeaturedHerb | null) ?? null;
}

export default async function HomePage() {
  const featuredHerb = await getFeaturedHerb();

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 text-emerald-50">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        <Header />

        <section className="grid flex-1 items-center gap-8 py-12 sm:py-16 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="mb-4 inline-block rounded-full border border-emerald-400/40 bg-emerald-900/70 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-sm">
              Herbal Care MVP
            </p>

            <h1 className="text-4xl font-bold leading-tight text-yellow-100 sm:text-5xl lg:text-6xl">
              Билкова грижа с внимание и безопасност
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-100">
              Herbal Care помага да откривате билки, симптоми и традиционни начини на
              употреба, без да замества лекарска консултация.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/herbs"
                className="min-h-12 rounded-2xl bg-yellow-300 px-6 py-4 text-center font-bold text-green-950 shadow-lg transition hover:bg-yellow-200"
              >
                Разгледай билките
              </Link>

              <Link
                href="/symptoms"
                className="min-h-12 rounded-2xl border border-emerald-300/60 bg-emerald-800/70 px-6 py-4 text-center font-bold text-emerald-50 transition hover:bg-emerald-700"
              >
                Потърси по симптом
              </Link>

              <Link
                href="/ai"
                className="min-h-12 rounded-2xl border border-yellow-300/70 bg-green-950 px-6 py-4 text-center font-bold text-yellow-100 shadow-lg transition hover:bg-green-900"
              >
                Попитай AI помощника
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-emerald-200">
              <Link href="/search" className="transition hover:text-yellow-200">
                Търсене
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/categories" className="transition hover:text-yellow-200">
                Категории
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/about" className="transition hover:text-yellow-200">
                За Herbal Care
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-yellow-300/30 bg-yellow-300/10 p-5 shadow-2xl ring-1 ring-white/10 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-yellow-200">
              Важно за безопасността
            </p>
            <h2 className="mt-3 text-2xl font-bold text-yellow-100">Без диагнози и лечение</h2>
            <p className="mt-4 leading-7 text-yellow-50">
              Информацията в Herbal Care е образователна. При силни, продължителни или
              тревожни симптоми потърсете лекар.
            </p>
          </aside>
        </section>

        {featuredHerb ? (
          <section className="pb-10">
            <div className="overflow-hidden rounded-3xl border border-emerald-700/70 bg-white/10 shadow-2xl ring-1 ring-white/10">
              <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                {featuredHerb.image_url ? (
                  <img
                    src={featuredHerb.image_url}
                    alt={featuredHerb.image_alt || "Снимка на билка"}
                    className="h-64 w-full object-cover sm:h-80 lg:h-full"
                  />
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center bg-emerald-950/70 text-emerald-100 sm:h-80 lg:h-full">
                    <span className="text-6xl" aria-hidden="true">
                      🌿
                    </span>
                    <span className="mt-4 text-sm font-semibold">Няма снимка</span>
                  </div>
                )}

                <div className="p-5 sm:p-6 lg:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    Билка на деня
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-yellow-100 sm:text-4xl">
                    {featuredHerb.name}
                  </h2>
                  {featuredHerb.short_description ? (
                    <p className="mt-4 leading-7 text-emerald-50">
                      {featuredHerb.short_description}
                    </p>
                  ) : null}
                  <p className="mt-5 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-50">
                    Информацията е образователна и не замества лекарска консултация.
                  </p>
                  <Link
                    href={`/herbs/${featuredHerb.slug}`}
                    className="mt-6 inline-flex min-h-12 items-center rounded-2xl bg-yellow-300 px-6 py-3 text-center font-bold text-green-950 shadow-lg transition hover:bg-yellow-200"
                  >
                    Виж билката
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="pb-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Възможности
            </p>
            <h2 className="mt-2 text-3xl font-bold text-yellow-100">
              Какво може да правите в Herbal Care
            </h2>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Билки",
                text: "Преглеждайте билки, описание, употреба и предпазни мерки.",
                href: "/herbs",
              },
              {
                title: "Симптоми",
                text: "Откривайте билки, свързани с често срещани оплаквания.",
                href: "/symptoms",
              },
              {
                title: "Категории",
                text: "Разглеждайте билките по теми като имунитет, храносмилане и нервна система.",
                href: "/categories",
              },
              {
                title: "AI помощник",
                text: "Задавайте въпроси и получавайте внимателни образователни насоки.",
                href: "/ai",
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-3xl border border-emerald-700/70 bg-white/10 p-5 shadow-xl ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-yellow-300 sm:p-6"
              >
                <h3 className="text-xl font-bold text-yellow-200">{card.title}</h3>
                <p className="mt-3 leading-7 text-emerald-100">{card.text}</p>
                <p className="mt-4 text-sm font-semibold text-yellow-300 transition group-hover:text-yellow-100">
                  Отвори
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="pb-14">
          <div className="rounded-3xl border border-emerald-700/70 bg-emerald-950/70 p-5 shadow-2xl ring-1 ring-white/10 sm:p-6 lg:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Безопасен подход
            </p>
            <h2 className="mt-2 text-3xl font-bold text-yellow-100">
              Защо е важно вниманието
            </h2>
            <div className="mt-5 grid gap-4 text-emerald-50 md:grid-cols-2">
              <p className="leading-7">
                Билките могат да имат взаимодействия с лекарства и не са подходящи за
                всеки човек. По-внимателни трябва да бъдат бременни, деца, хора с
                хронични заболявания, алергии или редовен прием на медикаменти.
              </p>
              <p className="leading-7">
                Herbal Care не поставя диагнози, не назначава лечение и не заменя
                лекар. При сериозни, внезапни, продължителни или тревожни симптоми
                лекарската консултация е важна.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
