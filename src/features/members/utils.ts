import { Query, type Databases } from "node-appwrite";

import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Member } from "./types";

interface GetMemberParams {
  databases: Databases;
  userId: string;
  workspaceId: string;
}

export const getMember = async ({
  databases,
  userId,
  workspaceId
}: GetMemberParams) => {
  const documentMembers = await databases.listDocuments<Member>(
    DATABASE_ID,
    MEMBERS_ID,
    [
      Query.equal("userId", userId), 
      Query.equal("workspaceId", workspaceId)
    ]
  );

  return documentMembers.documents[0];
}

interface GetMembersParams {
  databases: Databases;
  workspaceId: string;
}

export const getMembers = async ({
  databases,
  workspaceId
}: GetMembersParams) => {
  const documentMembers = await databases.listDocuments<Member>(
    DATABASE_ID,
    MEMBERS_ID,
    [Query.equal("workspaceId", workspaceId)]
  );

  return documentMembers.documents;
}