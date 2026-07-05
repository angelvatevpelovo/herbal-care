import Header from "@/app/components/Header";
import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-4xl">
        <Header />

        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Обратна връзка
          </p>
          <h1 className="mt-3 text-3xl font-bold text-yellow-200 sm:text-5xl">
            Свържете се с нас
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Можете да изпратите обратна връзка, предложение или сигнал за неточност в
            съдържанието. Съобщенията помагат Herbal Care да стане по-полезен, по-точен
            и по-внимателен към безопасността.
          </p>
        </header>

        <div className="mt-8 rounded-3xl border border-yellow-300/40 bg-yellow-300/10 p-5 text-yellow-50 shadow-xl shadow-black/20 sm:p-6">
          <h2 className="text-xl font-bold text-yellow-100">Важно</h2>
          <p className="mt-3 leading-7">
            Не използвайте тази форма за спешни медицински въпроси. При силни, внезапни
            или тревожни симптоми потърсете лекар или спешна помощ.
          </p>
        </div>

        <div className="mt-6 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Насока за съобщението
          </p>
          <p className="mt-3 leading-7 text-emerald-50">
            Ако съобщавате за неточност, посочете името на билката, симптома или
            страницата.
          </p>
        </div>

        <ContactForm />
      </section>
    </main>
  );
}
