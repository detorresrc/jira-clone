import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

const action = client.api.members[':memberId'].$patch;

type ResponseType = InferResponseType<typeof action, 200>;
type RequestType = InferRequestType<typeof action>;

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (args) => {
      const response = await action(args);

      if(!response.ok) throw new Error("Failed to update member");

      return await response.json();
    },
    onSuccess: ({ data }) => {
      const { member } = data.data;

      queryClient.invalidateQueries({ queryKey: ["members", member.workspaceId] });
      toast.success("Member updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update member");
    }
  });

  return mutation;
};