import Link from "next/link";
import { notFound } from "next/navigation";
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
  short_description: string | null;
  description: string | null;
  traditional_uses: string | null;
  preparation: string | null;
  precautions: string | null;
  interactions: string | null;
  when_to_see_doctor: string | null;
};

async function getHerb(slug: string): Promise<HerbDetail | null> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { data, error } = await supabase
    .from("herbs")
    .select(
      "id, slug, name, latin, emoji, short_description, description, traditional_uses, preparation, precautions, interactions, when_to_see_doctor",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-4xl">
        <Header />

        <Link href="/herbs" className="mt-8 inline-flex text-sm font-semibold text-yellow-300">
          ← Назад към билките
        </Link>

        <article className="mt-8 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-8">
          <div className="text-5xl sm:text-6xl" aria-hidden="true">
            {herb.emoji ?? "🌿"}
          </div>

          <h1 className="mt-6 text-3xl font-bold text-yellow-200 sm:text-4xl">
            {herb.name}
          </h1>

          {herb.latin ? (
            <p className="mt-2 text-lg italic text-green-100">{herb.latin}</p>
          ) : null}

          <FavoriteHerbButton herbId={herb.id} />

          {herb.short_description ? (
            <p className="mt-5 rounded-2xl bg-green-950/50 p-4 leading-7 text-green-50 ring-1 ring-white/10 sm:p-5">
              {herb.short_description}
            </p>
          ) : null}

          <div className="mt-8 space-y-8 text-green-50">
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

          <div className="mt-10 rounded-2xl bg-yellow-100 p-5 text-yellow-950">
            <h2 className="font-bold">Важно предупреждение</h2>
            <p className="mt-2 leading-7">
              Информацията е образователна и не замества консултация с лекар,
              фармацевт или друг медицински специалист. Билките могат да имат
              противопоказания и взаимодействия с лекарства.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}

function Section({ title, text }: { title: string; text: string | null }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-yellow-200 sm:text-2xl">{title}</h2>
      <p className="mt-3 leading-8 text-green-50">
        {text ?? "Няма добавена информация за тази секция."}
      </p>
    </section>
  );
}
