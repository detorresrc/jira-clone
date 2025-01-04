import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const action = client.api.auth.login;

type ResponseType = InferResponseType<typeof action["$post"]>;
type RequestType = InferRequestType<typeof action["$post"]>;

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ json }) => {
      const response = await action["$post"]({json});

      if(!response.ok) throw new Error("Failed to login");

      return await response.json();
    },
    onSuccess: () => {
      router.refresh();
      queryClient.invalidateQueries({queryKey: ["current-session"]});
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to login");
    }
  });

  return mutation;
};