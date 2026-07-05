import Link from "next/link";
import Header from "@/app/components/Header";

const cautionItems = [
  "бременност и кърмене",
  "деца",
  "хронични заболявания",
  "прием на лекарства",
  "алергии",
  "предстояща операция",
];

const doctorItems = [
  "силна болка в гърдите",
  "задух",
  "припадък",
  "силна алергична реакция",
  "висока температура",
  "кръвотечение",
  "симптоми, които се влошават или продължават",
];

const responsibleUseItems = [
  "четете предпазните мерки",
  "не комбинирайте много билки без консултация",
  "не спирайте предписани лекарства",
  "използвайте AI помощника само за образователна насока",
];

export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-6xl">
        <Header />

        <header className="mt-10 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Отговорна употреба
          </p>
          <h1 className="mt-3 text-3xl font-bold text-yellow-200 sm:text-5xl">
            Безопасност при използване на билки
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Билките могат да бъдат част от традиционната грижа, но не са
            безрискови. Herbal Care предоставя образователна информация и не
            замества лекарска консултация.
          </p>
        </header>

        <div className="mt-8 rounded-3xl border border-red-300/50 bg-red-950/50 p-5 shadow-xl shadow-black/20 sm:p-6">
          <h2 className="text-2xl font-bold text-red-100">Важно</h2>
          <p className="mt-3 leading-7 text-red-50">
            При спешни, силни или тревожни симптоми не разчитайте на сайт или AI
            помощник. Потърсете лекар или спешна помощ.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <InfoSection title="Билките могат да имат взаимодействия">
            <p className="leading-7 text-emerald-100">
              Някои билки може да взаимодействат с лекарства, хранителни добавки,
              алкохол или хронични състояния. Ефектът може да е различен при
              различни хора, затова информацията тук е само образователна насока.
            </p>
          </InfoSection>

          <InfoSection title="Кога да бъдете особено внимателни">
            <SafetyList items={cautionItems} />
          </InfoSection>

          <InfoSection title="Кога да потърсите лекар">
            <SafetyList items={doctorItems} />
          </InfoSection>

          <InfoSection title="Как да използвате Herbal Care отговорно">
            <SafetyList items={responsibleUseItems} />
          </InfoSection>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <SafetyLink href="/herbs">Разгледай билките</SafetyLink>
          <SafetyLink href="/ai">Попитай AI помощника</SafetyLink>
          <SafetyLink href="/contact">Свържи се с нас</SafetyLink>
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

function SafetyList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-emerald-100">
      {items.map((item) => (
        <li key={item} className="flex gap-3 leading-7">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-yellow-300" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SafetyLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="min-h-12 rounded-2xl bg-yellow-300 px-6 py-3 text-center font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:ring-offset-2 focus:ring-offset-green-950"
    >
      {children}
    </Link>
  );
}
