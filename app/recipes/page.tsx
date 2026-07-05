import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type RecipesPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

type Herb = {
  id: string;
  name: string;
  slug: string;
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

type RecipeWithHerb = HerbRecipe & {
  herb: Herb | null;
};

async function getRecipes() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const [{ data: recipes, error: recipesError }, { data: herbs, error: herbsError }] =
    await Promise.all([
      supabase
        .from("herb_recipes")
        .select("id, herb_id, title, preparation_type, ingredients, instructions, dosage_note, safety_note, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("herbs").select("id, name, slug"),
    ]);

  if (recipesError) {
    throw new Error(recipesError.message);
  }

  if (herbsError) {
    throw new Error(herbsError.message);
  }

  const herbsById = new Map((herbs ?? []).map((herb) => [herb.id, herb as Herb]));

  return ((recipes ?? []) as HerbRecipe[]).map((recipe) => ({
    ...recipe,
    herb: herbsById.get(recipe.herb_id) ?? null,
  }));
}

function normalizeText(text: string) {
  return text.toLocaleLowerCase("bg-BG").trim();
}

function filterRecipes(recipes: RecipeWithHerb[], query: string) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return recipes;
  }

  return recipes.filter((recipe) => {
    const searchableText = normalizeText(
      [
        recipe.title,
        recipe.herb?.name,
        recipe.preparation_type,
        recipe.ingredients,
        recipe.instructions,
      ]
        .filter(Boolean)
        .join(" "),
    );

    return searchableText.includes(normalizedQuery);
  });
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const recipes = await getRecipes();
  const filteredRecipes = filterRecipes(recipes, query);
  const hasRecipes = recipes.length > 0;
  const hasSearch = query.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-6xl">
        <Header />

        <header className="mt-10 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Образователна библиотека
          </p>
          <h1 className="mt-3 text-3xl font-bold text-yellow-200 sm:text-5xl">
            Рецепти и начини на приготвяне
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Тук ще намерите образователни рецепти и традиционни начини на
            приготвяне на билки. Информацията не замества лекарска консултация.
          </p>
        </header>

        <div className="mt-8 rounded-2xl border border-yellow-300/40 bg-yellow-300/10 p-5">
          <h2 className="text-xl font-bold text-yellow-100">Важно за безопасността</h2>
          <p className="mt-3 leading-7 text-yellow-50">
            Билките могат да имат противопоказания и взаимодействия с лекарства.
            При сериозни, внезапни или продължителни симптоми потърсете лекар.
          </p>
        </div>

        <form className="mt-8 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6" action="/recipes">
          <label htmlFor="q" className="block text-lg font-bold text-yellow-200">
            Търсене в рецептите
          </label>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Търси рецепта, билка или начин на приготвяне..."
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

        <section className="mt-8">
          {!hasRecipes ? (
            <EmptyState text="Все още няма добавени рецепти." />
          ) : filteredRecipes.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredRecipes.map((recipe) => (
                <article
                  key={recipe.id}
                  className="rounded-3xl border border-emerald-800/70 bg-emerald-950/70 p-5 shadow-xl shadow-black/20 sm:p-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-yellow-100">
                        {recipe.title ?? "Рецепта без заглавие"}
                      </h2>
                      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                        {recipe.herb?.name ?? "Билка без връзка"}
                      </p>
                    </div>
                    {recipe.herb ? (
                      <Link
                        href={`/herbs/${recipe.herb.slug}`}
                        className="min-h-11 rounded-full border border-yellow-300/70 px-4 py-2 text-center text-sm font-bold text-yellow-100 transition hover:bg-yellow-300 hover:text-green-950 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-emerald-950"
                      >
                        Виж билката
                      </Link>
                    ) : null}
                  </div>

                  <RecipeField label="Тип приготвяне" value={recipe.preparation_type} />
                  <RecipeField label="Съставки" value={recipe.ingredients} />
                  <RecipeField label="Инструкции" value={recipe.instructions} />
                  <RecipeField label="Бележка за употреба" value={recipe.dosage_note} />
                  <div className="mt-5 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-4">
                    <h3 className="font-bold text-yellow-100">Бележка за безопасност</h3>
                    <p className="mt-2 leading-7 text-yellow-50">
                      {recipe.safety_note ?? "Няма добавена бележка за безопасност."}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text={hasSearch ? "Няма рецепти за избраното търсене." : "Все още няма добавени рецепти."} />
          )}
        </section>
      </section>
    </main>
  );
}

function RecipeField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="mt-5">
      <h3 className="font-bold text-emerald-100">{label}</h3>
      <p className="mt-2 leading-7 text-emerald-50">{value ?? "Няма добавена информация."}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-emerald-800 bg-emerald-950/70 p-5 text-emerald-100">
      {text}
    </div>
  );
}
