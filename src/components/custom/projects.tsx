"use client";

import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { RiAddCircleFill } from "react-icons/ri";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useProjectStore } from "@/features/projects/store";
import { LoaderCircle } from "lucide-react";

export const Projects = () => {
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();
  const {
    data: projects,
    isLoading,
    isFetching,
  } = useGetProjects({ workspaceId });
  const { isCreating, createPayload } = useProjectStore();
  const { open } = useCreateProjectModal();

  const isLoadingAny = isFetching || isLoading || isCreating;

  return (
    <div className='flex flex-col gap-y-2'>
      <div className='flex items-center justify-between'>
        <p className='text-xs uppercase text-neutral-500 flex-1 flex items-center justify-between'>
          <span>Projects</span>
          {isLoadingAny && (<LoaderCircle className="size-4 animate-spin mr-2"/>)}
        </p>
        <RiAddCircleFill
          onClick={() => open()}
          className='size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition'
        />
      </div>
      <>
        {isCreating && createPayload && (
          <div
            className={cn(
              "flex items-center gap-2.5 p-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-neutral-500 opacity-50 animate-pulse",
            )}
          >
            <ProjectAvatar name={createPayload.name}/>
            <span className='truncate'>{createPayload.name}</span>
          </div>
        )}
        {projects?.documents.map((project) => {
          const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
          const isActive = pathname === href;

          return (
            <Link href={`${href}?projectId=${project.$id}`} key={project.$id}>
              <div
                className={cn(
                  "flex items-center gap-2.5 p-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-neutral-500",
                  isActive &&
                    "bg-white shadow-sm hover:opacity-100 text-primary"
                )}
              >
                <ProjectAvatar image={project.imageUrl} name={project.name} />
                <span className='truncate'>{project.name}</span>
              </div>
            </Link>
          );
        })}
      </>
    </div>
  );
};
