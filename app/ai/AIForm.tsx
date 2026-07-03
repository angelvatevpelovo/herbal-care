"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type RelatedLink = {
  label: string;
  href: string;
};

type AIResponse = {
  answer: string;
  isEmergency: boolean;
  relatedLinks?: RelatedLink[];
};

export default function AIForm() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(
    "Това е примерен отговор. В следваща стъпка ще свържем AI помощника с реален модел.",
  );
  const [relatedLinks, setRelatedLinks] = useState<RelatedLink[]>([]);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function handleSubmit() {
    setIsLoading(true);
    setHasError(false);
    setRelatedLinks([]);

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }
      }

      const result = await fetch("/api/ai", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: question }),
      });

      if (!result.ok) {
        throw new Error("AI request failed");
      }

      const data = (await result.json()) as AIResponse;
      setResponse(data.answer);
      setIsEmergency(data.isEmergency);
      setRelatedLinks(data.relatedLinks ?? []);
    } catch {
      setHasError(true);
      setIsEmergency(false);
      setRelatedLinks([]);
      setResponse("Възникна проблем. Моля, опитайте отново.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-8">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <label htmlFor="ai-question" className="block text-lg font-bold text-yellow-200">
          Въпрос към помощника
        </label>
        <textarea
          id="ai-question"
          name="question"
          rows={8}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Опишете симптом, въпрос за билка или общ здравословен въпрос..."
          className="mt-4 min-h-56 w-full resize-y rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-4 leading-7 text-emerald-50 outline-none placeholder:text-emerald-200/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-5 min-h-12 w-full rounded-2xl bg-yellow-300 px-6 py-4 font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:ring-offset-2 focus:ring-offset-green-950 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {isLoading ? "Помощникът подготвя отговор..." : "Попитай помощника"}
        </button>
      </form>

      <div
        className={
          isEmergency
            ? "mt-8 rounded-2xl border border-red-300/50 bg-red-950/60 p-5"
            : hasError
              ? "mt-8 rounded-2xl border border-yellow-300/50 bg-yellow-950/40 p-5"
              : "mt-8 rounded-2xl border border-emerald-700 bg-emerald-950/60 p-5"
        }
      >
        <h2
          className={
            isEmergency
              ? "text-lg font-bold text-red-100"
              : hasError
                ? "text-lg font-bold text-yellow-100"
                : "text-lg font-bold text-emerald-100"
          }
        >
          Отговор
        </h2>
        <p
          className={
            isEmergency
              ? "mt-3 leading-7 text-red-50"
              : hasError
                ? "mt-3 leading-7 text-yellow-50"
                : "mt-3 leading-7 text-emerald-50"
          }
        >
          {isLoading ? "Помощникът подготвя отговор..." : response}
        </p>

        {relatedLinks.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200">
              Свързани страници
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-emerald-700 bg-emerald-900/60 px-3 py-2 text-sm font-medium text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-emerald-950"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
