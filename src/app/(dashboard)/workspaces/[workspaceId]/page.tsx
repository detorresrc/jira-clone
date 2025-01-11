import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/server/queries";
import { WorkspaceIdClient } from "./client";

interface WorkspaceIdPageProps {
  params: Promise<{
    workspaceId: string
  }>
}

const WorkspaceIdPage = async ({ params }: WorkspaceIdPageProps) => {
  const { workspaceId } = (await params);

  const user = await getCurrentUser();
  if(!user) redirect("/sign-in");

  return <WorkspaceIdClient workspaceId={workspaceId}/>;
};

export default WorkspaceIdPage;
