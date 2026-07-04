"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RelationOption = {
  id: string;
  name: string;
  slug: string;
};

type AdminHerbRelationsFormProps = {
  onSaved?: (relations: {
    herbId: string;
    symptomIds: string[];
    categoryIds: string[];
  }) => void;
};

export default function AdminHerbRelationsForm({ onSaved }: AdminHerbRelationsFormProps) {
  const [herbs, setHerbs] = useState<RelationOption[]>([]);
  const [symptoms, setSymptoms] = useState<RelationOption[]>([]);
  const [categories, setCategories] = useState<RelationOption[]>([]);
  const [selectedHerbId, setSelectedHerbId] = useState("");
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRelationOptions() {
      if (!supabase) {
        if (isMounted) {
          setErrorMessage("Supabase не е конфигуриран.");
          setIsLoading(false);
        }
        return;
      }

      const [
        { data: herbsData, error: herbsError },
        { data: symptomsData, error: symptomsError },
        { data: categoriesData, error: categoriesError },
      ] = await Promise.all([
        supabase.from("herbs").select("id, name, slug").order("name", { ascending: true }),
        supabase.from("symptoms").select("id, name, slug").order("name", { ascending: true }),
        supabase.from("categories").select("id, name, slug").order("name", { ascending: true }),
      ]);

      if (!isMounted) {
        return;
      }

      if (herbsError || symptomsError || categoriesError) {
        setErrorMessage("Възникна проблем при зареждане на данните за връзки.");
      } else {
        setHerbs((herbsData ?? []) as RelationOption[]);
        setSymptoms((symptomsData ?? []) as RelationOption[]);
        setCategories((categoriesData ?? []) as RelationOption[]);
      }

      setIsLoading(false);
    }

    void loadRelationOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  function toggleSelection(id: string, currentIds: string[], update: (ids: string[]) => void) {
    update(currentIds.includes(id) ? currentIds.filter((currentId) => currentId !== id) : [...currentIds, id]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!supabase) {
      setErrorMessage("Supabase не е конфигуриран.");
      return;
    }

    if (!selectedHerbId) {
      setErrorMessage("Моля, изберете билка.");
      return;
    }

    if (selectedSymptomIds.length === 0 && selectedCategoryIds.length === 0) {
      setErrorMessage("Моля, изберете поне един симптом или категория.");
      return;
    }

    setIsSubmitting(true);

    const symptomRows = selectedSymptomIds.map((symptomId) => ({
      herb_id: selectedHerbId,
      symptom_id: symptomId,
    }));
    const categoryRows = selectedCategoryIds.map((categoryId) => ({
      herb_id: selectedHerbId,
      category_id: categoryId,
    }));

    const symptomResult =
      symptomRows.length > 0
        ? await supabase.from("herb_symptoms").upsert(symptomRows, {
            onConflict: "herb_id,symptom_id",
            ignoreDuplicates: true,
          })
        : { error: null };

    const categoryResult =
      categoryRows.length > 0
        ? await supabase.from("herb_categories").upsert(categoryRows, {
            onConflict: "herb_id,category_id",
            ignoreDuplicates: true,
          })
        : { error: null };

    setIsSubmitting(false);

    if (symptomResult.error || categoryResult.error) {
      setErrorMessage("Възникна проблем при запазване на връзките.");
      return;
    }

    onSaved?.({
      herbId: selectedHerbId,
      symptomIds: selectedSymptomIds,
      categoryIds: selectedCategoryIds,
    });
    setSelectedSymptomIds([]);
    setSelectedCategoryIds([]);
    setSuccessMessage("Връзките бяха запазени успешно.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6"
    >
      <p className="leading-7 text-emerald-100">
        Тези връзки помагат билките да се показват правилно в симптоми, категории, филтри и AI
        помощника.
      </p>

      {isLoading ? (
        <div className="mt-5 rounded-2xl border border-emerald-700 bg-emerald-950/70 p-4 text-emerald-100">
          Зареждаме билки, симптоми и категории...
        </div>
      ) : (
        <>
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-emerald-100">Билка *</span>
            <select
              required
              value={selectedHerbId}
              onChange={(event) => setSelectedHerbId(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
            >
              <option value="">Изберете билка</option>
              {herbs.map((herb) => (
                <option key={herb.id} value={herb.id}>
                  {herb.name} ({herb.slug})
                </option>
              ))}
            </select>
          </label>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <fieldset className="rounded-2xl border border-emerald-800 bg-emerald-950/50 p-4">
              <legend className="px-2 text-sm font-semibold text-yellow-200">Симптоми</legend>
              {symptoms.length === 0 ? (
                <p className="mt-3 text-emerald-100">Няма налични симптоми.</p>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {symptoms.map((symptom) => (
                    <label
                      key={symptom.id}
                      className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-emerald-800 bg-emerald-900/50 px-4 py-3 text-emerald-50 transition hover:border-yellow-300"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSymptomIds.includes(symptom.id)}
                        onChange={() =>
                          toggleSelection(symptom.id, selectedSymptomIds, setSelectedSymptomIds)
                        }
                        className="h-5 w-5 rounded border-emerald-600 accent-yellow-300"
                      />
                      <span>{symptom.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <fieldset className="rounded-2xl border border-emerald-800 bg-emerald-950/50 p-4">
              <legend className="px-2 text-sm font-semibold text-yellow-200">Категории</legend>
              {categories.length === 0 ? (
                <p className="mt-3 text-emerald-100">Няма налични категории.</p>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-emerald-800 bg-emerald-900/50 px-4 py-3 text-emerald-50 transition hover:border-yellow-300"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(category.id)}
                        onChange={() =>
                          toggleSelection(category.id, selectedCategoryIds, setSelectedCategoryIds)
                        }
                        className="h-5 w-5 rounded border-emerald-600 accent-yellow-300"
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
          </div>
        </>
      )}

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
        disabled={isLoading || isSubmitting}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-yellow-300 px-5 py-3 text-center font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {isSubmitting ? "Запазване..." : "Запази връзките"}
      </button>
    </form>
  );
}
