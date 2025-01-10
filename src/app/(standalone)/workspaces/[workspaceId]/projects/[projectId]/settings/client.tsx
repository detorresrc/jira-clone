"use client";

import DashboardLoading from "@/app/(standalone)/loading";
import { PageError } from "@/components/custom/page-error";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";

interface ProjectIdClientProps {
  projectId: string;
  workspaceId: string;
}

export const ProjectIdClient = ({ projectId, workspaceId }: ProjectIdClientProps) => {
  const { data, isLoading } = useGetProject({
    projectId,
    workspaceId
  });

  if(isLoading)
    return <DashboardLoading/>

  if(!data)
    return <PageError message='Project not found!'/>

  return (
    <div className='w-full lg:max-w-xl'>
      <EditProjectForm initialValues={data} />
    </div>
  );
};
