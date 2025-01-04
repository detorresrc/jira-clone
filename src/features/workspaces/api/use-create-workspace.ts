import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

const action = client.api.workspaces;

type ResponseType = InferResponseType<typeof action["$post"]>;
type RequestType = InferRequestType<typeof action["$post"]>;

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ form }) => {
      const response = await action["$post"]({form});

      if(!response.ok) throw new Error("Failed to create workspace");

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Workspace created successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create workspace");
    }
  });

  return mutation;
};