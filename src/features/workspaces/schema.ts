import z from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Workspace name must be at least 1 character long"),
  imageUrl: z.union([
    z.instanceof(File),
    z.string().transform((value) => value === "" ? undefined : value)
  ]).optional()
});
export type CreateWorkspaceSchema = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Workspace name must be at least 1 character long").optional(),
  imageUrl: z.union([
    z.instanceof(File),
    z.string().transform((value) => value === "" ? undefined : value)
  ]).optional()
});
export type UpdateWorkspaceSchema = z.infer<typeof updateWorkspaceSchema>;