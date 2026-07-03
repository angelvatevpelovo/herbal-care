"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type CreatedCategory = {
  slug: string;
  name: string;
  description: string | null;
};

type AdminCategoryFormProps = {
  onCreated?: (category: CreatedCategory) => void;
};

const initialValues = {
  slug: "",
  name: "",
  description: "",
};

function normalizeOptionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default function AdminCategoryForm({ onCreated }: AdminCategoryFormProps) {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!supabase) {
      setErrorMessage("Supabase не е конфигуриран.");
      return;
    }

    const slug = values.slug.trim();
    const name = values.name.trim();

    if (!slug || !name) {
      setErrorMessage("Моля, попълнете задължителните полета.");
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("categories")
      .insert({
        slug,
        name,
        description: normalizeOptionalValue(values.description),
      })
      .select("slug, name, description")
      .single();

    setIsSubmitting(false);

    if (error || !data) {
      setErrorMessage("Възникна проблем при добавяне на категорията.");
      return;
    }

    setValues(initialValues);
    setSuccessMessage("Категорията беше добавена успешно.");
    onCreated?.(data as CreatedCategory);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-emerald-100">Slug *</span>
          <input
            type="text"
            required
            value={values.slug}
            onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))}
            placeholder="nervna-sistema"
            className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition placeholder:text-emerald-300/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-emerald-100">Име *</span>
          <input
            type="text"
            required
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            placeholder="Нервна система"
            className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition placeholder:text-emerald-300/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-emerald-100">Описание</span>
        <textarea
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({ ...current, description: event.target.value }))
          }
          placeholder="Кратко образователно описание на категорията."
          rows={4}
          className="mt-2 w-full resize-y rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition placeholder:text-emerald-300/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
        />
      </label>

      {successMessage ? (
        <div className="mt-4 rounded-2xl border border-emerald-300/40 bg-emerald-900/70 p-4 text-emerald-50">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-red-300/40 bg-red-950/70 p-4 text-red-50">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-yellow-300 px-5 py-3 text-center font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {isSubmitting ? "Добавяне..." : "Добави категория"}
      </button>
    </form>
  );
}
