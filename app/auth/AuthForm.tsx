"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  type: "success" | "error";
  text: string;
};

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignUp() {
    setMessage(null);

    if (!supabase) {
      setMessage({
        type: "error",
        text: "Supabase не е конфигуриран. Проверете настройките на проекта.",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setMessage({
        type: "error",
        text: "Регистрацията не беше успешна. Проверете имейла и паролата.",
      });
      return;
    }

    setMessage({
      type: "success",
      text: "Регистрацията е изпратена успешно. Проверете имейла си за потвърждение.",
    });
  }

  async function handleSignIn() {
    setMessage(null);

    if (!supabase) {
      setMessage({
        type: "error",
        text: "Supabase не е конфигуриран. Проверете настройките на проекта.",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setMessage({
        type: "error",
        text: "Входът не беше успешен. Проверете имейла и паролата.",
      });
      return;
    }

    setMessage({
      type: "success",
      text: "Влязохте успешно.",
    });
  }

  return (
    <section className="mt-8 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-8">
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-emerald-100">
            Имейл
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none placeholder:text-emerald-200/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-emerald-100">
            Парола
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            minLength={6}
            className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none placeholder:text-emerald-200/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
            placeholder="Минимум 6 символа"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => void handleSignUp()}
            disabled={isLoading}
            className="min-h-12 rounded-2xl bg-yellow-300 px-6 py-4 font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:ring-offset-2 focus:ring-offset-green-950 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Регистрация
          </button>
          <button
            type="button"
            onClick={() => void handleSignIn()}
            disabled={isLoading}
            className="min-h-12 rounded-2xl border border-emerald-700 bg-emerald-950 px-6 py-4 font-bold text-emerald-50 transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:ring-offset-2 focus:ring-offset-green-950 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Вход
          </button>
        </div>

        <p className="rounded-2xl border border-yellow-300/40 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-50">
          След регистрация може да се наложи да потвърдите имейла си.
        </p>

        {message ? (
          <p
            className={
              message.type === "success"
                ? "rounded-2xl border border-emerald-300/40 bg-emerald-900/50 p-4 text-emerald-50"
                : "rounded-2xl border border-red-300/40 bg-red-950/50 p-4 text-red-50"
            }
          >
            {message.text}
          </p>
        ) : null}
      </form>
    </section>
  );
}
