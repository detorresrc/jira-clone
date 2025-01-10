import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";
import { useProjectStore } from "../store";
import { getProjectsQueryOptions } from "./use-get-projects";

const action = client.api.projects["$post"];

type ResponseType = InferResponseType<typeof action, 200>;
type RequestType = InferRequestType<typeof action>;

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const store = useProjectStore();
  
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (args) => {
      const existingProject = await queryClient.ensureQueryData(getProjectsQueryOptions({
        workspaceId: args.form.workspaceId
      }));
      
      const response = await action(args);

      if(!response.ok) throw new Error("Failed to create project");

      const data = await response.json();
      if(data){
        const newQueryData = {
          total: existingProject.total + 1,
          documents: [data.data, ...existingProject.documents]
        };
        queryClient.setQueryData(["projects", args.form.workspaceId], newQueryData);
        console.log({existingProject, newQueryData});
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Project created successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create project");
    },
    onMutate: async (data) => {
      store.setIsCreating(data.form);
    },
    onSettled: () => {
      store.setIsCreating(null);
    }
  });

  return mutation;
};