import { queryOptions, useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

const action = client.api.projects[':projectId']['analytics']['$get'];
export type ResponseType = InferResponseType<typeof action, 200>;

export const UseGetProjectAnalyticsOptions = ({
  projectId
} : UseGetProjectAnalyticsProps) => {

  return queryOptions({
    queryKey: ["projects-analytics", projectId],
    queryFn: async () => {
      const response = await action({
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

interface UseGetProjectAnalyticsProps {
  projectId: string;
};

export const useGetProjectAnalytics = ({
  projectId
} : UseGetProjectAnalyticsProps) => {
  return useQuery(UseGetProjectAnalyticsOptions({ projectId }));
};