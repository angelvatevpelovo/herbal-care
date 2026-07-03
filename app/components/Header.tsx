import Link from "next/link";

const navLinks = [
  { href: "/", label: "Начало" },
  { href: "/herbs", label: "Билки" },
  { href: "/symptoms", label: "Симптоми" },
  { href: "/search", label: "Търсене" },
  { href: "/ai", label: "AI помощник" },
  { href: "/favorites", label: "Любими" },
  { href: "/profile", label: "Профил" },
  { href: "/about", label: "За Herbal Care" },
  { href: "/auth", label: "Вход / Регистрация" },
];

export default function Header() {
  return (
    <header className="rounded-3xl border border-emerald-800/70 bg-emerald-950/80 p-4 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="min-w-fit">
          <span className="block text-xl font-bold text-yellow-200">Herbal Care</span>
          <span className="block text-sm text-emerald-200">Образователна билкова грижа</span>
        </Link>

        <nav className="flex flex-wrap gap-2" aria-label="Основна навигация">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-emerald-700 bg-emerald-900/60 px-3 py-2 text-sm font-semibold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-emerald-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
