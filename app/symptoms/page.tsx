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

export default async function SymptomsPage() {
  const symptoms = await getSymptomsWithHerbs();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <Header />

      <section className="mb-8 mt-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
          Образователен справочник
        </p>
        <h1 className="mt-3 text-4xl font-bold text-emerald-50 sm:text-5xl">
          Търсене по симптом
        </h1>
        <p className="mt-4 text-lg leading-8 text-emerald-100">
          Изберете симптом или тема, за да видите билки, които може да се свързват с
          традиционна употреба. Информацията е за ориентация и подготовка за разговор
          със специалист, не е лечение.
        </p>
      </section>

      <div className="mb-8 rounded-2xl border border-amber-300/40 bg-amber-300/10 p-5 text-amber-100">
        <h2 className="text-lg font-semibold">Важно предупреждение</h2>
        <p className="mt-2 leading-7">
          Информацията е образователна и не замества консултация с лекар. При силни,
          внезапни или продължителни симптоми потърсете медицинска помощ.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {symptoms.map((symptom) => (
          <article
            key={symptom.slug}
            className="rounded-2xl border border-emerald-800/70 bg-emerald-950/70 p-6 shadow-xl shadow-black/20"
          >
            <div className="flex items-start justify-between gap-4">
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
        ))}
      </div>
    </div>
  );
}
