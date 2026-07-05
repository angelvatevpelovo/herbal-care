import Link from "next/link";
import Header from "@/app/components/Header";

const contentApproachItems = [
  "използваме внимателен образователен език",
  "избягваме обещания за лечение",
  "включваме предупреждения и предпазни мерки",
  "насърчаваме консултация с лекар при сериозни симптоми",
];

export default function SourcesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-6xl">
        <Header />

        <header className="mt-10 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Прозрачност
          </p>
          <h1 className="mt-3 text-3xl font-bold text-yellow-200 sm:text-5xl">
            Източници и отговорност за съдържанието
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Herbal Care предоставя образователна информация за билки, традиционна
            употреба, предпазни мерки и начини на приготвяне. Съдържанието не
            представлява индивидуален медицински съвет.
          </p>
        </header>

        <div className="mt-8 rounded-3xl border border-yellow-300/40 bg-yellow-300/10 p-5 shadow-xl shadow-black/20 sm:p-6">
          <h2 className="text-2xl font-bold text-yellow-100">Важно</h2>
          <p className="mt-3 leading-7 text-yellow-50">
            Herbal Care не замества лекар, фармацевт или друг квалифициран
            медицински специалист.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <InfoSection title="Как подхождаме към съдържанието">
            <ul className="space-y-3 text-emerald-100">
              {contentApproachItems.map((item) => (
                <li key={item} className="flex gap-3 leading-7">
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-yellow-300"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </InfoSection>

          <InfoSection title="Традиционна употреба">
            <p className="leading-7 text-emerald-100">
              Традиционната употреба не е гаранция за ефект. Различните хора могат
              да реагират различно, а билките могат да имат противопоказания,
              нежелани реакции и взаимодействия с лекарства.
            </p>
          </InfoSection>

          <InfoSection title="AI помощник">
            <p className="leading-7 text-emerald-100">
              AI помощникът използва съдържанието на Herbal Care като образователна
              насока. Отговорите може да са непълни или неточни. AI не поставя
              диагноза и не назначава лечение.
            </p>
          </InfoSection>

          <InfoSection title="Отговорност на потребителя">
            <p className="leading-7 text-emerald-100">
              Не спирайте предписани лекарства без лекар. Не използвайте сайта при
              спешни състояния. При съмнение, силни симптоми или влошаване
              потърсете медицински специалист.
            </p>
          </InfoSection>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <SourceLink href="/safety">Безопасност</SourceLink>
          <SourceLink href="/terms">Условия за ползване</SourceLink>
          <SourceLink href="/contact">Свържете се с нас</SourceLink>
        </div>
      </section>
    </main>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-emerald-800/70 bg-emerald-950/70 p-5 shadow-xl shadow-black/20 sm:p-6">
      <h2 className="text-2xl font-bold text-yellow-200">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="min-h-12 rounded-2xl bg-yellow-300 px-6 py-3 text-center font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:ring-offset-2 focus:ring-offset-green-950"
    >
      {children}
    </Link>
  );
}
