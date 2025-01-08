import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

const action = client.api.tasks[':taskId'].$patch;

type ResponseType = InferResponseType<typeof action, 200>;
type RequestType = InferRequestType<typeof action>;

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (args) => {
      const response = await action(args);

      if(!response.ok) throw new Error("Failed to update task");

      return await response.json();
    },
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", data.$id] });

      toast.success("Task updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update task");
    }
  });

  return mutation;
};