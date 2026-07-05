import Link from "next/link";
import Header from "@/app/components/Header";

const doctorExamples = [
  "силна или внезапна болка",
  "задух",
  "болка в гърдите",
  "припадък",
  "силна алергична реакция",
  "висока температура при дете",
  "симптоми, които се влошават или не отминават",
];

const foundHereItems = [
  "информация за билки",
  "връзки между билки и симптоми",
  "категории по теми",
  "предпазни мерки",
  "AI помощник с образователна насоченост",
] as const;

const doesNotDoItems = [
  "не поставя диагнози",
  "не назначава лечение",
  "не заменя лекар",
  "не гарантира резултати",
] as const;

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-5xl">
        <Header />

        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Образователен проект
          </p>
          <h1 className="mt-3 text-3xl font-bold text-yellow-200 sm:text-5xl">
            За Herbal Care
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Herbal Care е образователен проект за билки, традиционна употреба, симптоми
            и безопасност. Целта е да представя информация на разбираем език, да
            насочва към предпазни мерки и да помага на хората да подготвят по-добри
            въпроси за лекар, фармацевт или друг медицински специалист.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
              href="/contact"
              className="min-h-12 rounded-2xl border border-yellow-300/70 bg-green-950 px-6 py-4 text-center font-bold text-yellow-100 shadow-lg transition hover:bg-green-900"
            >
              Свържи се с нас
            </Link>
          </div>
        </header>

        <section className="mt-8 rounded-3xl border border-red-300/40 bg-red-950/40 p-5 text-red-50 shadow-xl shadow-black/20 sm:p-6">
          <h2 className="text-xl font-bold text-red-100">Медицински отказ от отговорност</h2>
          <p className="mt-3 leading-7">
            Herbal Care не поставя диагнози, не назначава лечение и не замества лекар,
            фармацевт или друг медицински специалист.
          </p>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
            <h2 className="text-2xl font-bold text-yellow-200">Какво ще намерите тук</h2>
            <ul className="mt-5 grid gap-3">
              {foundHereItems.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-emerald-800 bg-emerald-950/50 px-4 py-3 text-emerald-50"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
            <h2 className="text-2xl font-bold text-yellow-200">Какво Herbal Care не прави</h2>
            <ul className="mt-5 grid gap-3">
              {doesNotDoItems.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-yellow-300/30 bg-yellow-300/10 px-4 py-3 text-yellow-50"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mt-8 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Внимателен подход
          </p>
          <h2 className="mt-2 text-2xl font-bold text-yellow-200">
            Безопасността е на първо място
          </h2>
          <div className="mt-4 grid gap-4 text-emerald-50 md:grid-cols-2">
            <p className="leading-7">
              Билките могат да имат взаимодействия с лекарства, противопоказания и
              различен ефект при различни хора. Дори традиционно използвани растения
              може да не са подходящи при определени състояния, алергии или прием на
              медикаменти.
            </p>
            <p className="leading-7">
              Herbal Care насърчава внимателно четене, проверка на предпазните мерки и
              консултация със специалист, особено при бременност, деца, хронични
              заболявания или тревожни симптоми.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-yellow-300/40 bg-yellow-300/10 p-5 text-yellow-50 sm:p-6">
          <h2 className="text-2xl font-bold text-yellow-100">
            Кога да потърсите лекар
          </h2>
          <p className="mt-3 leading-7">
            Потърсете медицинска помощ при опасни, силни, внезапни или продължителни
            симптоми. Примери:
          </p>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {doctorExamples.map((example) => (
              <li
                key={example}
                className="rounded-2xl border border-yellow-200/30 bg-green-950/40 px-4 py-3 text-yellow-50"
              >
                {example}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}
