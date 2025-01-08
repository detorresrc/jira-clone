import z from "zod";
import { TaskStatus } from "./types";

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, "Task name must be at least 1 character long"),
  status: z.nativeEnum(TaskStatus, { required_error: "Task status is required" }),
  workspaceId: z.string(),
  projectId: z.string(),
  dueDate: z.coerce.date(),
  assignedId: z.string(),
  description: z.string().optional()
});
export type CreateTaskSchema = z.infer<typeof createTaskSchema>;