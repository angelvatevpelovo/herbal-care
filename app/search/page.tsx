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
  description: string | null;
  traditional_uses: string | null;
  preparation: string | null;
  precautions: string | null;
  interactions: string | null;
  when_to_see_doctor: string | null;
};

type SymptomResult = {
  slug: string;
  name: string;
  description: string | null;
};

type CategoryResult = {
  slug: string;
  name: string;
  description: string | null;
};

type RecipeHerb = {
  name: string;
  slug: string;
};

type RecipeResult = {
  id: string;
  title: string | null;
  preparation_type: string | null;
  ingredients: string | null;
  instructions: string | null;
  dosage_note: string | null;
  safety_note: string | null;
  herbs: RecipeHerb | RecipeHerb[] | null;
};

async function searchData(query: string) {
  if (!query.trim()) {
    return {
      herbs: [] as HerbResult[],
      symptoms: [] as SymptomResult[],
      categories: [] as CategoryResult[],
      recipes: [] as RecipeResult[],
    };
  }

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const escapedQuery = query.replaceAll("%", "\\%").replaceAll("_", "\\_");
  const pattern = `%${escapedQuery}%`;

  const [
    { data: herbs, error: herbsError },
    { data: symptoms, error: symptomsError },
    { data: categories, error: categoriesError },
    { data: recipes, error: recipesError },
  ] =
    await Promise.all([
      supabase
        .from("herbs")
        .select(
          "slug, name, latin, emoji, short_description, description, traditional_uses, preparation, precautions, interactions, when_to_see_doctor",
        )
        .or(
          `name.ilike.${pattern},slug.ilike.${pattern},short_description.ilike.${pattern},description.ilike.${pattern},traditional_uses.ilike.${pattern},preparation.ilike.${pattern},precautions.ilike.${pattern},interactions.ilike.${pattern},when_to_see_doctor.ilike.${pattern}`,
        )
        .order("name", { ascending: true }),
      supabase
        .from("symptoms")
        .select("slug, name, description")
        .or(`name.ilike.${pattern},slug.ilike.${pattern},description.ilike.${pattern}`)
        .order("name", { ascending: true }),
      supabase
        .from("categories")
        .select("slug, name, description")
        .or(`name.ilike.${pattern},slug.ilike.${pattern},description.ilike.${pattern}`)
        .order("name", { ascending: true }),
      supabase
        .from("herb_recipes")
        .select("id, title, preparation_type, ingredients, instructions, dosage_note, safety_note, herbs(name, slug)")
        .or(
          `title.ilike.${pattern},preparation_type.ilike.${pattern},ingredients.ilike.${pattern},instructions.ilike.${pattern},dosage_note.ilike.${pattern},safety_note.ilike.${pattern}`,
        )
        .order("created_at", { ascending: false }),
    ]);

  if (herbsError) {
    throw new Error(herbsError.message);
  }

  if (symptomsError) {
    throw new Error(symptomsError.message);
  }

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  if (recipesError) {
    throw new Error(recipesError.message);
  }

  return {
    herbs: (herbs ?? []) as HerbResult[],
    symptoms: (symptoms ?? []) as SymptomResult[],
    categories: (categories ?? []) as CategoryResult[],
    recipes: (recipes ?? []) as RecipeResult[],
  };
}

function getRecipeHerb(recipe: RecipeResult) {
  if (Array.isArray(recipe.herbs)) {
    return recipe.herbs[0] ?? null;
  }

  return recipe.herbs;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const { herbs, symptoms, categories, recipes } = await searchData(query);
  const hasSearched = query.length > 0;
  const hasResults =
    herbs.length > 0 || symptoms.length > 0 || categories.length > 0 || recipes.length > 0;

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
            Потърсете билка, симптом, категория или начин на приготвяне. Резултатите
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
          Информацията е образователна и не замества лекарска консултация.
        </div>

        {hasSearched ? (
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-yellow-200">
              Резултати за „{query}“
            </h2>

            {hasResults ? (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <ResultCounter label="Билки" count={herbs.length} />
                  <ResultCounter label="Симптоми" count={symptoms.length} />
                  <ResultCounter label="Категории" count={categories.length} />
                  <ResultCounter label="Рецепти" count={recipes.length} />
                </div>

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

                <ResultGroup title="Категории">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/categories/${category.slug}`}
                        className="block rounded-2xl border border-emerald-800/70 bg-emerald-950/70 p-5 shadow-xl shadow-black/20 transition hover:border-yellow-300"
                      >
                        <h3 className="text-xl font-bold text-emerald-50">{category.name}</h3>
                        <p className="mt-3 leading-7 text-emerald-100">
                          {category.description ?? "Няма добавено описание."}
                        </p>
                        <p className="mt-4 text-sm font-semibold text-yellow-200">
                          Виж категорията
                        </p>
                      </Link>
                    ))
                  ) : (
                    <EmptyState text="Няма намерени категории." />
                  )}
                </ResultGroup>

                <ResultGroup title="Рецепти">
                  {recipes.length > 0 ? (
                    recipes.map((recipe) => {
                      const herb = getRecipeHerb(recipe);

                      return (
                        <Link
                          key={recipe.id}
                          href="/recipes"
                          className="block rounded-2xl border border-emerald-800/70 bg-emerald-950/70 p-5 shadow-xl shadow-black/20 transition hover:border-yellow-300"
                        >
                          <h3 className="text-xl font-bold text-emerald-50">
                            {recipe.title ?? "Рецепта без заглавие"}
                          </h3>
                          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                            {recipe.preparation_type ?? "Начин на приготвяне"}
                          </p>
                          {herb ? (
                            <p className="mt-3 text-emerald-100">Билка: {herb.name}</p>
                          ) : null}
                          <p className="mt-4 text-sm font-semibold text-yellow-200">
                            Виж рецепти
                          </p>
                        </Link>
                      );
                    })
                  ) : (
                    <EmptyState text="Няма намерени рецепти." />
                  )}
                </ResultGroup>
              </div>
              </>
            ) : (
              <div className="mt-5 rounded-2xl border border-emerald-800 bg-emerald-950/70 p-5 text-emerald-100">
                Няма намерени резултати. Опитайте с име на билка, симптом или начин на приготвяне.
              </div>
            )}
          </section>
        ) : null}
      </section>
    </main>
  );
}

function ResultCounter({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-2xl border border-emerald-800 bg-emerald-950/70 p-4 text-emerald-100">
      <span className="font-bold text-yellow-200">{label}:</span> {count}
    </div>
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
