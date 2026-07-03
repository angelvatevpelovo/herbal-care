import Link from "next/link";
import Header from "./components/Header";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 text-green-950">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <Header />

        <section className="flex flex-1 items-center py-16">
          <div className="max-w-3xl">
            <p className="mb-4 inline-block rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              🌿 Природна грижа, билки и полезна информация
            </p>

            <h2 className="text-5xl font-bold leading-tight text-green-950">
              Твоят внимателен справочник за билки, симптоми и природна грижа.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-green-800">
              Herbal Care помага да откриваш информация за билки, традиционна
              употреба, симптоми, предпазни мерки и въпроси, които да обсъдиш със
              специалист.
            </p>

            <p className="mt-5 max-w-2xl rounded-2xl bg-yellow-50 p-4 text-sm font-semibold leading-6 text-yellow-900 ring-1 ring-yellow-200">
              Herbal Care предоставя образователна информация и не замества лекарска
              консултация.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/herbs"
                className="rounded-2xl bg-green-700 px-6 py-4 font-bold text-white shadow-lg transition hover:bg-green-800"
              >
                Разгледай билките
              </Link>

              <Link
                href="/symptoms"
                className="rounded-2xl border border-green-300 bg-white/70 px-6 py-4 font-bold text-green-800 transition hover:bg-green-100"
              >
                Търси по симптом
              </Link>

              <Link
                href="/search"
                className="rounded-2xl border border-green-300 bg-green-100 px-6 py-4 font-bold text-green-900 transition hover:bg-green-200"
              >
                Търси в Herbal Care
              </Link>

              <Link
                href="/ai"
                className="rounded-2xl border border-emerald-700 bg-emerald-950 px-6 py-4 font-bold text-emerald-50 shadow-lg transition hover:bg-emerald-900"
              >
                Попитай AI помощника
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-5 pb-10 md:grid-cols-3">
          <div className="rounded-3xl bg-white/80 p-6 shadow-sm">
            <div className="text-3xl" aria-hidden="true">
              🌱
            </div>
            <h3 className="mt-4 text-xl font-bold text-green-900">
              Библиотека с билки
            </h3>
            <p className="mt-2 text-green-700">
              Информация за билки, традиционна употреба, взаимодействия и предпазни
              мерки.
            </p>
          </div>

          <div className="rounded-3xl bg-white/80 p-6 shadow-sm">
            <div className="text-3xl" aria-hidden="true">
              🩺
            </div>
            <h3 className="mt-4 text-xl font-bold text-green-900">
              Симптоми и насоки
            </h3>
            <p className="mt-2 text-green-700">
              Търсене по симптоми и връзка към билки, които може да се свързват с
              традиционна употреба.
            </p>
          </div>

          <div className="rounded-3xl bg-white/80 p-6 shadow-sm">
            <div className="text-3xl" aria-hidden="true">
              🤖
            </div>
            <h3 className="mt-4 text-xl font-bold text-green-900">
              AI помощник
            </h3>
            <p className="mt-2 text-green-700">
              Статичен първи вариант на помощник, който ще обяснява внимателно и на
              разбираем език.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
