"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfileClient() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      if (!supabase) {
        if (isMounted) {
          setMessage("Supabase не е конфигуриран.");
          setIsLoading(false);
        }
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      setEmail(user?.email ?? null);
      setIsLoading(false);
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogout() {
    if (!supabase) {
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage("Не успяхме да ви изведем. Моля, опитайте отново.");
      setIsLoading(false);
      return;
    }

    router.push("/auth");
  }

  if (isLoading) {
    return (
      <div className="mt-8 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
        Зареждаме профила...
      </div>
    );
  }

  if (!email) {
    return (
      <div className="mt-8 rounded-3xl bg-white/10 p-5 ring-1 ring-white/10 sm:p-6">
        <p className="text-emerald-100">
          Не сте влезли в профила си. Влезте или се регистрирайте, за да използвате лични функции.
        </p>
        <Link
          href="/auth"
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-yellow-300 px-5 py-3 text-center font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 sm:w-auto"
        >
          Вход / Регистрация
        </Link>
        {message ? <p className="mt-4 text-sm text-red-100">{message}</p> : null}
      </div>
    );
  }

  return (
    <section className="mt-8 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
        Влезли сте като
      </p>
      <h2 className="mt-3 break-words text-2xl font-bold text-yellow-200">{email}</h2>
      <p className="mt-4 leading-7 text-emerald-100">
        Този профил ще се използва за лични функции като любими билки и бъдещи бележки.
      </p>
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="mt-6 min-h-12 w-full rounded-2xl bg-yellow-300 px-5 py-3 font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 sm:w-auto"
      >
        Изход
      </button>
      {message ? <p className="mt-4 text-sm text-red-100">{message}</p> : null}
    </section>
  );
}
