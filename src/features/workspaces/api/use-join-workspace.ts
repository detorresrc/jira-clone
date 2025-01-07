import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

const action = client.api.workspaces[":workspaceId"]["join"]["$post"];

type ResponseType = InferResponseType<typeof action, 200>;
type RequestType = InferRequestType<typeof action>;

export const useJoinWorkspace = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ json, param }) => {
      const response = await action({
        json,
        param
      });

      if(!response.ok) throw new Error("Failed to join workspace");

      return await response.json();
    },
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces", data.$id] });
      
      toast.success("Successfully joined in workspace");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to join workspace");
    }
  });

  return mutation;
};