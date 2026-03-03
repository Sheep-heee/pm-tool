"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./AppShell.module.scss";
import { supabase } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/LogoutButton";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      // 로그인 페이지는 가드 제외
      if (pathname === "/login") {
        if (!cancelled) setReady(true);
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }

      if (!cancelled) setReady(true);
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) return null;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div style={{ display: "grid", gap: 8 }}>
          <a href="/projects">Projects</a>
          <a href="/tasks">Tasks</a>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div>PM Tool</div>
          <LogoutButton />
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
