import React from 'react'

import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotDashedIcon,
  CircleDotIcon,
  CircleIcon,
  PlusIcon,
} from "lucide-react";

import { TaskStatus } from '../types'
import { snaceCaseToTitleCase } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCreateTaskModal } from '../hooks/use-create-task-modal';

const statusIconMap: Record<TaskStatus, React.ReactNode> = {
  [TaskStatus.BACKLOG]: <CircleDashedIcon className="size-[18px] text-pink-400"/>,
  [TaskStatus.TODO]: <CircleIcon  className="size-[18px] text-red-400"/>,
  [TaskStatus.IN_PROGRESS]: <CircleDotDashedIcon  className="size-[18px] text-yellow-400"/>,
  [TaskStatus.IN_REVIEW]: <CircleDotIcon  className="size-[18px] text-blue-400"/>,
  [TaskStatus.DONE]: <CircleCheckIcon  className="size-[18px] text-emerald-400"/>,
}

interface KanbanColumnHeaderProps {
  board: TaskStatus;
  taskCount: number
}

export const KanbanColumnHeader = ({
  board,
  taskCount
} : KanbanColumnHeaderProps) => {
  const { open } = useCreateTaskModal();
  const icon = statusIconMap[board];
  
  return (
    <div className='px-2 py-1.5 flex items-center justify-between'>
      <div className='flex items-center gap-x-2'>
        {icon}
        <h2 className='text-sm font-medium'>{snaceCaseToTitleCase(board)}</h2>
      </div>
      <div className='size-5 flex items-center justify-center rounded-md bg-neutral-200 text-sm text-neautral-700 font-medium'>
        {taskCount}
      </div>
      <Button onClick={open} variant={"ghost"} size="icon">
        <PlusIcon className='size-4 text-neutral-500 '/>
      </Button>
    </div>
  )
}
