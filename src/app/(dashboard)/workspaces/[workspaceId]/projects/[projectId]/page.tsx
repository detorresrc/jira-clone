import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/server/queries";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { getProject } from "@/features/projects/server/queries";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

interface ProjectIdPageProps {
  params: Promise<{
    projectId: string;
    workspaceId: string;
  }>;
}

const ProjectIdPage = async ({ params }: ProjectIdPageProps) => {
  const { projectId, workspaceId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const project = await getProject({ projectId });
  if (!project) throw new Error("Project not found");

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
      <TaskViewSwitcher workspaceId={workspaceId}/>
    </div>
  );
};

export default ProjectIdPage;
