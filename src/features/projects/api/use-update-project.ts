import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

const action = client.api.projects[':projectId']["$patch"];

type ResponseType = InferResponseType<typeof action, 200>;
type RequestType = InferRequestType<typeof action>;

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (args) => {
      const response = await action(args);

      if(!response.ok) throw new Error("Failed to update project");

      return await response.json();
    },
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", data.$id] });
      
      toast.success("Project updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update project");
    }
  });

  return mutation;
};