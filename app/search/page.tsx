import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/app/components/Header";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

type HerbResult = {
  slug: string;
  name: string;
  latin: string | null;
  emoji: string | null;
  short_description: string | null;
};

type SymptomResult = {
  slug: string;
  name: string;
  description: string | null;
};

async function searchData(query: string) {
  if (!query.trim()) {
    return { herbs: [] as HerbResult[], symptoms: [] as SymptomResult[] };
  }

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const escapedQuery = query.replaceAll("%", "\\%").replaceAll("_", "\\_");
  const pattern = `%${escapedQuery}%`;

  const [{ data: herbs, error: herbsError }, { data: symptoms, error: symptomsError }] =
    await Promise.all([
      supabase
        .from("herbs")
        .select("slug, name, latin, emoji, short_description")
        .or(`name.ilike.${pattern},latin.ilike.${pattern},short_description.ilike.${pattern}`)
        .order("name", { ascending: true }),
      supabase
        .from("symptoms")
        .select("slug, name, description")
        .or(`name.ilike.${pattern},description.ilike.${pattern}`)
        .order("name", { ascending: true }),
    ]);

  if (herbsError) {
    throw new Error(herbsError.message);
  }

  if (symptomsError) {
    throw new Error(symptomsError.message);
  }

  return {
    herbs: (herbs ?? []) as HerbResult[],
    symptoms: (symptoms ?? []) as SymptomResult[],
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const { herbs, symptoms } = await searchData(query);
  const hasSearched = query.length > 0;
  const hasResults = herbs.length > 0 || symptoms.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-6xl">
        <Header />

        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Образователно търсене
          </p>
          <h1 className="mt-3 text-3xl font-bold text-yellow-200 sm:text-5xl">
            Търсене
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Потърсете билка, латинско име, симптом или кратко описание. Резултатите
            са за ориентация и подготовка за информиран разговор със специалист.
          </p>
        </header>

        <form className="mt-8 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6" action="/search">
          <label htmlFor="q" className="block text-lg font-bold text-yellow-200">
            Потърсете билки и симптоми
          </label>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Например: лайка, стрес, подуване..."
              className="min-h-14 flex-1 rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none placeholder:text-emerald-200/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
            />
            <button
              type="submit"
              className="min-h-14 rounded-2xl bg-yellow-300 px-6 py-4 font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:ring-offset-2 focus:ring-offset-green-950"
            >
              Търси
            </button>
          </div>
        </form>

        <div className="mt-8 rounded-2xl border border-yellow-300/40 bg-yellow-300/10 p-5 text-yellow-50">
          Търсенето предоставя образователна информация и не замества консултация с лекар.
        </div>

        {hasSearched ? (
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-yellow-200">
              Резултати за „{query}“
            </h2>

            {hasResults ? (
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <ResultGroup title="Билки">
                  {herbs.length > 0 ? (
                    herbs.map((herb) => (
                      <Link
                        key={herb.slug}
                        href={`/herbs/${herb.slug}`}
                        className="block rounded-2xl border border-emerald-800/70 bg-emerald-950/70 p-5 shadow-xl shadow-black/20 transition hover:border-yellow-300"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl" aria-hidden="true">
                            {herb.emoji ?? "🌿"}
                          </span>
                          <div>
                            <h3 className="text-xl font-bold text-emerald-50">{herb.name}</h3>
                            {herb.latin ? (
                              <p className="mt-1 text-sm italic text-emerald-200">{herb.latin}</p>
                            ) : null}
                          </div>
                        </div>
                        <p className="mt-4 leading-7 text-emerald-100">
                          {herb.short_description ?? "Няма добавено кратко описание."}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <EmptyState text="Няма намерени билки." />
                  )}
                </ResultGroup>

                <ResultGroup title="Симптоми">
                  {symptoms.length > 0 ? (
                    symptoms.map((symptom) => (
                      <Link
                        key={symptom.slug}
                        href="/symptoms"
                        className="block rounded-2xl border border-emerald-800/70 bg-emerald-950/70 p-5 shadow-xl shadow-black/20 transition hover:border-yellow-300"
                      >
                        <h3 className="text-xl font-bold text-emerald-50">{symptom.name}</h3>
                        <p className="mt-3 leading-7 text-emerald-100">
                          {symptom.description ?? "Няма добавено описание."}
                        </p>
                        <p className="mt-4 text-sm font-semibold text-yellow-200">
                          Виж секцията Симптоми
                        </p>
                      </Link>
                    ))
                  ) : (
                    <EmptyState text="Няма намерени симптоми." />
                  )}
                </ResultGroup>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-emerald-800 bg-emerald-950/70 p-5 text-emerald-100">
                Няма резултати. Опитайте с друго име на билка, симптом или по-кратка дума.
              </div>
            )}
          </section>
        ) : null}
      </section>
    </main>
  );
}

function ResultGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-yellow-200">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-emerald-800 bg-emerald-950/50 p-5 text-emerald-100">
      {text}
    </div>
  );
}
