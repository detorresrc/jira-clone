import { Models } from "node-appwrite";
import { Project } from "../projects/types";
import { Member } from "../members/types";

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

export type EventCalendar = {
  start: Date;
  end: Date;
  title: string;
  project: Project;
  assignee: Member;
  status: TaskStatus;
  id: string;
}