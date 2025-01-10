import { getCurrentUser } from "@/features/auth/server/queries";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { redirect } from "next/navigation";

interface TasksPageProps {
  params: Promise<{
    workspaceId: string
  }>
}

const TasksPage = async ({ params }: TasksPageProps) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  
  const { workspaceId } = await params;

  return (
    <div className="h-full flex flex-col">
      <TaskViewSwitcher
        workspaceId={workspaceId}
        hideProjectFilters={false}
        assignedId={user.$id}
      />
    </div>
  )
}

export default TasksPage