"use client"

import DashboardLoading from '@/app/(standalone)/loading';
import { PageError } from '@/components/custom/page-error';
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace'
import { EditWorkspaceForm } from '@/features/workspaces/components/edit-workspace-form';
import React from 'react'

interface ProjectIdSettingsClientProps {
  workspaceId: string;
}

export const WorkspaceIdSettingsClient = ({ workspaceId } : ProjectIdSettingsClientProps) => {
  const { data: workspace, isLoading } = useGetWorkspace({
    workspaceId
  });

  if(isLoading)
      return <DashboardLoading/>
  
  if(!workspace)
    return <PageError message='Workspace not found!'/>

  return (
    <div className='w-full lg:max-w-2xl'>
      <EditWorkspaceForm initialValues={workspace} />
    </div>
  )
}