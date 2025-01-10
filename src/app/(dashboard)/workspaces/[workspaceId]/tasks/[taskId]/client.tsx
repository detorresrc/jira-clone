"use client"
import React from 'react'

import { PageLoader } from "@/components/custom/page-loader"
import { useGetTask } from '@/features/tasks/api/use-get-task'
import { PageError } from '@/components/custom/page-error'
import { TaskBreadCrumbs } from '@/features/tasks/components/task-bread-crumbs'

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
    </div>
  )
}
