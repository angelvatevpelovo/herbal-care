import Link from "next/link";
import Header from "@/app/components/Header";

const quickLinks = [
  { href: "/", label: "Начало" },
  { href: "/herbs", label: "Билки" },
  { href: "/symptoms", label: "Симптоми" },
  { href: "/search", label: "Търсене" },
  { href: "/ai", label: "AI помощник" },
  { href: "/about", label: "За Herbal Care" },
  { href: "/contact", label: "Контакт" },
];

const emergencyExamples = [
  "задух",
  "силна болка в гърдите",
  "припадък",
  "силна алергична реакция",
  "силна или внезапна болка",
  "симптоми, които се влошават",
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-5xl">
        <Header />

        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Условия
          </p>
          <h1 className="mt-3 text-3xl font-bold text-yellow-200 sm:text-5xl">
            Условия за ползване
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Herbal Care предоставя образователна информация за билки, симптоми,
            традиционна употреба и предпазни мерки. Сайтът не поставя диагнози, не
            назначава лечение, не предписва продукти и не заменя лекар.
          </p>
        </header>

        <nav className="mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" aria-label="Бърза навигация">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="min-h-11 rounded-full border border-emerald-700 bg-emerald-900/60 px-3 py-2 text-center text-sm font-semibold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <section className="mt-8 rounded-3xl border border-red-300/40 bg-red-950/40 p-5 text-red-50 shadow-xl shadow-black/20 sm:p-6">
          <h2 className="text-xl font-bold text-red-100">Силен медицински отказ от отговорност</h2>
          <p className="mt-3 leading-7">
            Herbal Care не диагностицира, не лекува, не предписва и не замества лекар,
            фармацевт или друг медицински специалист. Потребителят носи отговорност да потърси
            професионален медицински съвет при здравословни въпроси.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <TermsSection title="Само образователна информация">
            Съдържанието в Herbal Care е предназначено за обща ориентация. То не е
            индивидуален медицински съвет и не трябва да се използва като основание за
            започване, спиране или промяна на лечение.
          </TermsSection>

          <TermsSection title="Отговорно използване">
            Използвайте информацията внимателно и като подготовка за разговор със
            специалист. При симптоми, заболявания, прием на лекарства, бременност,
            кърмене, алергии или хронични състояния потърсете лекар или фармацевт
            преди употреба на билки или добавки.
          </TermsSection>

          <TermsSection title="AI помощник">
            Отговорите от AI помощника са само информационни. Те може да са непълни,
            неточни или неподходящи за конкретна ситуация и не представляват диагноза,
            лечение, предписание или професионална медицинска препоръка. Проверявайте
            важната информация със специалист.
          </TermsSection>

          <TermsSection title="Рискове при билки">
            Билките може да имат противопоказания, да предизвикат алергии или да
            взаимодействат с лекарства. Естествен произход не означава автоматично
            безопасност за всеки човек, а ефектите може да се различават според
            здравословното състояние, възрастта и приема на медикаменти.
          </TermsSection>
        </section>

        <section className="mt-8 rounded-3xl border border-yellow-300/40 bg-yellow-300/10 p-5 text-yellow-50 sm:p-6">
          <h2 className="text-2xl font-bold text-yellow-100">Спешни симптоми</h2>
          <p className="mt-3 leading-7">
            При опасни, силни, внезапни или продължителни симптоми потърсете незабавно медицинска
            помощ. Примери:
          </p>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {emergencyExamples.map((example) => (
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

function TermsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
      <h2 className="text-xl font-bold text-yellow-200">{title}</h2>
      <p className="mt-3 leading-7 text-emerald-50">{children}</p>
    </article>
  );
}
