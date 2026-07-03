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

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-5xl">
        <Header />

        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Поверителност
          </p>
          <h1 className="mt-3 text-3xl font-bold text-yellow-200 sm:text-5xl">
            Политика за поверителност
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Тази страница обяснява какви данни може да се използват в Herbal Care, за да работят
            основните функции на приложението.
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
          <h2 className="text-xl font-bold text-red-100">Медицински отказ от отговорност</h2>
          <p className="mt-3 leading-7">
            Herbal Care не поставя диагнози, не назначава лечение, не предписва продукти и не
            замества лекар, фармацевт или друг медицински специалист.
          </p>
        </section>

        <section className="mt-8 grid gap-5">
          <PolicySection title="Какви данни може да използва приложението">
            Herbal Care може да използва Supabase Auth за регистрация и вход. При използване на
            профил може да се обработва имейл адрес, както и техническа информация, необходима за
            вход и поддържане на сесията.
          </PolicySection>

          <PolicySection title="Любими билки">
            Ако използвате функцията за любими билки, приложението може да запази връзка между
            Вашия профил и избраните билки, за да ги виждате по-късно.
          </PolicySection>

          <PolicySection title="Обратна връзка">
            Ако изпратите съобщение чрез формата за контакт, може да бъдат запазени въведените от
            Вас име, имейл и съобщение. Тези данни се използват за идеи, корекции, въпроси и
            подобряване на приложението.
          </PolicySection>

          <PolicySection title="Медицинска и чувствителна информация">
            Herbal Care не цели събиране на чувствителни медицински досиета. Не изпращайте спешни,
            силно чувствителни или подробни медицински данни чрез формите в приложението. При
            спешност потърсете лекар или спешна помощ.
          </PolicySection>

          <PolicySection title="За какво се използват данните">
            Данните се използват само за предоставяне на функционалността на приложението, като
            вход, любими билки, обратна връзка и поддръжка на по-добро потребителско преживяване.
          </PolicySection>

          <PolicySection title="Контакт">
            Ако имате въпроси за поверителността или искате да изпратите корекция, можете да се
            свържете с нас чрез страницата <Link href="/contact" className="font-bold text-yellow-200 hover:text-yellow-100">Контакт</Link>.
          </PolicySection>
        </section>
      </section>
    </main>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
      <h2 className="text-xl font-bold text-yellow-200">{title}</h2>
      <p className="mt-3 leading-7 text-emerald-50">{children}</p>
    </article>
  );
}
