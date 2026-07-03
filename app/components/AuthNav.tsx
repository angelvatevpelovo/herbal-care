"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const navItemClass =
  "min-h-11 rounded-full border border-emerald-700 bg-emerald-900/60 px-3 py-2 text-center text-sm font-semibold text-emerald-50 transition hover:border-yellow-300 hover:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-emerald-950";

export default function AuthNav() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setIsLoggedIn(false);
      setIsLoading(false);
      return;
    }

    const client = supabase;
    let isMounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await client.auth.getUser();

      if (isMounted) {
        setIsLoggedIn(Boolean(user));
        setIsLoading(false);
      }
    }

    void loadUser();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    if (!supabase) {
      router.push("/auth");
      return;
    }

    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setIsSigningOut(false);
    router.push("/");
    router.refresh();
  }

  if (isLoading) {
    return (
      <span className="min-h-11 rounded-full border border-emerald-800 bg-emerald-950/60 px-3 py-2 text-center text-sm font-semibold text-emerald-200">
        Зареждане...
      </span>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link href="/auth" className={navItemClass}>
        Вход / Регистрация
      </Link>
    );
  }

  return (
    <>
      <Link href="/favorites" className={navItemClass}>
        Любими
      </Link>
      <Link href="/profile" className={navItemClass}>
        Профил
      </Link>
      <button
        type="button"
        onClick={() => void handleSignOut()}
        disabled={isSigningOut}
        className={`${navItemClass} disabled:cursor-not-allowed disabled:opacity-70`}
      >
        {isSigningOut ? "Излизане..." : "Изход"}
      </button>
    </>
  );
}
