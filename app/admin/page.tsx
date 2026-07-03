import Header from "@/app/components/Header";
import AdminClient from "./AdminClient";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-6xl">
        <Header />

        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Управление
          </p>
          <h1 className="mt-3 text-3xl font-bold text-yellow-200 sm:text-5xl">
            Админ панел
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100">
            Защитена зона за бъдещо управление на съдържание в Herbal Care. Засега панелът е
            подготвителен и не променя данни.
          </p>
        </header>

        <AdminClient />
      </section>
    </main>
  );
}
