import Link from "next/link";
import AuthNav from "./AuthNav";

const navLinks = [
  { href: "/", label: "Начало" },
  { href: "/herbs", label: "Билки" },
  { href: "/symptoms", label: "Симптоми" },
  { href: "/search", label: "Търсене" },
  { href: "/ai", label: "AI помощник" },
  { href: "/about", label: "За Herbal Care" },
  { href: "/contact", label: "Контакт" },
];

export default function Header() {
  return (
    <header className="rounded-2xl border border-emerald-800/70 bg-emerald-950/85 p-3 shadow-xl shadow-black/20 sm:rounded-3xl sm:p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <Link href="/" className="min-w-fit">
          <span className="block text-xl font-bold text-yellow-200">Herbal Care</span>
          <span className="block text-sm text-emerald-200">Образователна билкова грижа</span>
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
