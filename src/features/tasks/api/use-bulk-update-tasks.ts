import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

const action = client.api.tasks['bulk-update'].$post;

type ResponseType = InferResponseType<typeof action, 200>;
type RequestType = InferRequestType<typeof action>;

export const useBulkUpdateTask = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (args) => {
      const response = await action(args);

      if(!response.ok) throw new Error("Failed to update tasks");

      return await response.json();
    },
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      data.forEach((task) => {
        queryClient.invalidateQueries({ queryKey: ["tasks", task.$id] });
      });

      toast.success("Tasks updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update tasks");
    }
  });

  return mutation;
};