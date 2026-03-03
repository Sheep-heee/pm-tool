"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell/AppShell";

type Project = {
  id: string;
  title: string;
  type: string;
  status: string;
  description: string | null;
};

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_at: string | null;
};

export default function ProjectDetailClient({
  projectId,
}: {
  projectId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskStatus, setTaskStatus] = useState("todo");
  const [taskPriority, setTaskPriority] = useState("mid");

  const canCreateTask = useMemo(() => taskTitle.trim().length > 0, [taskTitle]);

  async function load() {
    setLoading(true);

    const { data: p, error: pErr } = await supabase
      .from("projects")
      .select("id, title, type, status, description")
      .eq("id", projectId)
      .single();

    if (pErr) throw pErr;
    setProject(p);

    const { data: t, error: tErr } = await supabase
      .from("tasks")
      .select("id, title, status, priority, due_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (tErr) throw tErr;
    setTasks(t ?? []);

    setLoading(false);
  }

  async function createTask() {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return;

    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      project_id: projectId,
      title: taskTitle.trim(),
      status: taskStatus,
      priority: taskPriority,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setTaskTitle("");
    await load();
  }

  useEffect(() => {
    if (!projectId) return;
    load().catch((e) => alert(e.message));
  }, [projectId]);

  return (
    <AppShell>
      {loading ? (
        <div>Loading...</div>
      ) : !project ? (
        <div className="u-muted">프로젝트를 찾을 수 없습니다.</div>
      ) : (
        <div className="u-col u-gap4">
          <div className="u-rowBetween">
            <div className="u-col" style={{ gap: 6 }}>
              <h1 style={{ margin: 0 }}>{project.title}</h1>
              <div className="u-muted" style={{ fontSize: 13 }}>
                {project.type} · {project.status}
              </div>
            </div>
          </div>

          <div className="u-card u-pad4 u-col u-gap2">
            <div className="u-row u-gap2">
              <input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="태스크 제목"
                style={{ padding: 10, flex: 1 }}
              />

              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                style={{ padding: 10 }}
              >
                <option value="todo">todo</option>
                <option value="doing">doing</option>
                <option value="done">done</option>
              </select>

              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                style={{ padding: 10 }}
              >
                <option value="low">low</option>
                <option value="mid">mid</option>
                <option value="high">high</option>
              </select>

              <button
                disabled={!canCreateTask}
                onClick={createTask}
                style={{ padding: 10 }}
              >
                Add
              </button>
            </div>
          </div>

          <div className="u-card u-pad4">
            <h2 style={{ marginTop: 0 }}>Tasks</h2>
            {tasks.length === 0 ? (
              <div className="u-muted">태스크가 없습니다.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="u-rowBetween"
                    style={{ padding: 10 }}
                  >
                    <div className="u-col" style={{ gap: 4 }}>
                      <div>{t.title}</div>
                      <div className="u-muted" style={{ fontSize: 12 }}>
                        {t.status} · {t.priority}
                      </div>
                    </div>
                    <div className="u-muted" style={{ fontSize: 12 }}>
                      {t.due_at ?? "-"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
