import z from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name must be at least 1 character long"),
  workspaceId: z.string(),
  imageUrl: z.union([
    z.instanceof(File),
    z.string().transform((value) => value === "" ? undefined : value)
  ]).optional()
});
export type CreateProjectSchema = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name must be at least 1 character long").optional(),
  workspaceId: z.string().optional(),
  imageUrl: z.union([
    z.instanceof(File),
    z.string().transform((value) => value === "" ? undefined : value)
  ]).optional()
});
export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>;