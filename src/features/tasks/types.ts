import { Models } from "node-appwrite";

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE"
}

export type TaksUpdatePayload = {
  $id: string;
  status: TaskStatus;
  position: number;
};

export type Task = Models.Document & {
  workspaceId: string;
  name: string;
  projectId: string;
  assignedId: string;
  description?: string;
  dueDate: string;
  createdById: string;
  status: TaskStatus;
  position: number;
}