"use server"

import { cookies } from "next/headers";
import { Account, Client, Databases, Query } from "node-appwrite";
import { AUTH_COOKIE } from "@/features/auth/constants";
import { DATABASE_ID, MEMBERS_ID, WORKSPACE_ID } from "@/config";
import { getAppWriteClient } from "@/lib/utils";
import { getMember } from "@/features/members/utils";
import { Workspace } from "../types";

export const getWorkspaces = async () => {
  try {
    const client = getAppWriteClient();

    const session = (await cookies()).get(AUTH_COOKIE);

    if (!session)
      return {
        documents: [],
        total: 0
      };

    client.setSession(session.value);
    const databases = new Databases(client);
    const account = new Account(client);

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

interface GetWorkspaceProps {
  workspaceId: string
}
export const getWorkspace = async ({ workspaceId } : GetWorkspaceProps) => {
  try {
    const client = getAppWriteClient();

    const session = (await cookies()).get(AUTH_COOKIE);

    if (!session)
      return null;

    client.setSession(session.value);
    const databases = new Databases(client);
    const account = new Account(client);

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