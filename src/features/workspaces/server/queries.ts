"use server"

import { Query } from "node-appwrite";

import { DATABASE_ID, MEMBERS_ID, WORKSPACE_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { Workspace } from "../types";
import { createSessionClient } from "@/lib/server/appwrite";

export const getWorkspaces = async () => {
  try {
    const { databases, account } = await createSessionClient();

    const user = await account.get();

    const documentMembers = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("userId", user.$id)]
    );
    if (documentMembers.total === 0)
      return {
        documents: [],
        total: 0
      };

    const workspaceIds = documentMembers.documents.map((document) => document.workspaceId);

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACE_ID,
      [
        Query.orderDesc("$createdAt"),
        Query.contains("$id", workspaceIds)]
    );

    return workspaces;
  } catch(e) {
    console.error(e);
    
    return {
      documents: [],
      total: 0
    };
  }
}

interface getMembersWorkspaceProps {
  workspaceId: string
}
export const getMembersWorkspace = async ({ workspaceId } : getMembersWorkspaceProps) => {
  try {
    const { databases, account } = await createSessionClient();

    const user = await account.get();

    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId
    });
    if(!member) return null;

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACE_ID,
      workspaceId
    );

    return workspace;
  } catch(e) {
    console.error(e);
    
    return null;
  }
}

interface GetWorkspaceProps {
  workspaceId: string
}
export const getWorkspace = async ({ workspaceId } : GetWorkspaceProps) => {
  try {
    const { databases } = await createSessionClient();

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACE_ID,
      workspaceId
    );

    return workspace;
  } catch(e) {
    console.error(e);
    
    return null;
  }
}