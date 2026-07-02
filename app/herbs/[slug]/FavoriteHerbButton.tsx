"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type FavoriteHerbButtonProps = {
  herbId: string;
};

export default function FavoriteHerbButton({ herbId }: FavoriteHerbButtonProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFavoriteState() {
      if (!supabase) {
        if (isMounted) {
          setIsLoading(false);
          setMessage("Supabase не е конфигуриран.");
        }
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        setUserId(null);
        setIsLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("favorite_herbs")
        .select("id")
        .eq("user_id", user.id)
        .eq("herb_id", herbId)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        setMessage("Не успяхме да проверим любимите.");
      } else {
        setFavoriteId(data?.id ?? null);
      }

      setIsLoading(false);
    }

    void loadFavoriteState();

    return () => {
      isMounted = false;
    };
  }, [herbId]);

  async function toggleFavorite() {
    if (!supabase || !userId) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    if (favoriteId) {
      const { error } = await supabase.from("favorite_herbs").delete().eq("id", favoriteId);

      if (error) {
        setMessage("Не успяхме да премахнем билката от любими.");
      } else {
        setFavoriteId(null);
        setMessage("Билката е премахната от любими.");
      }
    } else {
      const { data, error } = await supabase
        .from("favorite_herbs")
        .insert({
          user_id: userId,
          herb_id: herbId,
        })
        .select("id")
        .single();

      if (error) {
        setMessage("Не успяхме да добавим билката в любими.");
      } else {
        setFavoriteId(data.id);
        setMessage("Билката е добавена в любими.");
      }
    }

    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-700 bg-emerald-950/60 p-4 text-emerald-100">
        Проверяваме любимите...
      </div>
    );
  }

  if (!userId) {
    return (
      <Link
        href="/auth"
        className="mt-6 inline-flex rounded-2xl bg-yellow-300 px-5 py-3 font-bold text-green-950 shadow-lg transition hover:bg-yellow-200"
      >
        Влезте, за да добавите в любими
      </Link>
    );
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => void toggleFavorite()}
        disabled={isLoading}
        className="rounded-2xl bg-yellow-300 px-5 py-3 font-bold text-green-950 shadow-lg transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {favoriteId ? "Премахни от любими" : "Добави в любими"}
      </button>
      {message ? <p className="mt-3 text-sm text-emerald-100">{message}</p> : null}
    </div>
  );
}
