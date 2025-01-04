import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/server/queries";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { getWorkspace } from "@/features/workspaces/server/queries";

interface WorkspaceIdSettingsPage {
  params: Promise<{
    workspaceId: string;
  }>;
}

const WorkspaceIdSettingsPage = async ({ params }: WorkspaceIdSettingsPage) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { workspaceId } = await params;

  const workspace = await getWorkspace({ workspaceId });
  if (!workspace) redirect("/");

  return (
    <div className='w-full lg:max-w-2xl'>
      <EditWorkspaceForm initialValues={workspace} />
    </div>
  );
};

export default WorkspaceIdSettingsPage;
