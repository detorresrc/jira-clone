import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/server/queries";
import { WorkspaceIdSettingsClient } from "./client";

interface WorkspaceIdSettingsPage {
  params: Promise<{
    workspaceId: string;
  }>;
}

const WorkspaceIdSettingsPage = async ({ params }: WorkspaceIdSettingsPage) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { workspaceId } = await params;

  return <WorkspaceIdSettingsClient workspaceId={workspaceId}/>;
};

export default WorkspaceIdSettingsPage;
