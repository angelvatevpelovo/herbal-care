"use client";

import { type FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type FormMessage = {
  type: "success" | "error";
  text: string;
};

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [formMessage, setFormMessage] = useState<FormMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage(null);

    if (!message.trim()) {
      setFormMessage({
        type: "error",
        text: "Възникна проблем. Моля, опитайте отново.",
      });
      return;
    }

    if (!supabase) {
      setFormMessage({
        type: "error",
        text: "Възникна проблем. Моля, опитайте отново.",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from("feedback").insert({
      name: name.trim() || null,
      email: email.trim() || null,
      message: message.trim(),
    });

    setIsLoading(false);

    if (error) {
      setFormMessage({
        type: "error",
        text: "Възникна проблем. Моля, опитайте отново.",
      });
      return;
    }

    setName("");
    setEmail("");
    setMessage("");
    setFormMessage({
      type: "success",
      text: "Благодарим Ви! Съобщението беше изпратено успешно.",
    });
  }

  return (
    <section className="mt-8 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-8">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="block text-sm font-semibold text-emerald-100">
              Име <span className="font-normal text-emerald-300">(по избор)</span>
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none placeholder:text-emerald-200/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
              placeholder="Вашето име"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="block text-sm font-semibold text-emerald-100">
              Имейл <span className="font-normal text-emerald-300">(по избор)</span>
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none placeholder:text-emerald-200/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-message" className="block text-sm font-semibold text-emerald-100">
            Съобщение
          </label>
          <textarea
            id="contact-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            rows={7}
            className="mt-2 min-h-44 w-full resize-y rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-4 leading-7 text-emerald-50 outline-none placeholder:text-emerald-200/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
            placeholder="Напишете идея, корекция или въпрос..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="min-h-12 w-full rounded-2xl bg-yellow-300 px-6 py-4 font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:ring-offset-2 focus:ring-offset-green-950 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {isLoading ? "Изпращане..." : "Изпрати"}
        </button>

        {formMessage ? (
          <p
            className={
              formMessage.type === "success"
                ? "rounded-2xl border border-emerald-300/40 bg-emerald-900/50 p-4 text-emerald-50"
                : "rounded-2xl border border-red-300/40 bg-red-950/50 p-4 text-red-50"
            }
          >
            {formMessage.text}
          </p>
        ) : null}
      </form>
    </section>
  );
}
