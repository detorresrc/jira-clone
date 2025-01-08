import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

const action = client.api.projects[":projectId"]["$delete"];

type ResponseType = InferResponseType<typeof action, 200>;
type RequestType = InferRequestType<typeof action>;

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ param }) => {
      const response = await action({param});

      if(!response.ok) throw new Error("Failed to delete project");

      return await response.json();
    },
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", data.$id] });
      
      toast.success("Project deleted successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete project");
    }
  });

  return mutation;
};