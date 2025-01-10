import React from "react";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { DottedSeparator } from "@/components/custom/dotted-separator";
import { OverviewProperty } from "./overview-property";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { TaskDueDate } from "./task-duedate";
import { snaceCaseToTitleCase } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";

interface TaskOverViewProps {
  data: Task;
}

export const TaskOverView = ({ data }: TaskOverViewProps) => {
  const { open } = useEditTaskModal();
  
  return (
    <div className='flex flex-col gap-y-4 col-span-1'>
      <div className='bg-muted rounded-lg p-4'>
        <div className="flex items-center justify-between">
          <p className='text-lg font-semibold'>Overview</p>
          <Button className='' size={"sm"} variant={"secondary"} onClick={() => open(data.$id)}>
            <PencilIcon className='size-4 mr-2' />
            Edit
          </Button>
        </div>
        <DottedSeparator className="my-4"/>
        <div className="flex flex-col gap-y-4">
          <OverviewProperty label="Assignee">
            <MemberAvatar
              name={data.assignee?.name ?? "A"}
              className="size-6"/>
            <p className="text-sm font-medium">{data.assignee?.name}</p>
          </OverviewProperty>
          <OverviewProperty label="Due Date">
            <TaskDueDate value={data.dueDate} className="text-sm font-medium"/>
          </OverviewProperty>
          <OverviewProperty label="Status">
            <Badge variant={data.status}>{snaceCaseToTitleCase(data.status)}</Badge>
          </OverviewProperty>
        </div>
      </div>
    </div>
  );
};
