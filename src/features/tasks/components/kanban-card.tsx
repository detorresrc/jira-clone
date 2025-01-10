import { TaskActions } from "@/features/projects/components/task-actions"
import { MoreHorizontal } from "lucide-react"

import { DottedSeparator } from "@/components/custom/dotted-separator"
import { Task } from "../types"
import { MemberAvatar } from "@/features/members/components/member-avatar"
import { TaskDueDate } from "./task-duedate"
import { ProjectAvatar } from "@/features/projects/components/project-avatar"

interface KanbanCardProps {
  task: Task
}

export const KanbanCard = ({
  task
} : KanbanCardProps) => {
  return (
    <div className="bg-white p-2.5 mb-2.5 rounded shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-x-2">
        <p>{task.name}</p>
        <TaskActions
          id={task.$id}
          projectId={task.projectId}
          workspaceId={task.workspaceId}>
            <MoreHorizontal className="size-[18px] stroke-1 shrink-0 text-neutral-700 hover:opacity-75 transition"/>
        </TaskActions>
      </div>

      <DottedSeparator/>

      <div className="flex items-center gap-x-2">
        <MemberAvatar
          name={task.assignee?.name || ""}
          fallbackClassName="text-[10px]"
        />
        <div className="size-1 rounded-full bg-nuetral-300"/>
        <TaskDueDate value={task.dueDate}/>
      </div>
      <div className="flex items-center gap-x-2">
        <ProjectAvatar
          name={task.project?.name || ""}
          image={task.project?.imageUrl}
          fallbackClassName="text-[10px]"
          />
        <span className="text-xs font-medium">{task.project?.name}</span>
      </div>
    </div>
  )
}
