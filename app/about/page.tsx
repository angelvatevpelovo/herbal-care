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

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-6 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <Header />

        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Образователен проект
          </p>
          <h1 className="mt-3 text-4xl font-bold text-yellow-200 sm:text-5xl">
            За Herbal Care
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Herbal Care е образователен проект за билки, симптоми, природна грижа и
            внимателна AI помощ. Целта е да представя информация на разбираем език,
            да насочва към предпазни мерки и да помага на хората да подготвят
            по-добри въпроси за лекар, фармацевт или друг медицински специалист.
          </p>
        </header>

        <section className="mt-8 rounded-3xl border border-red-300/40 bg-red-950/40 p-6 text-red-50 shadow-xl shadow-black/20">
          <h2 className="text-xl font-bold text-red-100">Медицински отказ от отговорност</h2>
          <p className="mt-3 leading-7">
            Herbal Care не поставя диагнози, не назначава лечение и не замества лекар,
            фармацевт или друг медицински специалист.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-3xl bg-white/10 p-6 shadow-xl ring-1 ring-white/10">
            <h2 className="text-xl font-bold text-yellow-200">Билки</h2>
            <p className="mt-3 leading-7 text-emerald-50">
              Информация за традиционна употреба, предпазни мерки и възможни
              взаимодействия.
            </p>
          </article>

          <article className="rounded-3xl bg-white/10 p-6 shadow-xl ring-1 ring-white/10">
            <h2 className="text-xl font-bold text-yellow-200">Симптоми</h2>
            <p className="mt-3 leading-7 text-emerald-50">
              Образователни връзки между симптоми и билки, които може да се свързват с
              традиционна употреба.
            </p>
          </article>

          <article className="rounded-3xl bg-white/10 p-6 shadow-xl ring-1 ring-white/10">
            <h2 className="text-xl font-bold text-yellow-200">AI помощ</h2>
            <p className="mt-3 leading-7 text-emerald-50">
              Внимателна помощ за обяснение на информация, без диагнози, предписания
              или обещания за лечение.
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-yellow-300/40 bg-yellow-300/10 p-6 text-yellow-50">
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
