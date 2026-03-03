"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell/AppShell";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_at: string | null;
  project_id: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, status, priority, due_at, project_id")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    setTasks(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load().catch((e) => alert(e.message));
  }, []);

  return (
    <AppShell>
      <h1 style={{ marginTop: 0 }}>Tasks</h1>
      <div className="u-card u-pad4">
        {loading ? (
          <div>Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="u-muted">태스크가 없습니다.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {tasks.map((t) => (
              <div key={t.id} className="u-rowBetween" style={{ padding: 10 }}>
                <div className="u-col" style={{ gap: 4 }}>
                  <div>{t.title}</div>
                  <div className="u-muted" style={{ fontSize: 12 }}>
                    {t.status} · {t.priority}
                  </div>
                </div>
                <a
                  href={`/projects/${t.project_id}`}
                  className="u-muted"
                  style={{ fontSize: 12 }}
                >
                  project →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
