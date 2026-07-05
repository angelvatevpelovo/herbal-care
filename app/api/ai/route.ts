import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const emergencyKeywords = [
  "задух",
  "болка в гърдите",
  "припадък",
  "алергична реакция",
  "самонараняване",
  "кръв",
  "висока температура",
];

type Herb = {
  id: string;
  slug: string;
  name: string;
  latin: string | null;
  short_description: string | null;
  description: string | null;
  traditional_uses: string | null;
  preparation: string | null;
  precautions: string | null;
  interactions: string | null;
  when_to_see_doctor: string | null;
};

type Symptom = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

type HerbSymptom = {
  herb_id: string;
  symptom_id: string;
};

type HerbCategory = {
  herb_id: string;
  category_id: string;
};

type HerbRecipe = {
  id: string;
  herb_id: string;
  title: string | null;
  preparation_type: string | null;
  ingredients: string | null;
  instructions: string | null;
  dosage_note: string | null;
  safety_note: string | null;
};

type RelatedLink = {
  label: string;
  href: string;
};

type AiResponsePayload = {
  answer: string;
  isEmergency: boolean;
  relatedLinks: RelatedLink[];
};

function normalizeText(text: string) {
  return text.toLocaleLowerCase("bg-BG").trim();
}

function hasEmergencyKeyword(message: string) {
  const normalized = normalizeText(message);
  return emergencyKeywords.some((keyword) => normalized.includes(keyword));
}

function getMessage(body: unknown) {
  return typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
    ? body.message
    : "";
}

function uniqueLinks(links: RelatedLink[]) {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) {
      return false;
    }

    seen.add(link.href);
    return true;
  });
}

const stopWords = new Set([
  "какво",
  "как",
  "може",
  "мога",
  "при",
  "за",
  "със",
  "след",
  "преди",
  "има",
  "имам",
  "въпрос",
  "билка",
  "билки",
  "симптом",
  "симптоми",
  "здраве",
  "общ",
  "общо",
  "дали",
  "кои",
  "кое",
  "какви",
  "да",
  "ли",
  "се",
  "ме",
  "ми",
  "на",
  "от",
  "или",
  "ако",
]);

function getSearchTerms(message: string) {
  return normalizeText(message)
    .split(/[\s,.;:!?()[\]{}"']+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 3 && !stopWords.has(term));
}

function searchableText(fields: Array<string | null | undefined>) {
  return normalizeText(fields.filter(Boolean).join(" "));
}

function matchesSearch(fields: Array<string | null | undefined>, message: string, terms: string[]) {
  const normalizedMessage = normalizeText(message);
  const haystack = searchableText(fields);

  if (!haystack) {
    return false;
  }

  const exactFieldMatch = fields.some((field) => {
    if (!field) {
      return false;
    }

    const normalizedField = normalizeText(field);
    return normalizedMessage.includes(normalizedField) || normalizedField.includes(normalizedMessage);
  });

  return exactFieldMatch || terms.some((term) => haystack.includes(term));
}

function shortenText(text: string | null | undefined, fallback: string) {
  const value = text?.trim() || fallback;
  return value.length > 180 ? `${value.slice(0, 177).trim()}...` : value;
}

async function fetchSupabaseContext() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const [
    { data: herbs, error: herbsError },
    { data: symptoms, error: symptomsError },
    { data: categories, error: categoriesError },
    { data: herbSymptoms, error: herbSymptomsError },
    { data: herbCategories, error: herbCategoriesError },
    { data: herbRecipes },
  ] = await Promise.all([
    supabase
      .from("herbs")
      .select(
        "id, slug, name, latin, short_description, description, traditional_uses, preparation, precautions, interactions, when_to_see_doctor",
      ),
    supabase.from("symptoms").select("id, slug, name, description"),
    supabase.from("categories").select("id, slug, name, description"),
    supabase.from("herb_symptoms").select("herb_id, symptom_id"),
    supabase.from("herb_categories").select("herb_id, category_id"),
    supabase
      .from("herb_recipes")
      .select("id, herb_id, title, preparation_type, ingredients, instructions, dosage_note, safety_note"),
  ]);

  if (herbsError) {
    throw new Error(herbsError.message);
  }

  if (symptomsError) {
    throw new Error(symptomsError.message);
  }

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  if (herbSymptomsError) {
    throw new Error(herbSymptomsError.message);
  }

  if (herbCategoriesError) {
    throw new Error(herbCategoriesError.message);
  }

  return {
    herbs: (herbs ?? []) as Herb[],
    symptoms: (symptoms ?? []) as Symptom[],
    categories: (categories ?? []) as Category[],
    herbSymptoms: (herbSymptoms ?? []) as HerbSymptom[],
    herbCategories: (herbCategories ?? []) as HerbCategory[],
    herbRecipes: (herbRecipes ?? []) as HerbRecipe[],
  };
}

function findMatches(
  message: string,
  herbs: Herb[],
  symptoms: Symptom[],
  categories: Category[],
  herbSymptoms: HerbSymptom[],
  herbCategories: HerbCategory[],
  herbRecipes: HerbRecipe[],
) {
  const terms = getSearchTerms(message);
  const matchedHerbs = herbs.filter((herb) =>
    matchesSearch(
      [
        herb.name,
        herb.slug,
        herb.short_description,
        herb.description,
        herb.traditional_uses,
        herb.preparation,
        herb.precautions,
        herb.interactions,
        herb.when_to_see_doctor,
      ],
      message,
      terms,
    ),
  );

  const matchedSymptoms = symptoms.filter((symptom) =>
    matchesSearch([symptom.name, symptom.slug, symptom.description], message, terms),
  );
  const matchedCategories = categories.filter((category) =>
    matchesSearch([category.name, category.slug, category.description], message, terms),
  );
  const matchedRecipes = herbRecipes.filter((recipe) =>
    matchesSearch(
      [recipe.title, recipe.preparation_type, recipe.ingredients, recipe.instructions, recipe.dosage_note, recipe.safety_note],
      message,
      terms,
    ),
  );

  const relatedHerbIds = new Set(matchedHerbs.map((herb) => herb.id));
  const matchedSymptomIds = new Set(matchedSymptoms.map((symptom) => symptom.id));
  const matchedCategoryIds = new Set(matchedCategories.map((category) => category.id));

  herbSymptoms
    .filter((connection) => matchedSymptomIds.has(connection.symptom_id))
    .forEach((connection) => relatedHerbIds.add(connection.herb_id));

  herbCategories
    .filter((connection) => matchedCategoryIds.has(connection.category_id))
    .forEach((connection) => relatedHerbIds.add(connection.herb_id));

  matchedRecipes.forEach((recipe) => relatedHerbIds.add(recipe.herb_id));

  const suggestedHerbs = herbs.filter((herb) => relatedHerbIds.has(herb.id)).slice(0, 6);
  const recipeHerbIds = new Set(herbRecipes.map((recipe) => recipe.herb_id));

  return {
    matchedHerbs,
    matchedSymptoms,
    matchedCategories,
    matchedRecipes,
    suggestedHerbs,
    recipeHerbIds,
  };
}

function buildAnswer(matches: ReturnType<typeof findMatches>) {
  const hasAnyMatch =
    matches.matchedHerbs.length > 0 ||
    matches.matchedSymptoms.length > 0 ||
    matches.matchedCategories.length > 0 ||
    matches.matchedRecipes.length > 0;

  if (!hasAnyMatch) {
    return "Не открих точни съвпадения в базата. Можете да опитате с друг симптом или име на билка.";
  }

  const topicLabels = [
    ...matches.matchedSymptoms.map((symptom) => `симптом: ${symptom.name}`),
    ...matches.matchedCategories.map((category) => `категория: ${category.name}`),
    ...matches.matchedHerbs.map((herb) => `билка: ${herb.name}`),
    ...matches.matchedRecipes.map((recipe) => (recipe.title ? `рецепта: ${recipe.title}` : "рецепта")),
  ].slice(0, 5);

  const suggestedText =
    matches.suggestedHerbs.length > 0
      ? matches.suggestedHerbs
          .map((herb) => {
            const latinName = herb.latin ? ` (${herb.latin})` : "";
            const recipeNote = matches.recipeHerbIds.has(herb.id)
              ? " Има добавени рецепти/начини на приготвяне в страницата на билката."
              : "";
            const explanation = shortenText(
              herb.short_description || herb.traditional_uses || herb.description,
              "може да се разгледа като част от образователната база на Herbal Care.",
            );

            return `${herb.name}${latinName}: ${explanation} Връзка: /herbs/${herb.slug}.${recipeNote}`;
          })
          .join(" ")
      : "Открих тема в базата, но към нея все още няма свързани билки за показване.";

  const topicText = topicLabels.length > 0 ? `Открита тема: ${topicLabels.join(", ")}. ` : "";

  return `Кратко напомняне: информацията е образователна, не е диагноза и не замества лекарска консултация. ${topicText}Може да се разгледат следните записи от базата: ${suggestedText} Формулировките са предпазливи: традиционно се използва, може да подпомогне при някои хора, но не е лечение. При силни, внезапни, тревожни или продължителни симптоми потърсете лекар.`;
}

function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization");
  return authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
}

async function getCurrentUserId(token: string) {
  if (!supabase) {
    return null;
  }


  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user.id;
}

async function saveAiHistory(request: Request, question: string, payload: AiResponsePayload) {
  const token = getBearerToken(request);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!token || !supabaseUrl || !supabaseAnonKey) {
    return;
  }

  const userId = await getCurrentUserId(token);

  if (!userId) {
    return;
  }

  const authenticatedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  await authenticatedSupabase.from("ai_history").insert({
    user_id: userId,
    question,
    answer: payload.answer,
    is_emergency: payload.isEmergency,
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        answer: "Моля, изпратете валиден въпрос.",
        isEmergency: false,
        relatedLinks: [],
      },
      { status: 400 },
    );
  }

  const message = getMessage(body);

  if (!message.trim()) {
    return NextResponse.json(
      {
        answer: "Моля, въведете въпрос или описание, за да получите образователен отговор.",
        isEmergency: false,
        relatedLinks: [],
      },
      { status: 400 },
    );
  }

  if (hasEmergencyKeyword(message)) {
    const payload = {
      answer:
        "Описвате симптоми, които може да изискват спешна медицинска помощ. Моля, потърсете лекар или спешна помощ.",
      isEmergency: true,
      relatedLinks: [],
    };

    await saveAiHistory(request, message, payload);

    return NextResponse.json(payload);
  }

  const { herbs, symptoms, categories, herbSymptoms, herbCategories, herbRecipes } = await fetchSupabaseContext();
  const matches = findMatches(message, herbs, symptoms, categories, herbSymptoms, herbCategories, herbRecipes);
  const relatedLinks = uniqueLinks(matches.suggestedHerbs.map((herb) => ({ label: herb.name, href: `/herbs/${herb.slug}` })));
  const payload = {
    answer: buildAnswer(matches),
    isEmergency: false,
    relatedLinks,
  };

  await saveAiHistory(request, message, payload);

  return NextResponse.json(payload);
}
