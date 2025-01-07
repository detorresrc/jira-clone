import { getCurrentUser } from "@/features/auth/server/queries";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";
import { getWorkspace } from "@/features/workspaces/server/queries";
import { redirect } from "next/navigation";

interface WorkspaceIdJoinPageProps {
  params: Promise<{ 
    workspaceId: string 
    inviteCode: string
  }>
}

const WorkspaceIdJoinPage = async ({
  params
}: WorkspaceIdJoinPageProps) => {
  const { workspaceId, inviteCode } = await params;
  const user = await getCurrentUser();
  if(!user) redirect("/sign-in");

  const workspaceInfo = await getWorkspace({workspaceId});
  if(!workspaceInfo) redirect("/");

  const initialValues = {
    name: workspaceInfo.name,
    inviteCode,
    workspaceId
  }
  
  return (
    <div className="w-full lg:max-w-xl m-auto">
      <JoinWorkspaceForm initialValues={initialValues}/>
    </div>
  )
}

export default WorkspaceIdJoinPage;