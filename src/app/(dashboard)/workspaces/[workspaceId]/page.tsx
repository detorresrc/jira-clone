import { getCurrentUser } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";

interface WorkspaceIdPageProps {
  params: Promise<{
    workspaceId: string
  }>
}

const WorkspaceIdPage = async ({ params }: WorkspaceIdPageProps) => {
  const { workspaceId } = (await params);

  const user = await getCurrentUser();
  if(!user) redirect("/sign-in");
  

  return <div>WorkspaceIdPage: {workspaceId}</div>;
};

export default WorkspaceIdPage;
