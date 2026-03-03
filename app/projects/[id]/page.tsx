import ProjectDetailClient from "./ProjectDetailClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams =
    typeof (params as any)?.then === "function"
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });

  return <ProjectDetailClient projectId={resolvedParams.id} />;
}
