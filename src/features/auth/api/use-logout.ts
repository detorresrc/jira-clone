import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

const action = client.api.auth.logout;

type ResponseType = InferResponseType<typeof action["$post"]>;

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await action["$post"]();

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.refresh();
    }
  });

  return mutation;
};