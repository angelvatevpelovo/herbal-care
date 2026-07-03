import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Начало" },
  { href: "/herbs", label: "Билки" },
  { href: "/symptoms", label: "Симптоми" },
  { href: "/search", label: "Търсене" },
  { href: "/ai", label: "AI помощник" },
  { href: "/about", label: "За Herbal Care" },
  { href: "/contact", label: "Контакт" },
  { href: "/privacy", label: "Политика за поверителност" },
  { href: "/terms", label: "Условия за ползване" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-emerald-900 bg-green-950 px-4 py-8 text-emerald-50 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <section>
          <h2 className="text-xl font-bold text-yellow-200">Herbal Care</h2>
          <p className="mt-3 max-w-2xl leading-7 text-emerald-100">
            Образователна информация за билки, симптоми и природна грижа.
          </p>
          <p className="mt-4 max-w-3xl rounded-2xl border border-yellow-300/40 bg-yellow-300/10 p-4 text-sm font-semibold leading-6 text-yellow-50">
            Herbal Care не поставя диагнози, не назначава лечение и не замества
            лекарска консултация.
          </p>
        </section>

        <nav className="grid grid-cols-2 content-start gap-2 sm:flex sm:flex-wrap md:justify-end" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="min-h-11 rounded-full border border-emerald-800 bg-emerald-950/70 px-3 py-2 text-center text-sm font-semibold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-green-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
