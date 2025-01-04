import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

const action = client.api.workspaces[":workspaceId"]["$delete"];

type ResponseType = InferResponseType<typeof action, 200>;
type RequestType = InferRequestType<typeof action>;

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ param }) => {
      const response = await action({param});

      if(!response.ok) throw new Error("Failed to delete workspace");

      return await response.json();
    },
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces", data.$id] });
      
      toast.success("Workspace deleted successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete workspace");
    }
  });

  return mutation;
};