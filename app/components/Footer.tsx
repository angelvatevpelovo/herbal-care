import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Начало" },
  { href: "/herbs", label: "Билки" },
  { href: "/categories", label: "Категории" },
  { href: "/symptoms", label: "Симптоми" },
  { href: "/search", label: "Търсене" },
  { href: "/ai", label: "AI помощник" },
  { href: "/ai-history", label: "AI история" },
  { href: "/safety", label: "Безопасност" },
  { href: "/admin", label: "Админ" },
  { href: "/about", label: "За Herbal Care" },
  { href: "/contact", label: "Контакт" },
  { href: "/privacy", label: "Политика за поверителност" },
  { href: "/terms", label: "Условия за ползване" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-emerald-900 bg-green-950 px-4 py-8 text-emerald-50 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-7 md:grid-cols-[1.15fr_0.85fr] md:items-start">
        <section>
          <div className="flex items-center gap-3">
            <span
              className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/60 bg-gradient-to-br from-emerald-700 to-green-950 shadow-lg shadow-black/20"
              aria-hidden="true"
            >
              <span className="absolute h-6 w-3.5 -rotate-45 rounded-full rounded-br-sm bg-emerald-200 shadow-sm" />
              <span className="absolute mt-2 h-4 w-0.5 rotate-45 rounded-full bg-yellow-200/80" />
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-wide text-yellow-200">Herbal Care</h2>
              <p className="mt-1 text-sm font-semibold text-emerald-200">
                Билкова грижа с внимание и безопасност
              </p>
            </div>
          </div>

          <p className="mt-4 max-w-2xl leading-7 text-emerald-100">
            Образователна информация за билки, симптоми и природна грижа.
          </p>
          <p className="mt-4 max-w-3xl rounded-2xl border border-yellow-300/40 bg-yellow-300/10 p-4 text-sm font-semibold leading-6 text-yellow-50">
            Информацията е образователна и не замества лекарска консултация.
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
