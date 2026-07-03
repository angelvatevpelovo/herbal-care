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
};

type Symptom = {
  id: string;
  name: string;
};

type HerbSymptom = {
  herb_id: string;
  symptom_id: string;
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

async function fetchSupabaseContext() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const [{ data: herbs, error: herbsError }, { data: symptoms, error: symptomsError }, { data: herbSymptoms, error: herbSymptomsError }] =
    await Promise.all([
      supabase.from("herbs").select("id, slug, name"),
      supabase.from("symptoms").select("id, name"),
      supabase.from("herb_symptoms").select("herb_id, symptom_id"),
    ]);

  if (herbsError) {
    throw new Error(herbsError.message);
  }

  if (symptomsError) {
    throw new Error(symptomsError.message);
  }

  if (herbSymptomsError) {
    throw new Error(herbSymptomsError.message);
  }

  return {
    herbs: (herbs ?? []) as Herb[],
    symptoms: (symptoms ?? []) as Symptom[],
    herbSymptoms: (herbSymptoms ?? []) as HerbSymptom[],
  };
}

function findRelatedLinks(message: string, herbs: Herb[], symptoms: Symptom[], herbSymptoms: HerbSymptom[]) {
  const normalized = normalizeText(message);
  const links: RelatedLink[] = [];

  const matchedHerbs = herbs.filter((herb) => normalized.includes(normalizeText(herb.name)));
  links.push(...matchedHerbs.map((herb) => ({ label: herb.name, href: `/herbs/${herb.slug}` })));

  const matchedSymptoms = symptoms.filter((symptom) => normalized.includes(normalizeText(symptom.name)));
  const matchedSymptomIds = new Set(matchedSymptoms.map((symptom) => symptom.id));
  const relatedHerbIds = new Set(
    herbSymptoms
      .filter((connection) => matchedSymptomIds.has(connection.symptom_id))
      .map((connection) => connection.herb_id),
  );

  const symptomHerbs = herbs.filter((herb) => relatedHerbIds.has(herb.id));
  links.push(...symptomHerbs.map((herb) => ({ label: herb.name, href: `/herbs/${herb.slug}` })));

  return uniqueLinks(links);
}

function buildAnswer(relatedLinks: RelatedLink[]) {
  const relatedText =
    relatedLinks.length > 0
      ? ` Открих свързана информация за: ${relatedLinks.map((link) => link.label).join(", ")}.`
      : " Не открих директно съвпадение по име на билка или симптом, но може да разгледате секциите Билки и Симптоми.";

  return `Разбирам въпроса Ви. Това не е диагноза и не е лечение.${relatedText} Информацията е образователна и описва теми, които може да се свързват с традиционна употреба. При силни, внезапни или продължителни симптоми потърсете лекар.`;
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

  const { herbs, symptoms, herbSymptoms } = await fetchSupabaseContext();
  const relatedLinks = findRelatedLinks(message, herbs, symptoms, herbSymptoms);
  const payload = {
    answer: buildAnswer(relatedLinks),
    isEmergency: false,
    relatedLinks,
  };

  await saveAiHistory(request, message, payload);

  return NextResponse.json(payload);
}
