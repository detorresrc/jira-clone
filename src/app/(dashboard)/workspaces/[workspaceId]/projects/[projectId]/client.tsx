"use client"

import { Pencil } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { PageError } from '@/components/custom/page-error'
import { Button } from '@/components/ui/button'
import { useGetProject } from '@/features/projects/api/use-get-project'
import { ProjectAvatar } from '@/features/projects/components/project-avatar'
import { TaskViewSwitcher } from '@/features/tasks/components/task-view-switcher'
import Loading from './loading'
import { useGetProjectAnalytics } from '@/features/projects/api/use-get-project-analyutics'
import { Analytics } from '@/components/custom/analytics'

interface ProjectIdClientProps {
  projectId: string;
  workspaceId: string;
}

export const ProjectIdClient = ({
  projectId,
  workspaceId
} : ProjectIdClientProps) => {
  const { data: project, isLoading: isLoadingProject } = useGetProject({
    projectId,
    workspaceId
  });
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetProjectAnalytics({ projectId });

  const isLoading = isLoadingProject || isLoadingAnalytics;

  if(isLoading) return <Loading />

  if(!project)
    return <PageError message='Project not found!'/>

  return (
    <div className='flex flex-col gap-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-x-2'>
          <ProjectAvatar
            name={project.name}
            image={project.imageUrl}
            className='size-8'
          />
          <p className='text-lg font-semibold'>{project.name}</p>
        </div>
        <div>
          <Button variant={"secondary"} size={"sm"} asChild>
            <Link href={`/workspaces/${workspaceId}/projects/${projectId}/settings`}>
            <Pencil className="size-4 mr-2"/>
              Edit Project
            </Link>
          </Button>
        </div>
      </div>
      {analytics && <Analytics data={analytics}/>}
      <TaskViewSwitcher workspaceId={workspaceId} hideProjectFilters={true} projectId={project.$id}/>
    </div>
  )
}
