import React from 'react'
import { MoreHorizontal } from 'lucide-react'

import { EventCalendar, TaskStatus } from '../types'
import { cn } from '@/lib/utils'
import { MemberAvatar } from '@/features/members/components/member-avatar'
import { ProjectAvatar } from '@/features/projects/components/project-avatar'
import { TaskActions } from '@/features/projects/components/task-actions'

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: 'border-l-pink-500',
  [TaskStatus.TODO]: 'border-l-red-500',
  [TaskStatus.IN_PROGRESS]: 'border-l-yellow-500',
  [TaskStatus.IN_REVIEW]: 'border-l-blue-500',
  [TaskStatus.DONE]: 'border-l-emerald-500'
}

interface EventCardProps {
  data: EventCalendar
}

export const EventCard = ({
  data
} : EventCardProps) => {
  return (
    <div className='px-2'>
      <div
        className={cn(
          "p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition",
          statusColorMap[data.status]
        )}>
          <div className='w-full flex items-center justify-between'>
            <p className='flex-1 truncate'>
            {data.title}
            </p>
            <TaskActions
              id={data.id}
              projectId={data.project.$id}
              workspaceId={data.project.workspaceId}>
                <MoreHorizontal className="size-[18px] stroke-1 shrink-0 text-neutral-700 hover:opacity-75 transition"/>
            </TaskActions>
          </div>
          <div className='flex items-center gap-x-1'>
            <MemberAvatar
              name={data.assignee.name ?? "A"}
            />
            <div className='size-1 rounded-full bg-neutral-500'/>
            <ProjectAvatar
              name={data.project.name}
              image={data.project.imageUrl}
            />
          </div>
      </div>
    </div>
  )
}
