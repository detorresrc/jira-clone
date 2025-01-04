import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

const action = client.api.workspaces[":workspaceId"]["reset-invite-code"]["$post"];

type ResponseType = InferResponseType<typeof action, 200>;
type RequestType = InferRequestType<typeof action>;

export const useResetInviteCodeWorkspace = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ param }) => {
      const response = await action({param});

      if(!response.ok) throw new Error("Failed to reset invite code");

      return await response.json();
    },
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces", data.workspace.$id] });
      
      toast.success("Workspace reset invite code successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to reset invite code");
    }
  });

  return mutation;
};