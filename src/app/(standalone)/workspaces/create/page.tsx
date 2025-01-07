import { getCurrentUser } from "@/features/auth/server/queries";
import { CreateWorkspaceForm } from "@/features/workspaces/components/create-workspace-form"
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

const WorkspaceCreatePage = async() => {
  const user = await getCurrentUser();
  if(!user) redirect("/sign-in");

  return (
    <div className="w-full lg:max-w-xl">
      <CreateWorkspaceForm/>
    </div>
  )
}

export default WorkspaceCreatePage