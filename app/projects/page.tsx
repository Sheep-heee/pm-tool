"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell/AppShell";

type Organization = { id: string; name: string };
type Project = {
  id: string;
  title: string;
  type: string;
  status: string;
  due_date: string | null;
  organization_id: string;
};

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);

  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("외주");
  const [status, setStatus] = useState("진행");
  const [organizationId, setOrganizationId] = useState<string>("");

  const canCreate = useMemo(
    () => title.trim().length > 0 && organizationId,
    [title, organizationId],
  );

  async function ensureDefaultOrganization(userId: string) {
    const { data: existing, error: selErr } = await supabase
      .from("organizations")
      .select("id, name")
      .order("created_at", { ascending: true });

    if (selErr) throw selErr;
    if (existing && existing.length > 0) return existing;

    const { data: created, error: insErr } = await supabase
      .from("organizations")
      .insert({
        user_id: userId,
        name: "Default",
        type: "기타",
      })
      .select("id, name");

    if (insErr) throw insErr;
    return created ?? [];
  }

  async function load() {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return;

    const orgList = await ensureDefaultOrganization(user.id);
    setOrgs(orgList);
    setOrganizationId(orgList[0]?.id ?? "");

    const { data: proj, error } = await supabase
      .from("projects")
      .select("id, title, type, status, due_date, organization_id")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    setProjects(proj ?? []);

    setLoading(false);
  }

  async function createProject() {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return;

    const { error } = await supabase.from("projects").insert({
      user_id: user.id, // ★ RLS 때문에 필수
      organization_id: organizationId,
      title: title.trim(),
      type,
      status,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setTitle("");
    await load();
  }

  useEffect(() => {
    load().catch((e) => alert(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell>
      <div className="u-col u-gap4">
        <div className="u-rowBetween">
          <h1 style={{ margin: 0 }}>Projects</h1>
        </div>

        <div className="u-card u-pad4 u-col u-gap2">
          <div className="u-row u-gap2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="프로젝트명"
              style={{ padding: 10, flex: 1 }}
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ padding: 10 }}
            >
              <option value="외주">외주</option>
              <option value="회사">회사</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ padding: 10 }}
            >
              <option value="진행">진행</option>
              <option value="보류">보류</option>
              <option value="완료">완료</option>
            </select>

            <select
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              style={{ padding: 10 }}
            >
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>

            <button
              disabled={!canCreate}
              onClick={createProject}
              style={{ padding: 10 }}
            >
              Add
            </button>
          </div>

          <div className="u-muted" style={{ fontSize: 13 }}>
            * 처음엔 Default 거래처를 자동 생성합니다.
          </div>
        </div>

        <div className="u-card u-pad4">
          {loading ? (
            <div>Loading...</div>
          ) : projects.length === 0 ? (
            <div className="u-muted">프로젝트가 없습니다.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {projects.map((p) => (
                <a
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="u-rowBetween"
                  style={{ padding: 10 }}
                >
                  <div className="u-col" style={{ gap: 4 }}>
                    <div>{p.title}</div>
                    <div className="u-muted" style={{ fontSize: 12 }}>
                      {p.type} · {p.status}
                    </div>
                  </div>
                  <div className="u-muted" style={{ fontSize: 12 }}>
                    {p.due_date ?? "-"}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
