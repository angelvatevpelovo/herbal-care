import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/app/components/Header";
import FavoriteHerbButton from "./FavoriteHerbButton";

export const dynamic = "force-dynamic";

type HerbDetail = {
  id: string;
  slug: string;
  name: string;
  latin: string | null;
  emoji: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  image_credit?: string | null;
  image_source_url?: string | null;
  short_description: string | null;
  description: string | null;
  traditional_uses: string | null;
  preparation: string | null;
  precautions: string | null;
  interactions: string | null;
  when_to_see_doctor: string | null;
};

type HerbRecipe = {
  id: string;
  herb_id: string;
  title: string | null;
  preparation_type: string | null;
  ingredients: string | null;
  instructions: string | null;
  dosage_note: string | null;
  safety_note: string | null;
  created_at: string | null;
};

type RelatedSymptom = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

type RelatedCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

type SimilarHerb = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
};

async function getHerb(slug: string): Promise<HerbDetail | null> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { data, error } = await supabase
    .from("herbs")
    .select(
      "id, slug, name, latin, emoji, image_url, image_alt, image_credit, image_source_url, short_description, description, traditional_uses, preparation, precautions, interactions, when_to_see_doctor",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function getHerbRecipes(herbId: string): Promise<HerbRecipe[]> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { data, error } = await supabase
    .from("herb_recipes")
    .select(
      "id, herb_id, title, preparation_type, ingredients, instructions, dosage_note, safety_note, created_at",
    )
    .eq("herb_id", herbId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as HerbRecipe[];
}

async function getRelatedSymptoms(herbId: string): Promise<RelatedSymptom[]> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { data: relations, error: relationError } = await supabase
    .from("herb_symptoms")
    .select("symptom_id")
    .eq("herb_id", herbId);

  if (relationError) {
    throw new Error(relationError.message);
  }

  const symptomIds = (relations ?? [])
    .map((relation) => relation.symptom_id)
    .filter(Boolean);

  if (symptomIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("symptoms")
    .select("id, slug, name, description")
    .in("id", symptomIds)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RelatedSymptom[];
}

async function getRelatedCategories(herbId: string): Promise<RelatedCategory[]> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { data: relations, error: relationError } = await supabase
    .from("herb_categories")
    .select("category_id")
    .eq("herb_id", herbId);

  if (relationError) {
    throw new Error(relationError.message);
  }

  const categoryIds = (relations ?? [])
    .map((relation) => relation.category_id)
    .filter(Boolean);

  if (categoryIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description")
    .in("id", categoryIds)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RelatedCategory[];
}

async function getSimilarHerbs(
  herbId: string,
  symptomIds: string[],
  categoryIds: string[],
): Promise<SimilarHerb[]> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const similarIds = new Set<string>();

  if (symptomIds.length > 0) {
    const { data, error } = await supabase
      .from("herb_symptoms")
      .select("herb_id")
      .in("symptom_id", symptomIds);

    if (error) {
      throw new Error(error.message);
    }

    (data ?? []).forEach((relation) => {
      if (relation.herb_id !== herbId) {
        similarIds.add(relation.herb_id);
      }
    });
  }

  if (categoryIds.length > 0) {
    const { data, error } = await supabase
      .from("herb_categories")
      .select("herb_id")
      .in("category_id", categoryIds);

    if (error) {
      throw new Error(error.message);
    }

    (data ?? []).forEach((relation) => {
      if (relation.herb_id !== herbId) {
        similarIds.add(relation.herb_id);
      }
    });
  }

  const ids = Array.from(similarIds);

  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("herbs")
    .select("id, slug, name, short_description")
    .in("id", ids)
    .order("name", { ascending: true })
    .limit(4);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SimilarHerb[];
}

export default async function HerbDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const herb = await getHerb(slug);

  if (!herb) {
    notFound();
  }

  const [recipes, relatedSymptoms, relatedCategories] = await Promise.all([
    getHerbRecipes(herb.id),
    getRelatedSymptoms(herb.id),
    getRelatedCategories(herb.id),
  ]);
  const similarHerbs = await getSimilarHerbs(
    herb.id,
    relatedSymptoms.map((symptom) => symptom.id),
    relatedCategories.map((category) => category.id),
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-6xl">
        <Header />

        <Link href="/herbs" className="mt-8 inline-flex text-sm font-semibold text-yellow-300">
          ← Назад към билките
        </Link>

        <article className="mt-8 space-y-6">
          <section className="grid gap-6 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Билкова библиотека
              </p>
              <div className="mt-5 text-5xl sm:text-6xl" aria-hidden="true">
                {herb.emoji ?? "🌿"}
              </div>

              <h1 className="mt-6 text-3xl font-bold text-yellow-200 sm:text-5xl">
                {herb.name}
              </h1>

              {herb.latin ? (
                <p className="mt-3 text-lg italic text-green-100">{herb.latin}</p>
              ) : null}

              {herb.short_description ? (
                <p className="mt-5 max-w-2xl rounded-2xl bg-green-950/50 p-4 leading-7 text-green-50 ring-1 ring-white/10 sm:p-5">
                  {herb.short_description}
                </p>
              ) : null}

              <FavoriteHerbButton herbId={herb.id} />
            </div>

            {herb.image_url ? (
              <figure>
                <img
                  src={herb.image_url}
                  alt={herb.image_alt || "Снимка на билка"}
                  className="h-64 w-full rounded-3xl object-cover ring-1 ring-white/10 sm:h-80 lg:h-full lg:min-h-[360px]"
                />
                {herb.image_credit || herb.image_source_url ? (
                  <figcaption className="mt-2 text-xs text-emerald-200">
                    Снимка: {herb.image_credit ?? "не е посочен автор"}
                    {herb.image_source_url ? (
                      <>
                        {" "}
                        <Link
                          href={herb.image_source_url}
                          className="font-semibold text-yellow-300 hover:text-yellow-100"
                        >
                          източник
                        </Link>
                      </>
                    ) : null}
                  </figcaption>
                ) : null}
              </figure>
            ) : (
              <div className="flex min-h-64 w-full flex-col items-center justify-center rounded-3xl border border-emerald-700 bg-emerald-950/60 text-emerald-100 ring-1 ring-white/10 sm:min-h-80 lg:min-h-[360px]">
                <span className="text-6xl" aria-hidden="true">
                  {herb.emoji ?? "🌿"}
                </span>
                <span className="mt-4 text-sm font-semibold">Няма добавена снимка</span>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-yellow-300/40 bg-yellow-300/10 p-5 text-yellow-50 shadow-xl ring-1 ring-white/10 sm:p-6">
            <h2 className="text-xl font-bold text-yellow-100">Важно за безопасността</h2>
            <p className="mt-3 leading-7">
              Информацията е образователна и не замества лекарска консултация.
              Билките могат да имат противопоказания и взаимодействия с лекарства.
            </p>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <RelatedPanel title="Свързани симптоми">
              {relatedSymptoms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {relatedSymptoms.map((symptom) => (
                    <Link
                      key={symptom.id}
                      href="/symptoms"
                      className="rounded-full border border-emerald-500/50 bg-emerald-950/70 px-3 py-2 text-sm font-semibold text-emerald-100 hover:border-yellow-300 hover:text-yellow-200"
                    >
                      {symptom.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-emerald-100">Все още няма свързани симптоми.</p>
              )}
            </RelatedPanel>

            <RelatedPanel title="Свързани категории">
              {relatedCategories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {relatedCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="rounded-full border border-emerald-500/50 bg-emerald-950/70 px-3 py-2 text-sm font-semibold text-emerald-100 hover:border-yellow-300 hover:text-yellow-200"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-emerald-100">Все още няма свързани категории.</p>
              )}
            </RelatedPanel>
          </section>

          <div className="grid gap-5 text-green-50 md:grid-cols-2">
            <Section title="Описание" text={herb.description} />
            <Section title="Традиционна употреба" text={herb.traditional_uses} />
            <Section title="Начин на приготвяне" text={herb.preparation} />
            <Section title="Предпазни мерки" text={herb.precautions} />
            <Section
              title="Взаимодействия с лекарства"
              text={herb.interactions}
            />
            <Section
              title="Кога да се потърси лекар"
              text={herb.when_to_see_doctor}
            />
          </div>

          <section className="rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
            <h2 className="text-2xl font-bold text-yellow-200">
              Рецепти и начини на приготвяне
            </h2>
            <p className="mt-3 leading-7 text-emerald-100">
              Тези описания са образователни и не са лечение. Винаги обръщайте внимание
              на бележките за безопасност.
            </p>

            {recipes.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-emerald-700 bg-emerald-950/60 p-4 text-emerald-100">
                Все още няма добавени рецепти за тази билка.
              </p>
            ) : (
              <div className="mt-5 grid gap-5">
                {recipes.map((recipe) => (
                  <article
                    key={recipe.id}
                    className="rounded-3xl border border-emerald-800 bg-emerald-950/60 p-5 shadow-xl ring-1 ring-white/10"
                  >
                    <h3 className="text-xl font-bold text-yellow-200">
                      {recipe.title ?? "Рецепта без заглавие"}
                    </h3>
                    {recipe.preparation_type ? (
                      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                        {recipe.preparation_type}
                      </p>
                    ) : null}
                    <RecipeField title="Съставки" text={recipe.ingredients} />
                    <RecipeField title="Инструкции" text={recipe.instructions} />
                    <RecipeField title="Бележка за употреба" text={recipe.dosage_note} />
                    <div className="mt-4 rounded-2xl border border-yellow-300/40 bg-yellow-300/10 p-4 text-yellow-50">
                      <h4 className="font-bold text-yellow-100">Бележка за безопасност</h4>
                      <p className="mt-2 leading-7">
                        {recipe.safety_note ??
                          "Няма добавена отделна бележка за безопасност. Използвайте информацията внимателно и се консултирайте със специалист при съмнения."}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {similarHerbs.length > 0 ? (
            <section className="rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
              <h2 className="text-2xl font-bold text-yellow-200">Подобни билки</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {similarHerbs.map((similarHerb) => (
                  <Link
                    key={similarHerb.id}
                    href={`/herbs/${similarHerb.slug}`}
                    className="rounded-2xl border border-emerald-800 bg-emerald-950/60 p-4 text-green-50 transition hover:border-yellow-300/70 hover:bg-emerald-900/70"
                  >
                    <h3 className="text-lg font-bold text-yellow-200">{similarHerb.name}</h3>
                    {similarHerb.short_description ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-emerald-100">
                        {similarHerb.short_description}
                      </p>
                    ) : null}
                    <span className="mt-3 inline-flex text-sm font-semibold text-yellow-300">
                      Виж билката →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </section>
    </main>
  );
}

function RecipeField({ title, text }: { title: string; text: string | null }) {
  return (
    <section className="mt-4">
      <h4 className="font-bold text-emerald-200">{title}</h4>
      <p className="mt-2 whitespace-pre-line leading-7 text-green-50">
        {text ?? "Няма добавена информация."}
      </p>
    </section>
  );
}

function RelatedPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
      <h2 className="text-xl font-bold text-yellow-200">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Section({ title, text }: { title: string; text: string | null }) {
  return (
    <section className="rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
      <h2 className="text-xl font-bold text-yellow-200 sm:text-2xl">{title}</h2>
      <p className="mt-3 leading-8 text-green-50">
        {text ?? "Няма добавена информация за тази секция."}
      </p>
    </section>
  );
}
