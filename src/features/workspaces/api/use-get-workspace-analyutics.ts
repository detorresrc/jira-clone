import { queryOptions, useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

const action = client.api.workspaces[':workspaceId']['analytics']['$get'];
export type ResponseType = InferResponseType<typeof action, 200>;

export const UseGetWorkspaceAnalyticsOptions = ({
  workspaceId
} : UseGetWorkspaceAnalyticsProps) => {

  return queryOptions({
    queryKey: ["workspaces-analytics", workspaceId],
    queryFn: async () => {
      const response = await action({
        param: {
          workspaceId
        }
      });

      if(!response.ok) throw new Error("Failed to fetch wokrspace analytics");

      const { data } = await response.json();
      return data;
    }
  });
};

interface UseGetWorkspaceAnalyticsProps {
  workspaceId: string;
};

export const useGetWorkspaceAnalytics = ({
  workspaceId
} : UseGetWorkspaceAnalyticsProps) => {
  return useQuery(UseGetWorkspaceAnalyticsOptions({ workspaceId }));
};