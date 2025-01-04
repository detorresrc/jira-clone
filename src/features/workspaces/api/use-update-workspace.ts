import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

const action = client.api.workspaces[":workspaceId"]["$patch"];

type ResponseType = InferResponseType<typeof action, 200>;
type RequestType = InferRequestType<typeof action>;

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ form, param }) => {
      const response = await action({form, param});

      if(!response.ok) throw new Error("Failed to update workspace");

      return await response.json();
    },
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces", data.$id] });
      toast.success("Workspace updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update workspace");
    }
  });

  return mutation;
};