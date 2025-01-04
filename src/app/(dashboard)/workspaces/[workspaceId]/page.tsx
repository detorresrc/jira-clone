import { getCurrentUser } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";

interface WorkspaceIdPageProps {
  params: {
    workspaceId: string
  }
}

const WorkspaceIdPage = async ({ params }: WorkspaceIdPageProps) => {
  const user = await getCurrentUser();
  if(!user) redirect("/sign-in");

  return <div>WorkspaceIdPage: {params.workspaceId}</div>;
};

export default WorkspaceIdPage;
