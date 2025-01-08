import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetTasksProps {
  workspaceId: string;
  projectId?: string | null;
  status?: string | null;
  assignedId?: string | null;
  dueDate?: string | null;
  search?: string | null;
}

export const useGetTasks = ({
  workspaceId,
  assignedId,
  dueDate,
  projectId,
  search,
  status
}: UseGetTasksProps) => {
  const query = useQuery({
    queryKey: [
      "tasks",
      workspaceId,
      projectId,
      status,
      search,
      assignedId,
      dueDate
    ],
    queryFn: async () => {
      const response = await client.api.tasks['$get']({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          assignedId: assignedId ?? undefined,
          dueDate: dueDate ?? undefined,
          search: search ?? undefined
        }
      });

      if(!response.ok) throw new Error("Failed to fetch workspaces");

      const { data } = await response.json();
      return data;
    }
  });

  return query;
}