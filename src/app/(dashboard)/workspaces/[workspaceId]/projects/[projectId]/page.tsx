import React from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/server/queries";
import { ProjectIdClient } from "./client";

interface ProjectIdPageProps {
  params: Promise<{
    projectId: string;
    workspaceId: string;
  }>;
}

const ProjectIdPage = async ({ params }: ProjectIdPageProps) => {
  const { projectId, workspaceId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <ProjectIdClient
      projectId={projectId}
      workspaceId={workspaceId}
      />
  );
};

export default ProjectIdPage;
