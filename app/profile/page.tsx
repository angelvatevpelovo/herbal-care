import Header from "@/app/components/Header";
import ProfileClient from "./ProfileClient";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-6 py-8 text-white">
      <section className="mx-auto max-w-4xl">
        <Header />

        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Профил
          </p>
          <h1 className="mt-3 text-4xl font-bold text-yellow-200 sm:text-5xl">
            Моят профил
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Управлявайте достъпа си до Herbal Care и бъдещите лични функции.
          </p>
        </header>

        <ProfileClient />
      </section>
    </main>
  );
}
