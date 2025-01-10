import { getCurrentUser } from '@/features/auth/server/queries'
import { redirect } from 'next/navigation'
import React from 'react'
import { TaskIdClient } from './client'

interface TaskIdPageProps {
  params: Promise<{
    workspaceId: string
    taskId: string
  }>
}

const TaskIdPage = async ({
  params
}: TaskIdPageProps) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  
  return <TaskIdClient {...(await params)}/>
}

export default TaskIdPage