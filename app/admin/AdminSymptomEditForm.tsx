"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type EditableSymptom = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

type AdminSymptomEditFormProps = {
  symptom: EditableSymptom;
  onCancel: () => void;
  onUpdated: (symptom: EditableSymptom) => void;
};

function valuesFromSymptom(symptom: EditableSymptom) {
  return {
    slug: symptom.slug ?? "",
    name: symptom.name ?? "",
    description: symptom.description ?? "",
  };
}

function normalizeOptionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default function AdminSymptomEditForm({
  symptom,
  onCancel,
  onUpdated,
}: AdminSymptomEditFormProps) {
  const [values, setValues] = useState(() => valuesFromSymptom(symptom));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setValues(valuesFromSymptom(symptom));
    setSuccessMessage(null);
    setErrorMessage(null);
  }, [symptom]);

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
      .from("symptoms")
      .update({
        slug,
        name,
        description: normalizeOptionalValue(values.description),
      })
      .eq("id", symptom.id)
      .select("id, slug, name, description")
      .single();

    setIsSubmitting(false);

    if (error || !data) {
      setErrorMessage("Възникна проблем при обновяване на симптома.");
      return;
    }

    setSuccessMessage("Симптомът беше обновен успешно.");
    onUpdated(data as EditableSymptom);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-3xl border border-yellow-300/40 bg-yellow-300/10 p-5 shadow-xl sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Редакция
          </p>
          <h3 className="mt-2 text-2xl font-bold text-yellow-200">{symptom.name}</h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-emerald-700 bg-emerald-900/70 px-4 py-2 text-sm font-bold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
        >
          Затвори
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-emerald-100">Slug *</span>
          <input
            type="text"
            required
            value={values.slug}
            onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))}
            className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-emerald-100">Име *</span>
          <input
            type="text"
            required
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
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
          rows={4}
          className="mt-2 w-full resize-y rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
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
        {isSubmitting ? "Запазване..." : "Запази промените"}
      </button>
    </form>
  );
}
