import Header from "@/app/components/Header";
import AuthForm from "./AuthForm";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-green-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-4xl">
        <Header />

        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Профил
          </p>
          <h1 className="mt-3 text-3xl font-bold text-yellow-200 sm:text-5xl">
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
