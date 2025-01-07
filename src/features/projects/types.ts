import { Models } from "node-appwrite";

export type Project = Models.Document & {
  workspaceId: string;
  name: string;
  imageUrl?: string;
}