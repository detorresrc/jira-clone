"use client";
import { RiAddCircleFill } from "react-icons/ri";
import { useRouter } from "next/navigation";

import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "../ui/select";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";
import { Skeleton } from "../ui/skeleton";

export const WorkspaceSwitcher = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { open } = useCreateWorkspaceModal();

  const { data: workspaces, isPending } = useGetWorkspaces();

  const onSelect = (value: string) => {
    router.push(`/workspaces/${value}`);
  };

  return (
    <div className='flex flex-col gap-y-2'>
      <div className='flex items-center justify-between'>
        <p className='text-xs uppercase text-neutral-500'>Workspaces</p>
        <RiAddCircleFill
          onClick={() => open()}
          className='size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition'
        />
      </div>
      {isPending ? (
        <div className="flex items-center space-x-1">
          <Skeleton className='w-12 h-10 rounded-md'/>
          <Skeleton className='w-full h-10'/>
        </div>
        
      ) : (
        <Select onValueChange={onSelect} value={workspaceId}>
          <SelectTrigger className='w-full bg-neutral-200 font-medium p-1'>
            <SelectValue placeholder='No workspace selected' />
          </SelectTrigger>
          <SelectContent>
            {workspaces?.documents.map((workspace) => (
              <SelectItem key={workspace.$id} value={workspace.$id}>
                <div className='flex justify-start items-center gap-3 font-medium'>
                  <WorkspaceAvatar
                    name={workspace.name}
                    image={workspace.imageUrl}
                  />
                  <span className='truncate'>{workspace.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
