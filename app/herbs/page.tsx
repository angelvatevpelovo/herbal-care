import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/app/components/Header";
import HerbsFilter from "./HerbsFilter";

export const dynamic = "force-dynamic";

export type HerbListItem = {
  id: string;
  slug: string;
  name: string;
  latin: string | null;
  emoji: string | null;
  image_url?: string | null;
  short_description: string | null;
  created_at: string | null;
};

export type HerbCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

export type HerbCategoryConnection = {
  herb_id: string;
  category_id: string;
};

async function getHerbsLibrary() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const [
    { data: herbs, error: herbsError },
    { data: categories, error: categoriesError },
    { data: connections, error: connectionsError },
  ] = await Promise.all([
    supabase
      .from("herbs")
      .select("id, slug, name, latin, emoji, image_url, short_description, created_at")
      .order("name", { ascending: true }),
    supabase
      .from("categories")
      .select("id, slug, name, description")
      .order("name", { ascending: true }),
    supabase
      .from("herb_categories")
      .select("herb_id, category_id"),
  ]);

  if (herbsError) {
    throw new Error(herbsError.message);
  }

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  if (connectionsError) {
    throw new Error(connectionsError.message);
  }

  return {
    herbs: (herbs ?? []) as HerbListItem[],
    categories: (categories ?? []) as HerbCategory[],
    connections: (connections ?? []) as HerbCategoryConnection[],
  };
}

export default async function HerbsPage() {
  const { herbs, categories, connections } = await getHerbsLibrary();

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-6xl">
        <Header />

        <header className="mb-8 mt-10">
          <Link href="/" className="text-sm font-semibold text-yellow-300">
            ← Начало
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-yellow-200 sm:text-4xl">Билки</h1>

          <p className="mt-3 max-w-2xl leading-7 text-green-100">
            Тук ще откриеш образователна информация за билки, тяхната традиционна употреба и важни
            предпазни мерки. Информацията не е лечение и не замества медицинска консултация.
          </p>
        </header>

        <HerbsFilter herbs={herbs} categories={categories} connections={connections} />

        <div className="mt-10 rounded-3xl bg-yellow-100 p-5 text-yellow-950 ring-1 ring-yellow-200 sm:p-6">
          <h3 className="font-bold">Важно предупреждение</h3>
          <p className="mt-2 leading-7">
            Информацията в Herbal Care е образователна и не замества лекарска консултация. При
            сериозни симптоми, бременност, хронични заболявания или прием на лекарства трябва да се
            консултираш с лекар или фармацевт.
          </p>
        </div>
      </section>
    </main>
  );
}
