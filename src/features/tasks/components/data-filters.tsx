import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { SelectValue } from "@radix-ui/react-select";
import { FolderIcon, ListCheckIcon, Loader2, UserIcon } from "lucide-react";
import { TaskStatus } from "../types";
import { useTaskFilters } from "../hooks/use-task-filters";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import DatePicker from "@/components/custom/date-picker";

interface DataFiltersProps {
  hideProjectFilters?: boolean;
  hideAssigneeFilters?: boolean;
}

export const DataFilters = ({
  hideProjectFilters,
  hideAssigneeFilters,
}: DataFiltersProps) => {
  const workspaceId = useWorkspaceId();

  const { data: projects, isLoading: isProjectsLoading } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isMemberLoading } = useGetMembers({
    workspaceId,
  });

  const isLoading = isProjectsLoading || isMemberLoading;

  const projectsOptions = projects?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
    imageUrl: project.imageUrl,
  }));

  const memberOptions = members?.documents.map((member) => ({
    id: member.userId,
    name: member.name,
  }));

  const [{ status, assignedId, projectId, dueDate }, setFilters] =
    useTaskFilters();

  const onStatusChange = (value: string) => {
    setFilters({ status: value === "all" ? null : (value as TaskStatus) });
  };

  const onAssigneeChange = (value: string) => {
    setFilters({ assignedId: value === "all" ? null : value });
  };

  const onProjectChange = (value: string) => {
    setFilters({ projectId: value === "all" ? null : value });
  };

  if (isLoading) return null;

  return (
    <div className='flex flex-col lg:flex-row gap-y-2 gap-x-2'>
      <Select defaultValue={status ?? undefined} onValueChange={onStatusChange}>
        <SelectTrigger className='w-full lg:w-auto h-10'>
          <div className='flex items-center pr-2'>
            <ListCheckIcon className='size-4 mr-2' />
            <SelectValue placeholder='All Statuses' />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Statuses</SelectItem>
          <SelectSeparator />
          <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
          <SelectItem value={TaskStatus.IN_PROGRESS}>In-Progress</SelectItem>
          <SelectItem value={TaskStatus.IN_REVIEW}>in-Review</SelectItem>
          <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
          <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
        </SelectContent>
      </Select>

      {!hideAssigneeFilters && (
        <Select
          defaultValue={assignedId ?? undefined}
          onValueChange={onAssigneeChange}
        >
          <SelectTrigger className='w-full lg:w-auto h-10'>
            <div className='flex items-center pr-2'>
              <UserIcon className='size-4 mr-2' />
              <SelectValue placeholder='Select Assignee' />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Assignees</SelectItem>
            <SelectSeparator />
            {memberOptions?.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                <div className='flex items-center gap-x-2'>
                  <MemberAvatar name={member.name} className='size-6' />
                  {member.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!hideProjectFilters && (
        <Select
          defaultValue={projectId ?? undefined}
          onValueChange={onProjectChange}
        >
          <SelectTrigger className='w-full lg:w-auto h-10'>
            <div className='flex items-center pr-2'>
              <FolderIcon className='size-4 mr-2' />
              <SelectValue placeholder='Select Project' />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Projects</SelectItem>
            <SelectSeparator />
            {projectsOptions?.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className='flex items-center gap-x-2'>
                  <ProjectAvatar
                    name={project.name}
                    image={project.imageUrl}
                    className='size-6'
                  />
                  {project.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <DatePicker
        placeholder='Due Date'
        className='h-10 w-full lg:w-auto'
        value={dueDate ? new Date(dueDate) : undefined}
        onChange={(date) => {
          setFilters({ dueDate: date ? date.toISOString() : null });
        }}
      />
      <div className='flex-1 flex items-center justify-end'>
        {isLoading && <Loader2 className='size-6 animate-spin' />}
      </div>
    </div>
  );
};
