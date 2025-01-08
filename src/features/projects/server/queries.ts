import { getMember } from "@/features/members/utils";
import { createSessionClient } from "@/lib/server/appwrite";
import { Project } from "../types";
import { DATABASE_ID, PROJECTS_ID } from "@/config";

interface GetProjectProps {
  projectId: string
}
export const getProject = async ({ projectId }: GetProjectProps) => {
  const { databases, account } = await createSessionClient();

  const user = await account.get();

  const project = await databases.getDocument<Project>(
    DATABASE_ID,
    PROJECTS_ID,
    projectId
  );
  if (!project) throw new Error("Project not found");

  const member = await getMember({
    databases,
    userId: user.$id,
    workspaceId: project.workspaceId
  });
  if (!member) throw new Error("Unauthorized");

  return project;
}