import { getCurrentUser } from "@/features/auth/actions";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { getWorkspace } from "@/features/workspaces/server/actions";
import { redirect } from "next/navigation";

interface WorkspaceIdSettingsPage {
  params: {
    workspaceId: string;
  }
}

const WorkspaceIdSettingsPage = async ({ params } : WorkspaceIdSettingsPage) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const workspace = await getWorkspace({workspaceId: params.workspaceId});
  if(!workspace)
    redirect("/");

  return <div className="w-full lg:max-w-2xl"><EditWorkspaceForm initialValues={workspace}/></div>;
};

export default WorkspaceIdSettingsPage;
