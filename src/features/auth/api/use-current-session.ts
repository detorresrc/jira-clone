import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const useCurrentSession = () => {
  const query = useQuery({
    queryKey: ["current-session"],
    queryFn: async () => {
      const response = await client.api.auth.me.$get();

      if(!response.ok)
        return null;

      return await response.json();
    }
  });

  return query;
}