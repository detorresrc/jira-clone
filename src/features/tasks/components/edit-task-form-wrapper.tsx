import { Card, CardContent } from "@/components/ui/card";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import React from "react";

import { useGetTask } from "../api/use-get-task";
import { EditTaskForm } from "./edit-task-form";

interface EditTaskFormWrapperProps {
  onCancel?: () => void;
  id: string;
}

export const EditTaskFormWrapper = ({
  id,
  onCancel
}: EditTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
  const { data: task, isLoading: isLoadingTask } = useGetTask({
    taskId: id
  });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  const projectsOptions = projects?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
    imageUrl: project.imageUrl,
  }));

  const memberOptions = members?.documents.map((member) => ({
    id: member.userId,
    name: member.name + "(" + member.email + ")",
  }));

  const isLoading = isLoadingProjects || isLoadingMembers || isLoadingTask;

  if (isLoading) {
    return (
      <Card className='w-full h-[714px] border-none shadow-none'>
        <CardContent className='flex flex-col items-center justify-center h-full'>
          <Loader className='size-5 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    );
  }

  if(!task) return null;

  return (
    <EditTaskForm initialValues={task} memberOptions={memberOptions ?? []} projectOptions={projectsOptions ?? []} onCancel={onCancel} />
  );
};
