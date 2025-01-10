import { queryOptions, useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetProjectsProps {
  workspaceId: string;
};

export const getProjectsQueryOptions = ({
  workspaceId
} : { workspaceId: string }) => {

  return queryOptions({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      const response = await client.api.projects.$get({
        query: {
          workspaceId
        }
      });

      if(!response.ok) throw new Error("Failed to fetch projects");

      const { data } = await response.json();
      return data;
    }
  });
};

export const useGetProjects = ({
  workspaceId
} : UseGetProjectsProps) => {
  return useQuery(getProjectsQueryOptions({ workspaceId }));
};