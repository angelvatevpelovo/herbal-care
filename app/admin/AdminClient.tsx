"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminCategoryEditForm from "./AdminCategoryEditForm";
import AdminCategoryForm from "./AdminCategoryForm";
import AdminHerbEditForm from "./AdminHerbEditForm";
import AdminHerbForm from "./AdminHerbForm";
import AdminHerbRelationsForm from "./AdminHerbRelationsForm";
import AdminSymptomEditForm from "./AdminSymptomEditForm";
import AdminSymptomForm from "./AdminSymptomForm";

type AdminCard = {
  title: string;
  description: string;
  href: string;
};

type FeedbackMessage = {
  id: string;
  name: string | null;
  email: string | null;
  message: string;
  created_at: string | null;
};

type AdminHerb = {
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

type AdminSymptom = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

type AiHistoryEntry = {
  id: string;
  question: string;
  answer: string;
  is_emergency: boolean;
  created_at: string | null;
};

type AdminProfile = {
  email: string | null;
  is_admin: boolean | null;
  created_at: string | null;
};

type AdminHerbSymptomRelation = {
  herb_id: string;
  symptom_id: string;
};

type AdminHerbCategoryRelation = {
  herb_id: string;
  category_id: string;
};

type AdminHerbRecipe = {
  id: string;
  herb_id: string;
  title: string | null;
  preparation_type: string | null;
  ingredients: string | null;
  instructions: string | null;
  dosage_note: string | null;
  safety_note: string | null;
  created_at: string | null;
};

type AdminStats = {
  herbs: number | null;
  symptoms: number | null;
  categories: number | null;
  feedback: number | null;
  aiHistory: number | null;
};

type HerbContentField =
  | "short_description"
  | "description"
  | "traditional_uses"
  | "preparation"
  | "precautions"
  | "interactions"
  | "when_to_see_doctor";

type HerbOverviewFilter =
  | "all"
  | "incomplete_content"
  | "without_symptoms"
  | "without_categories"
  | "without_symptoms_and_categories";

type RecipeFormValues = {
  herb_id: string;
  title: string;
  preparation_type: string;
  ingredients: string;
  instructions: string;
  dosage_note: string;
  safety_note: string;
};

const adminCards: AdminCard[] = [
  {
    title: "Билки",
    description: "Бъдещо управление на билки, описания, противопоказания и взаимодействия.",
    href: "/herbs",
  },
  {
    title: "Симптоми",
    description: "Бъдещо редактиране на симптоми и връзки към образователни ресурси.",
    href: "/symptoms",
  },
  {
    title: "Категории",
    description: "Бъдеща организация на билките по тематични категории.",
    href: "/categories",
  },
  {
    title: "Обратна връзка",
    description: "Бъдещ преглед на изпратени идеи, корекции и въпроси от потребители.",
    href: "/contact",
  },
  {
    title: "AI история",
    description: "Бъдещ преглед на AI активност при спазване на поверителност и безопасност.",
    href: "/ai-history",
  },
];

const initialStats: AdminStats = {
  herbs: null,
  symptoms: null,
  categories: null,
  feedback: null,
  aiHistory: null,
};

const initialRecipeFormValues: RecipeFormValues = {
  herb_id: "",
  title: "",
  preparation_type: "",
  ingredients: "",
  instructions: "",
  dosage_note: "",
  safety_note: "",
};

const statCards = [
  { key: "herbs", label: "Билки" },
  { key: "symptoms", label: "Симптоми" },
  { key: "categories", label: "Категории" },
  { key: "feedback", label: "Съобщения" },
  { key: "aiHistory", label: "AI записи" },
] as const;

const mvpChecklistItems = [
  "Начална страница работи",
  "Билки се зареждат от Supabase",
  "Детайлна страница на билка работи",
  "Симптоми се зареждат",
  "Категории се зареждат",
  "Търсенето работи",
  "AI помощникът връща безопасни отговори",
  "Emergency предупрежденията работят",
  "Вход / Регистрация работи",
  "Профилът работи",
  "Любими билки работят",
  "Contact формата записва feedback",
  "Privacy и Terms са достъпни",
  "Admin панелът е защитен",
  "CRUD за билки/симптоми/категории работи",
  "Сайтът е mobile-friendly",
  "Vercel deploy е активен",
] as const;

const launchChecklistItems = [
  "Няма тестови билки",
  "Няма тестови симптоми",
  "Няма тестови категории",
  "Всички основни страници се отварят",
  "Регистрацията и входът работят",
  "Любими билки работят",
  "Contact формата записва съобщения",
  "AI помощникът показва безопасни предупреждения",
  "Admin панелът е достъпен само за админ",
  "Мобилният изглед е проверен",
  "Vercel deployment е успешен",
] as const;

const contentQualityChecklistItems = [
  "Има ясно кратко описание",
  "Има подробно описание",
  "Има традиционна употреба",
  "Има начин на приготвяне",
  "Има предпазни мерки",
  "Има взаимодействия с лекарства",
  "Има кога да се потърси лекар",
  "Текстът не обещава лечение",
  'Използва внимателни думи като "може", "традиционно", "при някои хора"',
  "Билката е свързана със симптоми",
  "Билката е свързана с категории",
] as const;

const herbContentFields: { key: HerbContentField; label: string }[] = [
  { key: "short_description", label: "кратко описание" },
  { key: "description", label: "подробно описание" },
  { key: "traditional_uses", label: "традиционна употреба" },
  { key: "preparation", label: "начин на приготвяне" },
  { key: "precautions", label: "предпазни мерки" },
  { key: "interactions", label: "взаимодействия с лекарства" },
  { key: "when_to_see_doctor", label: "кога да се потърси лекар" },
];

const herbOverviewFilters: { key: HerbOverviewFilter; label: string }[] = [
  { key: "all", label: "Всички" },
  { key: "incomplete_content", label: "Непълно съдържание" },
  { key: "without_symptoms", label: "Без симптоми" },
  { key: "without_categories", label: "Без категории" },
  { key: "without_symptoms_and_categories", label: "Без симптоми и категории" },
];

const riskyMedicalPhrases: string[] = [
  "лекува",
  "излекува",
  "излекуване",
  "лечение",
  "гарантира",
  "гарантирано",
  "премахва болест",
  "сигурно помага",
  "замества лекар",
  "без нужда от лекар",
  "вместо лекарства",
  "спирайте лекарствата",
];

function getAnswerPreview(answer: string) {
  return answer.length > 220 ? `${answer.slice(0, 220)}...` : answer;
}

function getMissingHerbContentFields(herb: AdminHerb) {
  return herbContentFields
    .filter(({ key }) => !herb[key]?.trim())
    .map(({ label }) => label);
}

function findRiskyMedicalPhrase(values: Array<string | null | undefined>) {
  const text = values.filter(Boolean).join(" ").toLocaleLowerCase("bg-BG");
  return riskyMedicalPhrases.find((phrase) => text.includes(phrase));
}

export default function AdminClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [herbs, setHerbs] = useState<AdminHerb[]>([]);
  const [symptoms, setSymptoms] = useState<AdminSymptom[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>([]);
  const [aiHistoryEntries, setAiHistoryEntries] = useState<AiHistoryEntry[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [herbSymptomRelations, setHerbSymptomRelations] = useState<AdminHerbSymptomRelation[]>(
    []
  );
  const [herbCategoryRelations, setHerbCategoryRelations] = useState<
    AdminHerbCategoryRelation[]
  >([]);
  const [herbRecipes, setHerbRecipes] = useState<AdminHerbRecipe[]>([]);
  const [recipeFormValues, setRecipeFormValues] =
    useState<RecipeFormValues>(initialRecipeFormValues);
  const [isRecipeSubmitting, setIsRecipeSubmitting] = useState(false);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [editingRecipe, setEditingRecipe] = useState<AdminHerbRecipe | null>(null);
  const [recipeEditValues, setRecipeEditValues] =
    useState<RecipeFormValues>(initialRecipeFormValues);
  const [isRecipeUpdating, setIsRecipeUpdating] = useState(false);
  const [editingHerb, setEditingHerb] = useState<AdminHerb | null>(null);
  const [editingSymptom, setEditingSymptom] = useState<AdminSymptom | null>(null);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [herbOverviewFilter, setHerbOverviewFilter] = useState<HerbOverviewFilter>("all");
  const [symptomSearch, setSymptomSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [showOnlyEmergencyAi, setShowOnlyEmergencyAi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [adminActionMessage, setAdminActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAdminAccess() {
      if (!supabase) {
        if (isMounted) {
          setMessage("Supabase не е конфигуриран.");
          setIsLoading(false);
        }
        return;
      }

      const client = supabase;

      const {
        data: { user },
      } = await client.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const { data, error } = await client
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        setMessage("Не успяхме да проверим администраторския достъп.");
        setIsLoading(false);
        return;
      }

      const hasAdminAccess = Boolean(data?.is_admin);
      setIsAdmin(hasAdminAccess);

      if (!hasAdminAccess) {
        setIsLoading(false);
        return;
      }

      const countRows = async (table: string) => {
        const { count, error } = await client
          .from(table)
          .select("*", { count: "exact", head: true });

        return error ? null : count;
      };

      const [herbsCount, symptomsCount, categoriesCount, feedbackCount, aiHistoryCount] =
        await Promise.all([
          countRows("herbs"),
          countRows("symptoms"),
          countRows("categories"),
          countRows("feedback"),
          countRows("ai_history"),
        ]);

      if (!isMounted) {
        return;
      }

      setStats({
        herbs: herbsCount,
        symptoms: symptomsCount,
        categories: categoriesCount,
        feedback: feedbackCount,
        aiHistory: aiHistoryCount,
      });

      const [
        { data: herbsData, error: herbsError },
        { data: symptomsData, error: symptomsError },
        { data: categoriesData, error: categoriesError },
        { data: aiHistoryData, error: aiHistoryError },
        { data: feedback, error: feedbackError },
        { data: profilesData, error: profilesError },
        { data: herbSymptomRelationsData, error: herbSymptomRelationsError },
        { data: herbCategoryRelationsData, error: herbCategoryRelationsError },
        { data: herbRecipesData, error: herbRecipesError },
      ] = await Promise.all([
        client
          .from("herbs")
          .select(
            "id, slug, name, latin, emoji, image_url, image_alt, image_credit, image_source_url, short_description, description, traditional_uses, preparation, precautions, interactions, when_to_see_doctor"
          )
          .order("name", { ascending: true }),
        client
          .from("symptoms")
          .select("id, slug, name, description")
          .order("name", { ascending: true }),
        client
          .from("categories")
          .select("id, slug, name, description")
          .order("name", { ascending: true }),
        client
          .from("ai_history")
          .select("id, question, answer, is_emergency, created_at")
          .order("created_at", { ascending: false })
          .limit(20),
        client
          .from("feedback")
          .select("id, name, email, message, created_at")
          .order("created_at", { ascending: false })
          .limit(20),
        client
          .from("profiles")
          .select("email, is_admin, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
        client.from("herb_symptoms").select("herb_id, symptom_id"),
        client.from("herb_categories").select("herb_id, category_id"),
        client
          .from("herb_recipes")
          .select(
            "id, herb_id, title, preparation_type, ingredients, instructions, dosage_note, safety_note, created_at"
          )
          .order("created_at", { ascending: false }),
      ]);

      if (!isMounted) {
        return;
      }

      if (
        herbsError ||
        symptomsError ||
        categoriesError ||
        aiHistoryError ||
        feedbackError ||
        profilesError ||
        herbSymptomRelationsError ||
        herbCategoryRelationsError ||
        herbRecipesError
      ) {
        setMessage("Не успяхме да заредим админ данните.");
      } else {
        setHerbs((herbsData ?? []) as AdminHerb[]);
        setSymptoms((symptomsData ?? []) as AdminSymptom[]);
        setCategories((categoriesData ?? []) as AdminCategory[]);
        setAiHistoryEntries((aiHistoryData ?? []) as AiHistoryEntry[]);
        setFeedbackMessages((feedback ?? []) as FeedbackMessage[]);
        setProfiles((profilesData ?? []) as AdminProfile[]);
        setHerbSymptomRelations(
          (herbSymptomRelationsData ?? []) as AdminHerbSymptomRelation[]
        );
        setHerbCategoryRelations(
          (herbCategoryRelationsData ?? []) as AdminHerbCategoryRelation[]
        );
        setHerbRecipes((herbRecipesData ?? []) as AdminHerbRecipe[]);
      }

      setIsLoading(false);
    }

    void checkAdminAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="mt-8 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
        Проверяваме достъпа...
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mt-8 rounded-3xl bg-white/10 p-5 ring-1 ring-white/10 sm:p-6">
        <p className="text-emerald-100">
          Трябва да влезете в профила си, за да отворите админ панела.
        </p>
        <Link
          href="/auth"
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-yellow-300 px-5 py-3 text-center font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 sm:w-auto"
        >
          Вход / Регистрация
        </Link>
      </div>
    );
  }

  if (message) {
    return (
      <div className="mt-8 rounded-3xl border border-red-300/40 bg-red-950/50 p-5 text-red-50 sm:p-6">
        {message}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mt-8 rounded-3xl border border-yellow-300/40 bg-yellow-300/10 p-5 text-yellow-50 sm:p-6">
        <h2 className="text-xl font-bold text-yellow-100">Нямате администраторски достъп.</h2>
        <p className="mt-3 leading-7">
          Този раздел е ограничен до профили с администраторски права.
        </p>
      </div>
    );
  }

  const emergencyAiCount = aiHistoryEntries.filter((entry) => entry.is_emergency).length;
  const visibleAiHistoryEntries = showOnlyEmergencyAi
    ? aiHistoryEntries.filter((entry) => entry.is_emergency)
    : aiHistoryEntries;
  const completeHerbsCount = herbs.filter(
    (herb) => getMissingHerbContentFields(herb).length === 0
  ).length;
  const incompleteHerbsCount = herbs.length - completeHerbsCount;
  const herbIdsWithSymptoms = new Set(herbSymptomRelations.map((relation) => relation.herb_id));
  const herbIdsWithCategories = new Set(
    herbCategoryRelations.map((relation) => relation.herb_id)
  );
  const herbsWithSymptomsCount = herbs.filter((herb) => herbIdsWithSymptoms.has(herb.id)).length;
  const herbsWithCategoriesCount = herbs.filter((herb) =>
    herbIdsWithCategories.has(herb.id)
  ).length;
  const herbsWithoutRelationsCount = herbs.filter(
    (herb) => !herbIdsWithSymptoms.has(herb.id) && !herbIdsWithCategories.has(herb.id)
  ).length;
  const filteredHerbs = herbs.filter((herb) => {
    const hasSymptoms = herbIdsWithSymptoms.has(herb.id);
    const hasCategories = herbIdsWithCategories.has(herb.id);

    if (herbOverviewFilter === "incomplete_content") {
      return getMissingHerbContentFields(herb).length > 0;
    }

    if (herbOverviewFilter === "without_symptoms") {
      return !hasSymptoms;
    }

    if (herbOverviewFilter === "without_categories") {
      return !hasCategories;
    }

    if (herbOverviewFilter === "without_symptoms_and_categories") {
      return !hasSymptoms && !hasCategories;
    }

    return true;
  });
  const normalizedSymptomSearch = symptomSearch.trim().toLowerCase();
  const filteredSymptoms = symptoms.filter((symptom) => {
    if (!normalizedSymptomSearch) {
      return true;
    }

    return [symptom.name, symptom.slug, symptom.description ?? ""].some((value) =>
      value.toLowerCase().includes(normalizedSymptomSearch)
    );
  });
  const normalizedCategorySearch = categorySearch.trim().toLowerCase();
  const filteredCategories = categories.filter((category) => {
    if (!normalizedCategorySearch) {
      return true;
    }

    return [category.name, category.slug, category.description ?? ""].some((value) =>
      value.toLowerCase().includes(normalizedCategorySearch)
    );
  });
  const incompleteContentHerbs = herbs
    .filter((herb) => getMissingHerbContentFields(herb).length > 0)
    .slice(0, 8);
  const herbsWithoutAnyRelations = herbs
    .filter((herb) => !herbIdsWithSymptoms.has(herb.id) && !herbIdsWithCategories.has(herb.id))
    .slice(0, 8);
  const herbNameById = new Map(herbs.map((herb) => [herb.id, herb.name]));
  const riskyHerbs = herbs
    .map((herb) => ({
      herb,
      matchedPhrase: findRiskyMedicalPhrase([
        herb.short_description,
        herb.description,
        herb.traditional_uses,
        herb.preparation,
        herb.precautions,
        herb.interactions,
        herb.when_to_see_doctor,
      ]),
    }))
    .filter((item): item is { herb: AdminHerb; matchedPhrase: string } =>
      Boolean(item.matchedPhrase)
    );
  const riskyRecipes = herbRecipes
    .map((recipe) => ({
      recipe,
      matchedPhrase: findRiskyMedicalPhrase([
        recipe.title,
        recipe.preparation_type,
        recipe.ingredients,
        recipe.instructions,
        recipe.dosage_note,
        recipe.safety_note,
      ]),
    }))
    .filter((item): item is { recipe: AdminHerbRecipe; matchedPhrase: string } =>
      Boolean(item.matchedPhrase)
    );
  const normalizedRecipeSearch = recipeSearch.trim().toLowerCase();
  const filteredHerbRecipes = herbRecipes.filter((recipe) => {
    if (!normalizedRecipeSearch) {
      return true;
    }

    return [
      recipe.title ?? "",
      recipe.preparation_type ?? "",
      recipe.ingredients ?? "",
      recipe.instructions ?? "",
      recipe.dosage_note ?? "",
      recipe.safety_note ?? "",
      herbNameById.get(recipe.herb_id) ?? "",
    ].some((value) => value.toLowerCase().includes(normalizedRecipeSearch));
  });

  function updateRecipeFormValue(name: keyof RecipeFormValues, value: string) {
    setRecipeFormValues((current) => ({ ...current, [name]: value }));
  }

  function updateRecipeEditValue(name: keyof RecipeFormValues, value: string) {
    setRecipeEditValues((current) => ({ ...current, [name]: value }));
  }

  function optionalRecipeValue(value: string) {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  function handleRecipeEditStart(recipe: AdminHerbRecipe) {
    setEditingRecipe(recipe);
    setRecipeEditValues({
      herb_id: recipe.herb_id,
      title: recipe.title ?? "",
      preparation_type: recipe.preparation_type ?? "",
      ingredients: recipe.ingredients ?? "",
      instructions: recipe.instructions ?? "",
      dosage_note: recipe.dosage_note ?? "",
      safety_note: recipe.safety_note ?? "",
    });
    setAdminActionMessage(null);
  }

  function handleRecipeEditCancel() {
    setEditingRecipe(null);
    setRecipeEditValues(initialRecipeFormValues);
  }

  async function handleRecipeCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setAdminActionMessage({
        type: "error",
        text: "Supabase не е конфигуриран.",
      });
      return;
    }

    const herbId = recipeFormValues.herb_id;
    const title = recipeFormValues.title.trim();

    if (!herbId || !title) {
      setAdminActionMessage({
        type: "error",
        text: "Моля, изберете билка и въведете заглавие на рецептата.",
      });
      return;
    }

    setIsRecipeSubmitting(true);
    setAdminActionMessage(null);

    const { data, error } = await supabase
      .from("herb_recipes")
      .insert({
        herb_id: herbId,
        title,
        preparation_type: optionalRecipeValue(recipeFormValues.preparation_type),
        ingredients: optionalRecipeValue(recipeFormValues.ingredients),
        instructions: optionalRecipeValue(recipeFormValues.instructions),
        dosage_note: optionalRecipeValue(recipeFormValues.dosage_note),
        safety_note: optionalRecipeValue(recipeFormValues.safety_note),
      })
      .select(
        "id, herb_id, title, preparation_type, ingredients, instructions, dosage_note, safety_note, created_at"
      )
      .single();

    setIsRecipeSubmitting(false);

    if (error || !data) {
      setAdminActionMessage({
        type: "error",
        text: "Възникна проблем при добавяне на рецептата.",
      });
      return;
    }

    setHerbRecipes((current) => [data as AdminHerbRecipe, ...current]);
    setRecipeFormValues(initialRecipeFormValues);
    setAdminActionMessage({
      type: "success",
      text: "Рецептата беше добавена успешно.",
    });
  }

  async function handleRecipeUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !editingRecipe) {
      setAdminActionMessage({
        type: "error",
        text: "Supabase не е конфигуриран.",
      });
      return;
    }

    const title = recipeEditValues.title.trim();

    if (!title) {
      setAdminActionMessage({
        type: "error",
        text: "Моля, въведете заглавие на рецептата.",
      });
      return;
    }

    setIsRecipeUpdating(true);
    setAdminActionMessage(null);

    const { data, error } = await supabase
      .from("herb_recipes")
      .update({
        title,
        preparation_type: optionalRecipeValue(recipeEditValues.preparation_type),
        ingredients: optionalRecipeValue(recipeEditValues.ingredients),
        instructions: optionalRecipeValue(recipeEditValues.instructions),
        dosage_note: optionalRecipeValue(recipeEditValues.dosage_note),
        safety_note: optionalRecipeValue(recipeEditValues.safety_note),
      })
      .eq("id", editingRecipe.id)
      .select(
        "id, herb_id, title, preparation_type, ingredients, instructions, dosage_note, safety_note, created_at"
      )
      .single();

    setIsRecipeUpdating(false);

    if (error || !data) {
      setAdminActionMessage({
        type: "error",
        text: "Възникна проблем при обновяване на рецептата.",
      });
      return;
    }

    const updatedRecipe = data as AdminHerbRecipe;
    setHerbRecipes((current) =>
      current.map((recipe) => (recipe.id === updatedRecipe.id ? updatedRecipe : recipe))
    );
    setEditingRecipe(null);
    setRecipeEditValues(initialRecipeFormValues);
    setAdminActionMessage({
      type: "success",
      text: "Рецептата беше обновена успешно.",
    });
  }

  async function handleRecipeDelete(recipe: AdminHerbRecipe) {
    if (
      !supabase ||
      !window.confirm("Сигурни ли сте, че искате да изтриете тази рецепта?")
    ) {
      return;
    }

    setAdminActionMessage(null);

    const { error } = await supabase.from("herb_recipes").delete().eq("id", recipe.id);

    if (error) {
      setAdminActionMessage({
        type: "error",
        text: "Възникна проблем при изтриване на рецептата.",
      });
      return;
    }

    setHerbRecipes((current) => current.filter((item) => item.id !== recipe.id));
    setEditingRecipe((current) => (current?.id === recipe.id ? null : current));
    setAdminActionMessage({
      type: "success",
      text: "Рецептата беше изтрита успешно.",
    });
  }

  function handleHerbCreated(herb: AdminHerb) {
    setHerbs((current) =>
      [...current, herb].sort((first, second) => first.name.localeCompare(second.name, "bg"))
    );
    setStats((current) => ({
      ...current,
      herbs: current.herbs === null ? current.herbs : current.herbs + 1,
    }));
  }

  function handleHerbUpdated(updatedHerb: AdminHerb) {
    setHerbs((current) =>
      current
        .map((herb) => (herb.id === updatedHerb.id ? updatedHerb : herb))
        .sort((first, second) => first.name.localeCompare(second.name, "bg"))
    );
    setEditingHerb(updatedHerb);
  }

  function handleHerbRelationsSaved({
    herbId,
    symptomIds,
    categoryIds,
  }: {
    herbId: string;
    symptomIds: string[];
    categoryIds: string[];
  }) {
    setHerbSymptomRelations((current) => {
      const existingKeys = new Set(
        current.map((relation) => `${relation.herb_id}:${relation.symptom_id}`)
      );
      const newRelations = symptomIds
        .map((symptomId) => ({ herb_id: herbId, symptom_id: symptomId }))
        .filter((relation) => !existingKeys.has(`${relation.herb_id}:${relation.symptom_id}`));

      return [...current, ...newRelations];
    });

    setHerbCategoryRelations((current) => {
      const existingKeys = new Set(
        current.map((relation) => `${relation.herb_id}:${relation.category_id}`)
      );
      const newRelations = categoryIds
        .map((categoryId) => ({ herb_id: herbId, category_id: categoryId }))
        .filter((relation) => !existingKeys.has(`${relation.herb_id}:${relation.category_id}`));

      return [...current, ...newRelations];
    });
  }

  function handleSymptomCreated(symptom: AdminSymptom) {
    setSymptoms((current) =>
      [...current, symptom].sort((first, second) => first.name.localeCompare(second.name, "bg"))
    );
    setStats((current) => ({
      ...current,
      symptoms: current.symptoms === null ? current.symptoms : current.symptoms + 1,
    }));
  }

  function handleSymptomUpdated(updatedSymptom: AdminSymptom) {
    setSymptoms((current) =>
      current
        .map((symptom) => (symptom.id === updatedSymptom.id ? updatedSymptom : symptom))
        .sort((first, second) => first.name.localeCompare(second.name, "bg"))
    );
    setEditingSymptom(updatedSymptom);
  }

  function handleCategoryCreated(category: AdminCategory) {
    setCategories((current) =>
      [...current, category].sort((first, second) => first.name.localeCompare(second.name, "bg"))
    );
    setStats((current) => ({
      ...current,
      categories: current.categories === null ? current.categories : current.categories + 1,
    }));
  }

  function handleCategoryUpdated(updatedCategory: AdminCategory) {
    setCategories((current) =>
      current
        .map((category) => (category.id === updatedCategory.id ? updatedCategory : category))
        .sort((first, second) => first.name.localeCompare(second.name, "bg"))
    );
    setEditingCategory(updatedCategory);
  }

  async function handleHerbDelete(herb: AdminHerb) {
    if (!supabase || !window.confirm("Сигурни ли сте, че искате да изтриете тази билка?")) {
      return;
    }

    setAdminActionMessage(null);

    const { error } = await supabase.from("herbs").delete().eq("id", herb.id);

    if (error) {
      setAdminActionMessage({
        type: "error",
        text: "Възникна проблем при изтриване на билката.",
      });
      return;
    }

    setHerbs((current) => current.filter((currentHerb) => currentHerb.id !== herb.id));
    setHerbSymptomRelations((current) =>
      current.filter((relation) => relation.herb_id !== herb.id)
    );
    setHerbCategoryRelations((current) =>
      current.filter((relation) => relation.herb_id !== herb.id)
    );
    setHerbRecipes((current) => current.filter((recipe) => recipe.herb_id !== herb.id));
    setEditingHerb((current) => (current?.id === herb.id ? null : current));
    setStats((current) => ({
      ...current,
      herbs: current.herbs === null ? current.herbs : Math.max(current.herbs - 1, 0),
    }));
    setAdminActionMessage({
      type: "success",
      text: "Билката беше изтрита успешно.",
    });
  }

  async function handleSymptomDelete(symptom: AdminSymptom) {
    if (!supabase || !window.confirm("Сигурни ли сте, че искате да изтриете този симптом?")) {
      return;
    }

    setAdminActionMessage(null);

    const { error } = await supabase.from("symptoms").delete().eq("id", symptom.id);

    if (error) {
      setAdminActionMessage({
        type: "error",
        text: "Възникна проблем при изтриване на симптома.",
      });
      return;
    }

    setSymptoms((current) =>
      current.filter((currentSymptom) => currentSymptom.id !== symptom.id)
    );
    setEditingSymptom((current) => (current?.id === symptom.id ? null : current));
    setStats((current) => ({
      ...current,
      symptoms: current.symptoms === null ? current.symptoms : Math.max(current.symptoms - 1, 0),
    }));
    setAdminActionMessage({
      type: "success",
      text: "Симптомът беше изтрит успешно.",
    });
  }

  async function handleCategoryDelete(category: AdminCategory) {
    if (!supabase || !window.confirm("Сигурни ли сте, че искате да изтриете тази категория?")) {
      return;
    }

    setAdminActionMessage(null);

    const { error } = await supabase.from("categories").delete().eq("id", category.id);

    if (error) {
      setAdminActionMessage({
        type: "error",
        text: "Възникна проблем при изтриване на категорията.",
      });
      return;
    }

    setCategories((current) =>
      current.filter((currentCategory) => currentCategory.id !== category.id)
    );
    setEditingCategory((current) => (current?.id === category.id ? null : current));
    setStats((current) => ({
      ...current,
      categories:
        current.categories === null ? current.categories : Math.max(current.categories - 1, 0),
    }));
    setAdminActionMessage({
      type: "success",
      text: "Категорията беше изтрита успешно.",
    });
  }

  return (
    <section className="mt-8">
      <div className="rounded-3xl border border-yellow-300/40 bg-yellow-300/10 p-5 text-yellow-50 sm:p-6">
        <h2 className="text-xl font-bold text-yellow-100">Подготвителен панел</h2>
        <p className="mt-3 leading-7">
          Този панел е подготвен за бъдещо управление на съдържание. Засега не променя данни.
        </p>
      </div>

      {adminActionMessage ? (
        <div
          className={
            adminActionMessage.type === "success"
              ? "mt-5 rounded-3xl border border-emerald-300/40 bg-emerald-900/70 p-5 text-emerald-50"
              : "mt-5 rounded-3xl border border-red-300/40 bg-red-950/70 p-5 text-red-50"
          }
        >
          {adminActionMessage.text}
        </div>
      ) : null}

      <section className="mt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
          Статистика
        </p>
        <h2 className="mt-2 text-2xl font-bold text-yellow-200">Общ преглед</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map((card) => (
            <article
              key={card.key}
              className="rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                {card.label}
              </p>
              <p className="mt-3 text-4xl font-bold text-yellow-200">
                {stats[card.key] ?? "—"}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Бърз преглед
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">Admin статус</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-emerald-100">
            Компактен статус на основното съдържание, изчислен от вече заредените данни.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Билки", value: herbs.length },
            { label: "Симптоми", value: symptoms.length },
            { label: "Категории", value: categories.length },
            { label: "Непълни билки", value: incompleteHerbsCount },
            { label: "Билки без връзки", value: herbsWithoutRelationsCount },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-emerald-800 bg-emerald-950/50 p-4"
            >
              <p className="text-sm font-semibold text-emerald-200">{item.label}:</p>
              <p className="mt-2 text-3xl font-bold text-yellow-200">{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-yellow-300/30 bg-yellow-300/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-yellow-200">
              Контрол на съдържанието
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-100">Проблемни билки</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-yellow-50">
            Кратък списък с билки, които имат нужда от преглед преди публикуване или
            обновяване.
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-emerald-800 bg-emerald-950/60 p-4">
            <h3 className="text-lg font-bold text-yellow-200">Непълно съдържание</h3>
            <div className="mt-4 space-y-3">
              {incompleteContentHerbs.length === 0 ? (
                <p className="text-emerald-100">Няма открити проблеми.</p>
              ) : (
                incompleteContentHerbs.map((herb) => (
                  <div
                    key={herb.id}
                    className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-3"
                  >
                    <p className="font-semibold text-yellow-100">{herb.name}</p>
                    <p className="mt-1 text-sm text-emerald-200">Slug: {herb.slug}</p>
                    <p className="mt-2 text-sm font-semibold text-yellow-200">
                      Липсва съдържание
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-emerald-800 bg-emerald-950/60 p-4">
            <h3 className="text-lg font-bold text-yellow-200">Без връзки</h3>
            <div className="mt-4 space-y-3">
              {herbsWithoutAnyRelations.length === 0 ? (
                <p className="text-emerald-100">Няма открити проблеми.</p>
              ) : (
                herbsWithoutAnyRelations.map((herb) => (
                  <div
                    key={herb.id}
                    className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-3"
                  >
                    <p className="font-semibold text-yellow-100">{herb.name}</p>
                    <p className="mt-1 text-sm text-emerald-200">Slug: {herb.slug}</p>
                    <p className="mt-2 text-sm font-semibold text-yellow-200">
                      Липсват симптоми и категории
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-red-300/30 bg-red-950/40 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">
              Безопасност на текста
            </p>
            <h2 className="mt-2 text-2xl font-bold text-red-100">
              Проверка за рискови твърдения
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-red-50">
            Тази проверка е помощна. Винаги преглеждайте съдържанието ръчно преди
            публикуване.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-red-300/30 bg-red-950/50 p-4">
            <p className="text-sm font-semibold text-red-100">
              Открити потенциално рискови билки:
            </p>
            <p className="mt-2 text-3xl font-bold text-yellow-200">{riskyHerbs.length}</p>
          </article>
          <article className="rounded-2xl border border-red-300/30 bg-red-950/50 p-4">
            <p className="text-sm font-semibold text-red-100">
              Открити потенциално рискови рецепти:
            </p>
            <p className="mt-2 text-3xl font-bold text-yellow-200">{riskyRecipes.length}</p>
          </article>
        </div>

        {riskyHerbs.length === 0 && riskyRecipes.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-emerald-300/30 bg-emerald-950/60 p-4 text-emerald-50">
            Не са открити рискови формулировки.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-red-300/30 bg-red-950/50 p-4">
              <h3 className="text-lg font-bold text-red-100">Билки за преглед</h3>
              <div className="mt-4 space-y-3">
                {riskyHerbs.slice(0, 10).map(({ herb, matchedPhrase }) => (
                  <div
                    key={herb.id}
                    className="rounded-2xl border border-red-300/20 bg-red-900/30 p-3"
                  >
                    <p className="font-semibold text-red-50">{herb.name}</p>
                    <p className="mt-1 text-sm text-yellow-100">
                      Съвпадение: {matchedPhrase}
                    </p>
                    <p className="mt-2 text-sm text-red-50">
                      Прегледайте текста и използвайте по-внимателна формулировка.
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-red-300/30 bg-red-950/50 p-4">
              <h3 className="text-lg font-bold text-red-100">Рецепти за преглед</h3>
              <div className="mt-4 space-y-3">
                {riskyRecipes.slice(0, 10).map(({ recipe, matchedPhrase }) => (
                  <div
                    key={recipe.id}
                    className="rounded-2xl border border-red-300/20 bg-red-900/30 p-3"
                  >
                    <p className="font-semibold text-red-50">
                      {recipe.title ?? "Рецепта без заглавие"}
                    </p>
                    <p className="mt-1 text-sm text-emerald-100">
                      Билка: {herbNameById.get(recipe.herb_id) ?? "Непозната билка"}
                    </p>
                    <p className="mt-1 text-sm text-yellow-100">
                      Съвпадение: {matchedPhrase}
                    </p>
                    <p className="mt-2 text-sm text-red-50">
                      Прегледайте текста и използвайте по-внимателна формулировка.
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {adminCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-yellow-300 sm:p-6"
          >
            <article>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Бъдещо управление
              </p>
              <h2 className="mt-3 text-2xl font-bold text-yellow-200">{card.title}</h2>
              <p className="mt-4 leading-7 text-emerald-50">{card.description}</p>
              <p className="mt-5 text-sm font-semibold text-yellow-300 transition group-hover:text-yellow-100">
                Отвори секцията
              </p>
            </article>
          </Link>
        ))}
      </div>

      <section className="mt-10 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Готовност
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">MVP проверка</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-emerald-200">
            Използвайте този списък преди всяко по-голямо качване или промяна.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {mvpChecklistItems.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-emerald-800 bg-emerald-950/50 p-4"
            >
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-green-950">
                ✓
              </span>
              <span className="leading-6 text-emerald-50">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-yellow-300/30 bg-yellow-300/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-yellow-200">
              Преди пускане
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-100">
              Последни проверки преди пускане
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-yellow-50">
            Минете през този списък преди да приемете версията като стабилен MVP.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {launchChecklistItems.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-yellow-300/20 bg-emerald-950/50 p-4"
            >
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-green-950">
                ✓
              </span>
              <span className="leading-6 text-yellow-50">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Безопасност на съдържанието
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">
              Проверка на съдържанието
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-emerald-200">
            Използвайте този списък при добавяне или редактиране на билки, за да поддържате
            Herbal Care безопасен и полезен.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-yellow-300/40 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-50">
          Не добавяйте твърдения за гарантирано лечение, диагнози или заместване на лекарска
          консултация.
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {contentQualityChecklistItems.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-emerald-800 bg-emerald-950/50 p-4"
            >
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-300 text-sm font-black text-green-950">
                ✓
              </span>
              <span className="leading-6 text-emerald-50">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Съдържание
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">Добавяне на нова билка</h2>
          </div>
          <p className="text-sm text-emerald-200">
            Задължителни полета: slug, име и кратко описание.
          </p>
        </div>

        <AdminHerbForm onCreated={handleHerbCreated} />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Съдържание
            </p>
            <h2 className="text-2xl font-bold text-yellow-200">Добавяне на симптом</h2>
            <p className="text-sm text-emerald-200">
              Задължителни полета: slug и име. Описанието е по избор.
            </p>
          </div>

          <AdminSymptomForm onCreated={handleSymptomCreated} />
        </div>

        <div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Съдържание
            </p>
            <h2 className="text-2xl font-bold text-yellow-200">Добавяне на категория</h2>
            <p className="text-sm text-emerald-200">
              Задължителни полета: slug и име. Описанието е по избор.
            </p>
          </div>

          <AdminCategoryForm onCreated={handleCategoryCreated} />
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Връзки
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">
              Свързване на билка със симптоми и категории
            </h2>
          </div>
          <p className="text-sm text-emerald-200">
            Изберете една билка и свързани симптоми или категории.
          </p>
        </div>

        <AdminHerbRelationsForm onSaved={handleHerbRelationsSaved} />
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Рецепти
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">
              Рецепти и начини на приготвяне
            </h2>
          </div>
          <p className="text-sm text-emerald-200">
            Добавяйте образователни описания без твърдения за лечение.
          </p>
        </div>

        <form
          onSubmit={handleRecipeCreate}
          className="mt-5 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-emerald-100">Билка *</span>
              <select
                required
                value={recipeFormValues.herb_id}
                onChange={(event) => updateRecipeFormValue("herb_id", event.target.value)}
                className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
              >
                <option value="">Изберете билка</option>
                {herbs.map((herb) => (
                  <option key={herb.id} value={herb.id}>
                    {herb.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-emerald-100">Заглавие *</span>
              <input
                required
                type="text"
                value={recipeFormValues.title}
                onChange={(event) => updateRecipeFormValue("title", event.target.value)}
                className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition placeholder:text-emerald-300/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-emerald-100">Тип приготвяне</span>
              <input
                type="text"
                value={recipeFormValues.preparation_type}
                onChange={(event) =>
                  updateRecipeFormValue("preparation_type", event.target.value)
                }
                className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition placeholder:text-emerald-300/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              { name: "ingredients", label: "Съставки" },
              { name: "instructions", label: "Инструкции" },
              { name: "dosage_note", label: "Бележка за употреба" },
              { name: "safety_note", label: "Бележка за безопасност" },
            ].map((field) => (
              <label key={field.name} className="block">
                <span className="text-sm font-semibold text-emerald-100">{field.label}</span>
                <textarea
                  value={recipeFormValues[field.name as keyof RecipeFormValues]}
                  onChange={(event) =>
                    updateRecipeFormValue(
                      field.name as keyof RecipeFormValues,
                      event.target.value
                    )
                  }
                  rows={4}
                  className="mt-2 w-full resize-y rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition placeholder:text-emerald-300/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
                />
              </label>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-50">
            Използвайте внимателен език. Рецептите са образователни и не трябва да
            обещават лечение или да заменят лекарска консултация.
          </div>

          <button
            type="submit"
            disabled={isRecipeSubmitting}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-yellow-300 px-5 py-3 text-center font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isRecipeSubmitting ? "Добавяне..." : "Добави рецепта"}
          </button>
        </form>

        <div className="mt-5 rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6">
          <label className="block">
            <span className="text-sm font-semibold text-emerald-100">Търсене в рецепти</span>
            <input
              type="search"
              value={recipeSearch}
              onChange={(event) => setRecipeSearch(event.target.value)}
              placeholder="Търси рецепта..."
              className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition placeholder:text-emerald-300/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
            />
          </label>
          <p className="mt-3 text-sm font-semibold text-emerald-100">
            Показани рецепти: {filteredHerbRecipes.length}
          </p>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl bg-white/10 shadow-xl ring-1 ring-white/10">
          <div className="hidden grid-cols-[1.2fr_1.4fr_1fr_auto] gap-4 border-b border-emerald-800/70 bg-emerald-950/70 px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300 md:grid">
            <span>Билка</span>
            <span>Заглавие</span>
            <span>Тип</span>
            <span className="text-right">Действия</span>
          </div>

          <div className="divide-y divide-emerald-800/70">
            {herbRecipes.length === 0 ? (
              <div className="p-5 text-emerald-100 sm:p-6">
                Все още няма добавени рецепти.
              </div>
            ) : filteredHerbRecipes.length === 0 ? (
              <div className="p-5 text-emerald-100 sm:p-6">
                Няма рецепти за избраното търсене.
              </div>
            ) : (
              filteredHerbRecipes.map((recipe) => (
                <article
                  key={recipe.id}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[1.2fr_1.4fr_1fr_auto] md:items-center md:gap-4"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Билка
                    </p>
                    <p className="font-semibold text-emerald-50">
                      {herbNameById.get(recipe.herb_id) ?? "Непозната билка"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Заглавие
                    </p>
                    <p className="font-bold text-yellow-200">
                      {recipe.title ?? "Рецепта без заглавие"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Тип
                    </p>
                    <p className="text-emerald-100">
                      {recipe.preparation_type ?? "Не е посочен"}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                    <button
                      type="button"
                      onClick={() => handleRecipeEditStart(recipe)}
                      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-yellow-300/60 bg-yellow-300/10 px-4 py-2 text-sm font-bold text-yellow-100 transition hover:bg-yellow-300 hover:text-green-950"
                    >
                      Редактирай
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleRecipeDelete(recipe)}
                      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-red-300/50 bg-red-950/70 px-4 py-2 text-sm font-bold text-red-50 transition hover:border-red-200 hover:bg-red-900/80"
                    >
                      Изтрий
                    </button>
                  </div>
                  {editingRecipe?.id === recipe.id ? (
                    <form
                      onSubmit={handleRecipeUpdate}
                      className="rounded-2xl border border-yellow-300/30 bg-emerald-950/80 p-4 md:col-span-4"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                          <span className="text-sm font-semibold text-emerald-100">
                            Заглавие
                          </span>
                          <input
                            required
                            type="text"
                            value={recipeEditValues.title}
                            onChange={(event) =>
                              updateRecipeEditValue("title", event.target.value)
                            }
                            className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-emerald-100">
                            Тип приготвяне
                          </span>
                          <input
                            type="text"
                            value={recipeEditValues.preparation_type}
                            onChange={(event) =>
                              updateRecipeEditValue("preparation_type", event.target.value)
                            }
                            className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
                          />
                        </label>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {[
                          { name: "ingredients", label: "Съставки" },
                          { name: "instructions", label: "Инструкции" },
                          { name: "dosage_note", label: "Бележка за употреба" },
                          { name: "safety_note", label: "Бележка за безопасност" },
                        ].map((field) => (
                          <label key={field.name} className="block">
                            <span className="text-sm font-semibold text-emerald-100">
                              {field.label}
                            </span>
                            <textarea
                              value={recipeEditValues[field.name as keyof RecipeFormValues]}
                              onChange={(event) =>
                                updateRecipeEditValue(
                                  field.name as keyof RecipeFormValues,
                                  event.target.value
                                )
                              }
                              rows={4}
                              className="mt-2 w-full resize-y rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
                            />
                          </label>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="submit"
                          disabled={isRecipeUpdating}
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-yellow-300 px-4 py-2 text-sm font-bold text-green-950 transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isRecipeUpdating ? "Запазване..." : "Запази"}
                        </button>
                        <button
                          type="button"
                          onClick={handleRecipeEditCancel}
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-emerald-700 bg-emerald-900/60 px-4 py-2 text-sm font-bold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
                        >
                          Откажи
                        </button>
                      </div>
                    </form>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Достъп
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">Потребители</h2>
          </div>
          <p className="text-sm text-emerald-200">Показват се последните 50 профила.</p>
        </div>

        {profiles.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Все още няма профили.
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-3xl bg-white/10 shadow-xl ring-1 ring-white/10">
            <div className="hidden grid-cols-[2fr_1fr_1fr] gap-4 border-b border-emerald-800/70 bg-emerald-950/70 px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300 md:grid">
              <span>Имейл</span>
              <span>Роля</span>
              <span>Създаден</span>
            </div>

            <div className="divide-y divide-emerald-800/70">
              {profiles.map((profile, index) => (
                <article
                  key={`${profile.email ?? "profile"}-${profile.created_at ?? index}`}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[2fr_1fr_1fr] md:items-center md:gap-4"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Имейл
                    </p>
                    <p className="break-words text-emerald-50">
                      {profile.email || "Няма имейл"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Роля
                    </p>
                    {profile.is_admin ? (
                      <span className="inline-flex rounded-full border border-yellow-200/50 bg-yellow-300/20 px-3 py-1 text-sm font-bold text-yellow-100">
                        Админ
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-emerald-700 bg-emerald-900/70 px-3 py-1 text-sm font-bold text-emerald-50">
                        Потребител
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                      Създаден
                    </p>
                    <p className="text-emerald-100">
                      {profile.created_at
                        ? new Date(profile.created_at).toLocaleString("bg-BG")
                        : "Няма дата"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Съдържание
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">Билки в базата</h2>
          </div>
          <p className="text-sm text-emerald-200">Подредени по име.</p>
        </div>

        {herbs.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Все още няма добавени билки.
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-3xl border border-emerald-300/30 bg-emerald-900/50 p-5 text-emerald-50">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200">
                  Пълни билки
                </p>
                <p className="mt-2 text-3xl font-bold text-yellow-200">{completeHerbsCount}</p>
              </div>
              <div className="rounded-3xl border border-yellow-300/30 bg-yellow-300/10 p-5 text-yellow-50">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-yellow-100">
                  Непълни билки
                </p>
                <p className="mt-2 text-3xl font-bold text-yellow-200">{incompleteHerbsCount}</p>
              </div>
              <div className="rounded-3xl border border-emerald-300/30 bg-emerald-900/50 p-5 text-emerald-50">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200">
                  Билки със симптоми
                </p>
                <p className="mt-2 text-3xl font-bold text-yellow-200">
                  {herbsWithSymptomsCount}
                </p>
              </div>
              <div className="rounded-3xl border border-emerald-300/30 bg-emerald-900/50 p-5 text-emerald-50">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200">
                  Билки с категории
                </p>
                <p className="mt-2 text-3xl font-bold text-yellow-200">
                  {herbsWithCategoriesCount}
                </p>
              </div>
              <div className="rounded-3xl border border-red-300/30 bg-red-950/40 p-5 text-red-50">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-100">
                  Билки без връзки
                </p>
                <p className="mt-2 text-3xl font-bold text-yellow-200">
                  {herbsWithoutRelationsCount}
                </p>
              </div>
            </div>

            {editingHerb ? (
              <AdminHerbEditForm
                herb={editingHerb}
                onCancel={() => setEditingHerb(null)}
                onUpdated={handleHerbUpdated}
              />
            ) : null}

            <div className="mt-5 rounded-3xl border border-emerald-800 bg-emerald-950/50 p-4">
              <div className="flex flex-wrap gap-2">
                {herbOverviewFilters.map((filter) => {
                  const isActive = herbOverviewFilter === filter.key;

                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setHerbOverviewFilter(filter.key)}
                      className={
                        isActive
                          ? "min-h-11 rounded-2xl bg-yellow-300 px-4 py-2 text-sm font-bold text-green-950 shadow-lg"
                          : "min-h-11 rounded-2xl border border-emerald-700 bg-emerald-900/70 px-4 py-2 text-sm font-bold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
                      }
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-sm font-semibold text-emerald-100">
                Показани билки: {filteredHerbs.length}
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-3xl bg-white/10 shadow-xl ring-1 ring-white/10">
              <div className="hidden grid-cols-[0.8fr_1fr_1fr_1fr_1.4fr_1.4fr_auto] gap-4 border-b border-emerald-800/70 bg-emerald-950/70 px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300 md:grid">
                <span>Снимка</span>
                <span>Име</span>
                <span>Латинско име</span>
                <span>Slug</span>
                <span>Съдържание</span>
                <span>Връзки</span>
                <span className="text-right">Действия</span>
              </div>

              <div className="divide-y divide-emerald-800/70">
                {filteredHerbs.length === 0 ? (
                  <div className="p-5 text-emerald-100 sm:p-6">
                    Няма билки за избрания филтър.
                  </div>
                ) : (
                  filteredHerbs.map((herb) => {
                  const missingFields = getMissingHerbContentFields(herb);
                  const hasCompleteContent = missingFields.length === 0;
                  const hasSymptoms = herbIdsWithSymptoms.has(herb.id);
                  const hasCategories = herbIdsWithCategories.has(herb.id);
                  const relationStatus = hasSymptoms
                    ? hasCategories
                      ? "✅ Свързана със симптоми и категории"
                      : "⚠️ Липсват свързани категории"
                    : hasCategories
                      ? "⚠️ Липсват свързани симптоми"
                      : "⚠️ Липсват симптоми и категории";

                    return (
                      <article
                        key={herb.id}
                        className="grid gap-3 px-5 py-4 md:grid-cols-[0.8fr_1fr_1fr_1fr_1.4fr_1.4fr_auto] md:items-start md:gap-4"
                      >
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                            Снимка
                          </p>
                          {herb.image_url ? (
                            <img
                              src={herb.image_url}
                              alt={herb.image_alt || "Снимка на билка"}
                              className="mt-2 h-16 w-24 rounded-2xl object-cover ring-1 ring-white/10 md:mt-0 md:h-14 md:w-20"
                            />
                          ) : (
                            <span className="mt-2 inline-flex min-h-10 items-center rounded-2xl border border-emerald-700 bg-emerald-950/70 px-3 py-2 text-sm font-semibold text-emerald-100 md:mt-0">
                              Без снимка
                            </span>
                          )}
                          {herb.image_credit ? (
                            <p className="mt-2 text-xs leading-5 text-emerald-200">
                              Кредит: {herb.image_credit}
                            </p>
                          ) : null}
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                            Име
                          </p>
                          <p className="font-bold text-yellow-200">{herb.name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                            Латинско име
                          </p>
                          <p className="break-words italic text-emerald-100">
                            {herb.latin || "Не е посочено"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                            Slug
                          </p>
                          <p className="break-words font-mono text-sm text-emerald-50">{herb.slug}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                            Съдържание
                          </p>
                          {hasCompleteContent ? (
                            <p className="font-bold text-emerald-200">✅ Пълно съдържание</p>
                          ) : (
                            <div>
                              <p className="font-bold text-yellow-100">⚠️ Непълно съдържание</p>
                              <p className="mt-2 text-sm leading-6 text-emerald-100">
                                Липсва: {missingFields.join(", ")}
                              </p>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                            Връзки
                          </p>
                          <p
                            className={
                              hasSymptoms && hasCategories
                                ? "font-bold text-emerald-200"
                                : "font-bold leading-6 text-yellow-100"
                            }
                          >
                            {relationStatus}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
                          <Link
                            href={`/herbs/${herb.slug}`}
                            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-emerald-700 bg-emerald-900/70 px-4 py-2 text-sm font-bold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
                          >
                            Виж
                          </Link>
                          <button
                            type="button"
                            onClick={() => setEditingHerb(herb)}
                            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-yellow-300 px-4 py-2 text-sm font-bold text-green-950 shadow-lg transition hover:bg-yellow-200"
                          >
                            Редактирай
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleHerbDelete(herb)}
                            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-red-300/50 bg-red-950/70 px-4 py-2 text-sm font-bold text-red-50 transition hover:border-red-200 hover:bg-red-900/80"
                          >
                            Изтрий
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Безопасност
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">AI история и сигнали</h2>
          </div>
          <p className="text-sm text-emerald-200">Показват се последните 20 AI записа.</p>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-3xl border border-emerald-800/70 bg-emerald-950/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-yellow-200">Спешни сигнали: {emergencyAiCount}</p>
          <button
            type="button"
            onClick={() => setShowOnlyEmergencyAi((current) => !current)}
            className={
              showOnlyEmergencyAi
                ? "min-h-11 rounded-2xl border border-yellow-200 bg-yellow-300 px-4 py-2 text-sm font-bold text-green-950 shadow-lg"
                : "min-h-11 rounded-2xl border border-emerald-700 bg-emerald-900/70 px-4 py-2 text-sm font-bold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
            }
          >
            {showOnlyEmergencyAi ? "Покажи всички AI записи" : "Покажи само спешни сигнали"}
          </button>
        </div>

        {aiHistoryEntries.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Все още няма AI история.
          </div>
        ) : visibleAiHistoryEntries.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Няма спешни сигнали в последните AI записи.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {visibleAiHistoryEntries.map((entry) => (
              <article
                key={entry.id}
                className={
                  entry.is_emergency
                    ? "rounded-3xl border border-red-300/50 bg-red-950/50 p-5 shadow-xl shadow-black/20 sm:p-6"
                    : "rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6"
                }
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                      Въпрос
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-yellow-200">{entry.question}</h3>
                    <p className="mt-2 text-sm text-emerald-200">
                      {entry.created_at
                        ? new Date(entry.created_at).toLocaleString("bg-BG")
                        : "Няма дата"}
                    </p>
                  </div>

                  <span
                    className={
                      entry.is_emergency
                        ? "rounded-full border border-red-200/40 bg-red-900/70 px-3 py-2 text-sm font-bold text-red-50"
                        : "rounded-full border border-emerald-700 bg-emerald-900/70 px-3 py-2 text-sm font-bold text-emerald-50"
                    }
                  >
                    {entry.is_emergency ? "Спешен сигнал" : "Образователен отговор"}
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-800 bg-emerald-950/60 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                    Преглед на отговора
                  </p>
                  <p className="mt-3 leading-7 text-emerald-50">{getAnswerPreview(entry.answer)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Съдържание
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">Симптоми в базата</h2>
          </div>
          <p className="text-sm text-emerald-200">Подредени по име.</p>
        </div>

        {symptoms.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Все още няма добавени симптоми.
          </div>
        ) : (
          <>
            {editingSymptom ? (
              <AdminSymptomEditForm
                symptom={editingSymptom}
                onCancel={() => setEditingSymptom(null)}
                onUpdated={handleSymptomUpdated}
              />
            ) : null}

            <div className="mt-5 rounded-3xl border border-emerald-800 bg-emerald-950/50 p-4">
              <input
                type="search"
                value={symptomSearch}
                onChange={(event) => setSymptomSearch(event.target.value)}
                placeholder="Търси симптом..."
                className="min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition placeholder:text-emerald-300/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
              />
              <p className="mt-3 text-sm font-semibold text-emerald-100">
                Показани симптоми: {filteredSymptoms.length}
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-3xl bg-white/10 shadow-xl ring-1 ring-white/10">
              <div className="hidden grid-cols-[1fr_1fr_2fr_auto] gap-4 border-b border-emerald-800/70 bg-emerald-950/70 px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300 md:grid">
                <span>Име</span>
                <span>Slug</span>
                <span>Описание</span>
                <span className="text-right">Действия</span>
              </div>

              <div className="divide-y divide-emerald-800/70">
                {filteredSymptoms.length === 0 ? (
                  <div className="p-5 text-emerald-100 sm:p-6">
                    Няма симптоми за избраното търсене.
                  </div>
                ) : (
                  filteredSymptoms.map((symptom) => (
                    <article
                      key={symptom.id}
                      className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_2fr_auto] md:items-start md:gap-4"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                          Име
                        </p>
                        <p className="font-bold text-yellow-200">{symptom.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                          Slug
                        </p>
                        <p className="break-words font-mono text-sm text-emerald-50">{symptom.slug}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                          Описание
                        </p>
                        <p className="leading-7 text-emerald-100">
                          {symptom.description || "Няма добавено описание."}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingSymptom(symptom)}
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-yellow-300 px-4 py-2 text-sm font-bold text-green-950 shadow-lg transition hover:bg-yellow-200"
                        >
                          Редактирай
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleSymptomDelete(symptom)}
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-red-300/50 bg-red-950/70 px-4 py-2 text-sm font-bold text-red-50 transition hover:border-red-200 hover:bg-red-900/80"
                        >
                          Изтрий
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Съдържание
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">Категории в базата</h2>
          </div>
          <p className="text-sm text-emerald-200">Подредени по име.</p>
        </div>

        {categories.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Все още няма добавени категории.
          </div>
        ) : (
          <>
            {editingCategory ? (
              <AdminCategoryEditForm
                category={editingCategory}
                onCancel={() => setEditingCategory(null)}
                onUpdated={handleCategoryUpdated}
              />
            ) : null}

            <div className="mt-5 rounded-3xl border border-emerald-800 bg-emerald-950/50 p-4">
              <input
                type="search"
                value={categorySearch}
                onChange={(event) => setCategorySearch(event.target.value)}
                placeholder="Търси категория..."
                className="min-h-12 w-full rounded-2xl border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-emerald-50 outline-none transition placeholder:text-emerald-300/70 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/30"
              />
              <p className="mt-3 text-sm font-semibold text-emerald-100">
                Показани категории: {filteredCategories.length}
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-3xl bg-white/10 shadow-xl ring-1 ring-white/10">
              <div className="hidden grid-cols-[1fr_1fr_2fr_auto] gap-4 border-b border-emerald-800/70 bg-emerald-950/70 px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300 md:grid">
                <span>Име</span>
                <span>Slug</span>
                <span>Описание</span>
                <span className="text-right">Действия</span>
              </div>

              <div className="divide-y divide-emerald-800/70">
                {filteredCategories.length === 0 ? (
                  <div className="p-5 text-emerald-100 sm:p-6">
                    Няма категории за избраното търсене.
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <article
                      key={category.id}
                      className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_2fr_auto] md:items-start md:gap-4"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                          Име
                        </p>
                        <p className="font-bold text-yellow-200">{category.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                          Slug
                        </p>
                        <p className="break-words font-mono text-sm text-emerald-50">{category.slug}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 md:hidden">
                          Описание
                        </p>
                        <p className="leading-7 text-emerald-100">
                          {category.description || "Няма добавено описание."}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
                        <Link
                          href={`/categories/${category.slug}`}
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-emerald-700 bg-emerald-900/70 px-4 py-2 text-sm font-bold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100"
                        >
                          Виж
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEditingCategory(category)}
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-yellow-300 px-4 py-2 text-sm font-bold text-green-950 shadow-lg transition hover:bg-yellow-200"
                        >
                          Редактирай
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleCategoryDelete(category)}
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-red-300/50 bg-red-950/70 px-4 py-2 text-sm font-bold text-red-50 transition hover:border-red-200 hover:bg-red-900/80"
                        >
                          Изтрий
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Последни съобщения
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-200">Обратна връзка</h2>
          </div>
          <p className="text-sm text-emerald-200">Показват се последните 20 съобщения.</p>
        </div>

        {feedbackMessages.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white/10 p-5 text-emerald-100 ring-1 ring-white/10 sm:p-6">
            Все още няма получени съобщения.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {feedbackMessages.map((feedback) => (
              <article
                key={feedback.id}
                className="rounded-3xl bg-white/10 p-5 shadow-xl ring-1 ring-white/10 sm:p-6"
              >
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                      Име
                    </p>
                    <p className="mt-1 break-words text-emerald-50">
                      {feedback.name || "Не е посочено"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                      Имейл
                    </p>
                    <p className="mt-1 break-words text-emerald-50">
                      {feedback.email || "Не е посочен"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                      Получено
                    </p>
                    <p className="mt-1 text-emerald-50">
                      {feedback.created_at
                        ? new Date(feedback.created_at).toLocaleString("bg-BG")
                        : "Няма дата"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-800 bg-emerald-950/60 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                    Съобщение
                  </p>
                  <p className="mt-3 whitespace-pre-wrap leading-7 text-emerald-50">
                    {feedback.message}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
