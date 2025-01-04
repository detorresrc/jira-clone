import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const action = client.api.auth.register;

type ResponseType = InferResponseType<typeof action["$post"]>;
type RequestType = InferRequestType<typeof action["$post"]>;

export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ json }) => {
      const response = await action["$post"]({json});

      if(!response.ok) throw new Error("Failed to register");

      return await response.json();
    },
    onSuccess: () => {
      router.refresh();
      queryClient.invalidateQueries({queryKey: ["current-session"]});
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to register");
    }
  });

  return mutation;
};