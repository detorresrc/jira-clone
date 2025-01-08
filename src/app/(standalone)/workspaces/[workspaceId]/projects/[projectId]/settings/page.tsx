import { getCurrentUser } from '@/features/auth/server/queries';
import { EditProjectForm } from '@/features/projects/components/edit-project-form';
import { getProject } from '@/features/projects/server/queries';
import { redirect } from 'next/navigation';
import React from 'react'

interface ProjectIdSettingsPageProps {
  params: Promise<{
    projectId: string;
  }>
}

const ProjectIdSettingsPage = async({
  params
}: ProjectIdSettingsPageProps) => {
  const { projectId } = await params;

  const user = await getCurrentUser();
  if(!user) redirect("/sign-in");
  
  const project = await getProject({
    projectId
  });
  if(!project)
    throw new Error("Project not found");

  return (
    <div className='w-full lg:max-w-xl'>
      <EditProjectForm initialValues={project}/>
    </div>
  )
}

export default ProjectIdSettingsPage;