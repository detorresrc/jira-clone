import React from "react";
import { useRouter } from "next/navigation";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useDeleteTask } from "@/features/tasks/api/use-delete-task";
import { useConfirm } from "@/hooks/use-confirm";
import { useEditTaskModal } from "@/features/tasks/hooks/use-edit-task-modal";

interface TaskActionsProps {
  id: string;
  projectId: string;
  workspaceId: string;
  children: React.ReactNode;
}

export const TaskActions = ({ 
  children, 
  id, 
  projectId,
  workspaceId
}: TaskActionsProps) => {
  const router = useRouter();
  const { mutate } = useDeleteTask();
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Task",
    "Are you sure you want to delete this task? This action cannot be undone.",
    "destructive"
  );
  const { open } = useEditTaskModal();

  const handleDeleteTask = async () => {
    const ok = await confirm();
    if(!ok) return;

    mutate({param: {  taskId: id }});
  };

  const handleOpenTask = () => {
    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  }

  const onOpenProject = () => {
    router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
  }

  return (
    <>
      <ConfirmDialog/>
      <div className='flex justify-end'>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuItem
              onClick={handleOpenTask}
              disabled={false}
              className='font-medium p-[10px]'
            >
              <ExternalLinkIcon className='size-4 mr-2 stroke-2' />
              Task Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onOpenProject}
              disabled={false}
              className='font-medium p-[10px]'
            >
              <ExternalLinkIcon className='size-4 mr-2 stroke-2' />
              Open Project
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => { open(id) }}
              disabled={false}
              className='font-medium p-[10px]'
            >
              <PencilIcon className='size-4 mr-2 stroke-2' />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteTask}
              disabled={false}
              className='text-amber-700 focus:text-amber-700 font-medium p-[10px]'
            >
              <TrashIcon className='size-4 mr-2 stroke-2' />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
