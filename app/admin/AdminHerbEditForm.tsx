"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type EditableHerb = {
  id: string;
  slug: string;
  name: string;
  latin: string | null;
  emoji: string | null;
  short_description: string | null;
  description: string | null;
  traditional_uses: string | null;
  preparation: string | null;
  precautions: string | null;
  interactions: string | null;
  when_to_see_doctor: string | null;
};

type HerbFormValues = {
  slug: string;
  name: string;
  latin: string;
  emoji: string;
  short_description: string;
  description: string;
  traditional_uses: string;
  preparation: string;
  precautions: string;
  interactions: string;
  when_to_see_doctor: string;
};

type AdminHerbEditFormProps = {
  herb: EditableHerb;
  onCancel: () => void;
  onUpdated: (herb: EditableHerb) => void;
};

const textFields = [
  { name: "slug", label: "Slug", required: true },
  { name: "name", label: "Име", required: true },
  { name: "latin", label: "Латинско име", required: false },
  { name: "emoji", label: "Емоджи", required: false },
] as const;

const textareaFields = [
  { name: "short_description", label: "Кратко описание", required: true, rows: 3 },
  { name: "description", label: "Описание", required: false, rows: 5 },
  { name: "traditional_uses", label: "Традиционна употреба", required: false, rows: 5 },
  { name: "preparation", label: "Начин на приготвяне", required: false, rows: 5 },
  { name: "precautions", label: "Предпазни мерки", required: false, rows: 5 },
  { name: "interactions", label: "Взаимодействия", required: false, rows: 5 },
  { name: "when_to_see_doctor", label: "Кога да се потърси лекар", required: false, rows: 5 },
] as const;

function valuesFromHerb(herb: EditableHerb): HerbFormValues {
  return {
    slug: herb.slug ?? "",
    name: herb.name ?? "",
    latin: herb.latin ?? "",
    emoji: herb.emoji ?? "",
    short_description: herb.short_description ?? "",
    description: herb.description ?? "",
    traditional_uses: herb.traditional_uses ?? "",
    preparation: herb.preparation ?? "",
    precautions: herb.precautions ?? "",
    interactions: herb.interactions ?? "",
    when_to_see_doctor: herb.when_to_see_doctor ?? "",
  };
}

function normalizeOptionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default function AdminHerbEditForm({ herb, onCancel, onUpdated }: AdminHerbEditFormProps) {
  const [values, setValues] = useState<HerbFormValues>(() => valuesFromHerb(herb));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setValues(valuesFromHerb(herb));
    setSuccessMessage(null);
    setErrorMessage(null);
  }, [herb]);

  function updateValue(name: keyof HerbFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

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
    const shortDescription = values.short_description.trim();

    if (!slug || !name || !shortDescription) {
      setErrorMessage("Моля, попълнете задължителните полета.");
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("herbs")
      .update({
        slug,
        name,
        latin: normalizeOptionalValue(values.latin),
        emoji: normalizeOptionalValue(values.emoji),
        short_description: shortDescription,
        description: normalizeOptionalValue(values.description),
        traditional_uses: normalizeOptionalValue(values.traditional_uses),
        preparation: normalizeOptionalValue(values.preparation),
        precautions: normalizeOptionalValue(values.precautions),
        interactions: normalizeOptionalValue(values.interactions),
        when_to_see_doctor: normalizeOptionalValue(values.when_to_see_doctor),
      })
      .eq("id", herb.id)
      .select(
        "id, slug, name, latin, emoji, short_description, description, traditional_uses, preparation, precautions, interactions, when_to_see_doctor"
      )
      .single();

    setIsSubmitting(false);

    if (error || !data) {
      setErrorMessage("Възникна проблем при обновяване на билката.");
      return;
    }

    setSuccessMessage("Билката беше обновена успешно.");
    onUpdated(data as EditableHerb);
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
          <h3 className="mt-2 text-2xl font-bold text-yellow-200">{herb.name}</h3>
          <p className="mt-2 text-sm text-emerald-100">
            Обновявайте само проверена, предпазливо формулирана образователна информация.
          </p>
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
        {textFields.map((field) => (
          <label key={field.name} className="block">
            <span className="text-sm font-semibold text-emerald-100">
              {field.label}
              {field.required ? " *" : ""}
            </span>
            <input
              type="text"
              required={field.required}
              value={values[field.name]}
              onChange={(event) => updateValue(field.name, event.target.value)}
              className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition placeholder:text-emerald-300/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {textareaFields.map((field) => (
          <label key={field.name} className="block">
            <span className="text-sm font-semibold text-emerald-100">
              {field.label}
              {field.required ? " *" : ""}
            </span>
            <textarea
              required={field.required}
              value={values[field.name]}
              onChange={(event) => updateValue(field.name, event.target.value)}
              rows={field.rows}
              className="mt-2 w-full resize-y rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition placeholder:text-emerald-300/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
            />
          </label>
        ))}
      </div>

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
