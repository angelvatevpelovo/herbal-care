"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type CreatedHerb = {
  id: string;
  slug: string;
  name: string;
  latin: string | null;
  emoji: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  image_credit?: string | null;
  image_source_url?: string | null;
  short_description: string | null;
  description: string | null;
  traditional_uses: string | null;
  preparation: string | null;
  precautions: string | null;
  interactions: string | null;
  when_to_see_doctor: string | null;
};

type AdminHerbFormProps = {
  onCreated?: (herb: CreatedHerb) => void;
};

type HerbFormValues = {
  slug: string;
  name: string;
  latin: string;
  emoji: string;
  image_url: string;
  image_alt: string;
  image_credit: string;
  image_source_url: string;
  short_description: string;
  description: string;
  traditional_uses: string;
  preparation: string;
  precautions: string;
  interactions: string;
  when_to_see_doctor: string;
};

const initialValues: HerbFormValues = {
  slug: "",
  name: "",
  latin: "",
  emoji: "",
  image_url: "",
  image_alt: "",
  image_credit: "",
  image_source_url: "",
  short_description: "",
  description: "",
  traditional_uses: "",
  preparation: "",
  precautions: "",
  interactions: "",
  when_to_see_doctor: "",
};

const textFields = [
  { name: "slug", label: "Slug", required: true, placeholder: "naprimer-layka" },
  { name: "name", label: "Име", required: true, placeholder: "Лайка" },
  { name: "latin", label: "Латинско име", required: false, placeholder: "Matricaria chamomilla" },
  { name: "emoji", label: "Емоджи", required: false, placeholder: "🌿" },
  { name: "image_url", label: "URL на снимка", required: false, placeholder: "https://example.com/herb-image.jpg" },
  { name: "image_alt", label: "Alt текст за снимката", required: false, placeholder: "Снимка на лайка" },
  { name: "image_credit", label: "Кредит / автор на снимката", required: false, placeholder: "Автор или източник" },
  { name: "image_source_url", label: "URL към източника на снимката", required: false, placeholder: "https://example.com/source" },
] as const;

const textareaFields = [
  {
    name: "short_description",
    label: "Кратко описание",
    required: true,
    placeholder: "Кратко, предпазливо образователно описание.",
  },
  {
    name: "description",
    label: "Описание",
    required: false,
    placeholder: "Общо описание на билката без обещания за лечение.",
  },
  {
    name: "traditional_uses",
    label: "Традиционна употреба",
    required: false,
    placeholder: "Традиционно се използва... Може да подпомогне...",
  },
  {
    name: "preparation",
    label: "Начин на приготвяне",
    required: false,
    placeholder: "Образователна информация за традиционна подготовка.",
  },
  {
    name: "precautions",
    label: "Предпазни мерки",
    required: false,
    placeholder: "Опишете кога е нужна предпазливост.",
  },
  {
    name: "interactions",
    label: "Взаимодействия",
    required: false,
    placeholder: "Възможни взаимодействия с лекарства или състояния.",
  },
  {
    name: "when_to_see_doctor",
    label: "Кога да се потърси лекар",
    required: false,
    placeholder: "Силни, внезапни или продължителни симптоми...",
  },
] as const;

function normalizeOptionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default function AdminHerbForm({ onCreated }: AdminHerbFormProps) {
  const [values, setValues] = useState<HerbFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      .insert({
        slug,
        name,
        latin: normalizeOptionalValue(values.latin),
        emoji: normalizeOptionalValue(values.emoji),
        image_url: normalizeOptionalValue(values.image_url),
        image_alt: normalizeOptionalValue(values.image_alt),
        image_credit: normalizeOptionalValue(values.image_credit),
        image_source_url: normalizeOptionalValue(values.image_source_url),
        short_description: shortDescription,
        description: normalizeOptionalValue(values.description),
        traditional_uses: normalizeOptionalValue(values.traditional_uses),
        preparation: normalizeOptionalValue(values.preparation),
        precautions: normalizeOptionalValue(values.precautions),
        interactions: normalizeOptionalValue(values.interactions),
        when_to_see_doctor: normalizeOptionalValue(values.when_to_see_doctor),
      })
      .select(
        "id, slug, name, latin, emoji, image_url, image_alt, image_credit, image_source_url, short_description, description, traditional_uses, preparation, precautions, interactions, when_to_see_doctor"
      )
      .single();

    setIsSubmitting(false);

    if (error || !data) {
      setErrorMessage("Възникна проблем при добавяне на билката.");
      return;
    }

    setValues(initialValues);
    setSuccessMessage("Билката беше добавена успешно.");
    onCreated?.(data as CreatedHerb);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
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
              placeholder={field.placeholder}
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
              placeholder={field.placeholder}
              rows={field.name === "short_description" ? 3 : 5}
              className="mt-2 w-full resize-y rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition placeholder:text-emerald-300/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
            />
          </label>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-50">
        Добавяйте само предпазливо формулирана образователна информация. Herbal Care не поставя
        диагнози, не назначава лечение и не замества лекарска консултация.
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
        {isSubmitting ? "Добавяне..." : "Добави билка"}
      </button>
    </form>
  );
}
