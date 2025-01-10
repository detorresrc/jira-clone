import { getCurrentUser } from '@/features/auth/server/queries';
import { redirect } from 'next/navigation';
import React from 'react'
import { ProjectIdClient } from './client';

interface ProjectIdSettingsPageProps {
  params: Promise<{
    projectId: string;
    workspaceId: string;
  }>
}

const ProjectIdSettingsPage = async({
  params
}: ProjectIdSettingsPageProps) => {

  const user = await getCurrentUser();
  if(!user) redirect("/sign-in");

  return <ProjectIdClient {...(await params)}/>
}

export default ProjectIdSettingsPage;