import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

const action = client.api.tasks[':taskId'].$delete;

type ResponseType = InferResponseType<typeof action, 200>;
type RequestType = InferRequestType<typeof action>;

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (args) => {
      const response = await action(args);

      if(!response.ok) throw new Error("Failed to delete task");

      return await response.json();
    },
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", data.$id] });
      
      toast.success("Task deleted successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete task");
    }
  });

  return mutation;
};