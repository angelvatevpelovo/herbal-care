import Link from "next/link";
import AuthForm from "./AuthForm";

const navLinks = [
  { href: "/", label: "Начало" },
  { href: "/herbs", label: "Билки" },
  { href: "/symptoms", label: "Симптоми" },
  { href: "/search", label: "Търсене" },
  { href: "/ai", label: "AI помощник" },
  { href: "/about", label: "За Herbal Care" },
];

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-6 py-8 text-white">
      <section className="mx-auto max-w-4xl">
        <nav className="flex flex-wrap gap-3" aria-label="Основна навигация">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-emerald-700 bg-emerald-950/50 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Профил
          </p>
          <h1 className="mt-3 text-4xl font-bold text-yellow-200 sm:text-5xl">
            Вход и регистрация
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Създайте профил или влезте със Supabase Auth. На този етап профилът е
            основа за бъдещи функции, като запазени билки и лични бележки.
          </p>
        </header>

        <AuthForm />
      </section>
    </main>
  );
}
