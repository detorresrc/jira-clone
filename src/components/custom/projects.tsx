"use client";

import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { RiAddCircleFill } from "react-icons/ri";
import { Skeleton } from "../ui/skeleton";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

export const Projects = () => {
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();
  const { data: projects, isLoading, isFetching } = useGetProjects({ workspaceId });
  const { open } = useCreateProjectModal();

  return (
    <div className='flex flex-col gap-y-2'>
      <div className='flex items-center justify-between'>
        <p className='text-xs uppercase text-neutral-500'>
          Projects
        </p>
        <RiAddCircleFill
          onClick={() => open()}
          className='size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition'
        />
      </div>
      {isFetching && !isLoading && (
        <div className='flex items-center space-x-1'>
          <Skeleton className='w-full h-8' />
        </div>
      )}
      {isLoading ? (
        <div className='flex flex-col items-center space-y-2.5'>
          <Skeleton className='w-full h-8' />
          <Skeleton className='w-full h-8' />
        </div>
      ) : (
        <>
          {projects?.documents.map((project) => {
            const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
            const isActive = pathname === href;

            return (
              <Link href={href} key={project.$id}>
                <div
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-neutral-500",
                    isActive &&
                      "bg-white shadow-sm hover:opacity-100 text-primary"
                  )}
                >
                  <ProjectAvatar image={project.imageUrl} name={project.name}/>
                  <span className='truncate'>{project.name}</span>
                </div>
              </Link>
            );
          })}
        </>
      )}
    </div>
  );
};
