"use client"
import React from 'react'

import { PageLoader } from "@/components/custom/page-loader"
import { useGetTask } from '@/features/tasks/api/use-get-task'
import { PageError } from '@/components/custom/page-error'
import { TaskBreadCrumbs } from '@/features/tasks/components/task-bread-crumbs'
import { DottedSeparator } from '@/components/custom/dotted-separator'
import { TaskOverView } from '@/features/tasks/components/task-over-view'
import { TaskDescription } from '@/features/tasks/components/task-description'

interface TaskIdClientProps {
  workspaceId: string
  taskId: string
}

export const TaskIdClient = ({
  taskId
} : TaskIdClientProps) => {
  const { data, isLoading } = useGetTask({
    taskId
  });

  if(isLoading) {
    return <PageLoader />
  }

  if(!data)
    return <PageError message='Task not found!'/>
  
  return (
    <div className='flex flex-col'>
      <TaskBreadCrumbs project={data.project} task={data}/>
      <DottedSeparator className='my-6'/>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <TaskOverView data={data}/>
        <TaskDescription data={data}/>
      </div>
    </div>
  )
}
