import Link from "next/link";
import AuthNav from "./AuthNav";

const navLinks = [
  { href: "/", label: "Начало" },
  { href: "/herbs", label: "Билки" },
  { href: "/categories", label: "Категории" },
  { href: "/symptoms", label: "Симптоми" },
  { href: "/search", label: "Търсене" },
  { href: "/ai", label: "AI помощник" },
  { href: "/ai-history", label: "AI история" },
  { href: "/admin", label: "Админ" },
  { href: "/about", label: "За Herbal Care" },
  { href: "/contact", label: "Контакт" },
];

export default function Header() {
  return (
    <header className="rounded-2xl border border-emerald-800/70 bg-emerald-950/85 p-3 shadow-xl shadow-black/20 sm:rounded-3xl sm:p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <Link
          href="/"
          className="group flex min-w-fit items-center gap-3 rounded-2xl px-1 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-emerald-950"
        >
          <span
            className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/60 bg-gradient-to-br from-emerald-700 to-green-950 shadow-lg shadow-black/20 transition group-hover:border-yellow-300"
            aria-hidden="true"
          >
            <span className="absolute h-7 w-4 -rotate-45 rounded-full rounded-br-sm bg-emerald-200 shadow-sm" />
            <span className="absolute mt-2 h-5 w-0.5 rotate-45 rounded-full bg-yellow-200/80" />
          </span>
          <span className="leading-tight">
            <span className="block text-2xl font-black tracking-wide text-yellow-200">
              Herbal Care
            </span>
            <span className="mt-1 block text-sm font-semibold text-emerald-200">
              Билкова грижа с внимание
            </span>
          </span>
        </Link>

        <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" aria-label="Основна навигация">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="min-h-11 rounded-full border border-emerald-700 bg-emerald-900/60 px-3 py-2 text-center text-sm font-semibold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-emerald-950"
            >
              {link.label}
            </Link>
          ))}
          <AuthNav />
        </nav>
      </div>
    </header>
  );
}
