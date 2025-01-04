import { getCurrentUser } from "@/features/auth/server/queries";
import { getWorkspaces } from "@/features/workspaces/server/queries";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();
  if(!user) redirect("/sign-in");

  const workspaces = await getWorkspaces();
  if(workspaces.total === 0)
    redirect("/workspaces/create");
  else
    redirect(`/workspaces/${workspaces.documents[0].$id}`);
}