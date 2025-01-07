import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

const action = client.api.members[':memberId'].$delete;

type ResponseType = InferResponseType<typeof action, 200>;
type RequestType = InferRequestType<typeof action>;

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (args) => {
      const response = await action(args);

      if(!response.ok) throw new Error("Failed to delete member");

      return await response.json();
    },
    onSuccess: ({ data }) => {
      const { member } = data.data;

      queryClient.invalidateQueries({ queryKey: ["members", member.workspaceId] });
      toast.success("Member deleted successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete member");
    }
  });

  return mutation;
};