import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/app/components/Header";

export const dynamic = "force-dynamic";

type Symptom = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

type RelatedHerb = {
  slug: string;
  name: string;
  emoji: string | null;
};

type SymptomCard = Symptom & {
  herbs: RelatedHerb[];
};

type HerbSymptomRow = {
  symptom_id: string;
  herbs: RelatedHerb | RelatedHerb[] | null;
};

type SymptomsPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
  }>;
};

function normalizeText(text: string) {
  return text.toLocaleLowerCase("bg-BG").trim();
}

function filterAndSortSymptoms(symptoms: SymptomCard[], query: string, sort: string) {
  const normalizedQuery = normalizeText(query);
  const filteredSymptoms = normalizedQuery
    ? symptoms.filter((symptom) => {
        const searchableText = normalizeText(
          [symptom.name, symptom.slug, symptom.description].filter(Boolean).join(" "),
        );

        return searchableText.includes(normalizedQuery);
      })
    : symptoms;

  return [...filteredSymptoms].sort((firstSymptom, secondSymptom) => {
    if (sort === "name-desc") {
      return secondSymptom.name.localeCompare(firstSymptom.name, "bg-BG");
    }

    return firstSymptom.name.localeCompare(secondSymptom.name, "bg-BG");
  });
}

async function getSymptomsWithHerbs(): Promise<SymptomCard[]> {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const { data: symptoms, error: symptomsError } = await supabase
    .from("symptoms")
    .select("id, slug, name, description")
    .order("name", { ascending: true });

  if (symptomsError) {
    throw new Error(symptomsError.message);
  }

  const { data: links, error: linksError } = await supabase
    .from("herb_symptoms")
    .select("symptom_id, herbs(slug, name, emoji)");

  if (linksError) {
    throw new Error(linksError.message);
  }

  const herbsBySymptom = new Map<string, RelatedHerb[]>();

  for (const link of (links ?? []) as HerbSymptomRow[]) {
    const relatedHerbs = Array.isArray(link.herbs)
      ? link.herbs
      : link.herbs
        ? [link.herbs]
        : [];

    const existing = herbsBySymptom.get(link.symptom_id) ?? [];
    herbsBySymptom.set(link.symptom_id, [...existing, ...relatedHerbs]);
  }

  return ((symptoms ?? []) as Symptom[]).map((symptom) => ({
    ...symptom,
    herbs: herbsBySymptom.get(symptom.id) ?? [],
  }));
}

export default async function SymptomsPage({ searchParams }: SymptomsPageProps) {
  const { q, sort } = await searchParams;
  const query = q?.trim() ?? "";
  const sortOption = sort === "name-desc" ? "name-desc" : "name-asc";
  const symptoms = await getSymptomsWithHerbs();
  const filteredSymptoms = filterAndSortSymptoms(symptoms, query, sortOption);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-14">
      <Header />

      <section className="mb-8 mt-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
          Образователен справочник
        </p>
        <h1 className="mt-3 text-3xl font-bold text-emerald-50 sm:text-5xl">
          Търсене по симптом
        </h1>
        <p className="mt-4 text-lg leading-8 text-emerald-100">
          Изберете симптом или тема, за да видите билки, които може да се свързват с
          традиционна употреба. Информацията е за ориентация и подготовка за разговор
          със специалист, не е лечение.
        </p>

        <div className="mt-5 rounded-2xl border border-amber-300/40 bg-amber-300/10 p-4 text-amber-100">
          Информацията е образователна. При сериозни или продължителни симптоми
          потърсете лекар.
        </div>
      </section>

      <div className="mb-8 rounded-2xl border border-amber-300/40 bg-amber-300/10 p-5 text-amber-100">
        <h2 className="text-lg font-semibold">Важно предупреждение</h2>
        <p className="mt-2 leading-7">
          Информацията е образователна и не замества консултация с лекар. При силни,
          внезапни или продължителни симптоми потърсете медицинска помощ.
        </p>
      </div>

      <form
        action="/symptoms"
        className="mb-8 rounded-3xl border border-emerald-800/70 bg-emerald-950/70 p-5 shadow-xl shadow-black/20 sm:p-6"
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
              placeholder="Търси симптом..."
              className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none placeholder:text-emerald-200/70 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30"
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
              className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30"
            >
              <option value="name-asc">По име А-Я</option>
              <option value="name-desc">По име Я-А</option>
            </select>
          </div>

          <button
            type="submit"
            className="min-h-12 rounded-2xl bg-amber-300 px-6 py-3 font-bold text-green-950 shadow-lg transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-100 focus:ring-offset-2 focus:ring-offset-emerald-950"
          >
            Приложи
          </button>
        </div>

        <p className="mt-5 text-sm font-semibold text-emerald-100">
          Показани симптоми: {filteredSymptoms.length}
        </p>
      </form>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredSymptoms.length > 0 ? (
          filteredSymptoms.map((symptom) => (
            <article
              key={symptom.slug}
              className="rounded-2xl border border-emerald-800/70 bg-emerald-950/70 p-5 shadow-xl shadow-black/20 sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    Симптом
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-emerald-50">
                    {symptom.name}
                  </h2>
                </div>
                <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase text-amber-100">
                  не е лечение
                </span>
              </div>

              <p className="mt-5 leading-7 text-emerald-100">
                {symptom.description ??
                  "Може да се свързва с традиционна употреба на някои билки, но не е лечение и не замества медицинска консултация."}
              </p>

              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200">
                  Свързани билки
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {symptom.herbs.length > 0 ? (
                    symptom.herbs.map((herb) => (
                      <Link
                        key={herb.slug}
                        href={`/herbs/${herb.slug}`}
                        className="rounded-full border border-emerald-700 bg-emerald-900/60 px-3 py-2 text-sm font-medium text-emerald-50 transition hover:border-amber-300 hover:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-emerald-950"
                      >
                        <span aria-hidden="true">{herb.emoji ?? "🌿"}</span> {herb.name}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-emerald-100">
                      Все още няма свързани билки за този симптом.
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-emerald-800/70 bg-emerald-950/70 p-5 text-emerald-100 shadow-xl shadow-black/20 sm:p-6 md:col-span-2 xl:col-span-3">
            Няма намерени симптоми за избраното търсене.
          </div>
        )}
      </div>
    </div>
  );
}
