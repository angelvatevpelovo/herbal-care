import Link from "next/link";
import AIForm from "./AIForm";

const emergencyExamples = [
  "задух",
  "силна болка в гърдите",
  "припадък",
  "силна алергична реакция",
  "мисли за самонараняване",
  "висока температура при дете",
];

export default function AiPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-6 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <nav className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full border border-emerald-700 bg-emerald-950/50 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
          >
            Начало
          </Link>
          <Link
            href="/herbs"
            className="rounded-full border border-emerald-700 bg-emerald-950/50 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
          >
            Билки
          </Link>
          <Link
            href="/symptoms"
            className="rounded-full border border-emerald-700 bg-emerald-950/50 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
          >
            Симптоми
          </Link>
        </nav>

        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Образователен помощник
          </p>
          <h1 className="mt-3 text-4xl font-bold text-yellow-200 sm:text-5xl">
            AI помощник
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Помощникът може да обяснява билки, симптоми и природна грижа на
            разбираем език. Засега отговорите са статични и безопасни, без връзка с
            реален AI модел. Информацията е за ориентация и подготовка за
            консултация, не е лечение.
          </p>
        </header>

        <section className="mt-8 rounded-3xl border border-red-300/40 bg-red-950/40 p-6 text-red-50 shadow-xl shadow-black/20">
          <h2 className="text-xl font-bold text-red-100">Медицинска безопасност</h2>
          <p className="mt-3 leading-7">
            AI помощникът не поставя диагноза, не назначава лечение и не замества лекар.
            При силни, внезапни, опасни или продължителни симптоми потърсете медицинска
            помощ.
          </p>
          <div className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-red-100">
              Спешни примери
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {emergencyExamples.map((example) => (
                <span
                  key={example}
                  className="rounded-full border border-red-200/30 bg-red-900/50 px-3 py-2 text-sm font-semibold text-red-50"
                >
                  {example}
                </span>
              ))}
            </div>
          </div>
        </section>

        <AIForm />
      </section>
    </main>
  );
}
