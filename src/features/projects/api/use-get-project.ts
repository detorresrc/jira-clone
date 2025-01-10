import { queryOptions, useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetProjectProps {
  workspaceId: string;
  projectId: string;
};

export const getProjectQueryOptions = ({
  projectId,
  workspaceId
} : { projectId: string, workspaceId: string }) => {

  return queryOptions({
    queryKey: ["projects", workspaceId, projectId],
    queryFn: async () => {
      const response = await client.api.projects[':projectId'].$get({
        param: {
          projectId
        }
      });

      if(!response.ok) throw new Error("Failed to fetch project");

      const { data } = await response.json();
      return data;
    }
  });
};

export const useGetProject = ({
  workspaceId,
  projectId
} : UseGetProjectProps) => {
  return useQuery(getProjectQueryOptions({ workspaceId, projectId }));
};