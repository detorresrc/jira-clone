import { Project } from "@/features/projects/types";
import React from "react";
import { Task } from "../types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import Link from "next/link";
import { ChevronsRight, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteTask } from "../api/use-delete-task";
import { useRouter } from "next/navigation";

interface TaskBreadCrumbsProps {
  project: Project;
  task: Task;
}

export const TaskBreadCrumbs = ({ project, task }: TaskBreadCrumbsProps) => {
  const router = useRouter();
  const { mutate } = useDeleteTask();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Task",
    "Are you sure you want to delete this task? This action cannot be undone.",
    "destructive"
  );

  const handleDeleteTask = async () => {
    const ok = await confirm();
    if (!ok) return;

    mutate({ param: { taskId: task.$id } }, {
      onSuccess: () => {
        router.push(`/workspaces/${project.workspaceId}/projects/${project.$id}`);
      }
    });
  };

  return (
    <>
      <ConfirmDialog/>
      <div className='flex items-center gap-x-2'>
        <ProjectAvatar
          name={project.name}
          image={project.imageUrl}
          className='size-6 lg:size-8'
        />
        <Link
          href={`/workspaces/${project.workspaceId}/projects/${project.$id}`}
        >
          <p className='text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition'>
            {project.name}
          </p>
        </Link>
        <ChevronsRight className='size-4 lg:size-5 text-muted-foreground' />
        <p className='text-sm lg:text-lg font-semibold'>{task.name}</p>
        <Button className='ml-auto' variant={"destructive"} size={"sm"} onClick={handleDeleteTask}>
          <TrashIcon className='size-4 lg:mr-2' />
          <span>Delete Task</span>
        </Button>
      </div>
    </>
  );
};
