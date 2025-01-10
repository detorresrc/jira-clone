import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";
import { getProjectsQueryOptions } from "./use-get-projects";

const action = client.api.projects[':projectId']["$patch"];

type ResponseType = InferResponseType<typeof action, 200>;
type RequestType = InferRequestType<typeof action>;

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (args) => {
      const existingProject = await queryClient.ensureQueryData(getProjectsQueryOptions({
        workspaceId: args.form.workspaceId || ""
      }));

      const response = await action(args);

      if(!response.ok) throw new Error("Failed to update project");

      const data = await response.json();
      const project = data.data;

      if(existingProject && project){
        const newQueryData = {
          ...existingProject,
          total: existingProject.total + 1,
          documents: [...existingProject.documents.map(proj => proj.$id === project.$id ? project : proj)]
        };
        queryClient.setQueryData(["projects", project.workspaceId], newQueryData);
      }
      if(project){
        queryClient.setQueryData(["projects", project.workspaceId, project.$id], project);
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Project updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update project");
    }
  });

  return mutation;
};