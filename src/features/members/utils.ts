import { Query, type Databases } from "node-appwrite";

import { DATABASE_ID, MEMBERS_ID } from "@/config";

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
  const documentMembers = await databases.listDocuments(
    DATABASE_ID,
    MEMBERS_ID,
    [
      Query.equal("userId", userId), 
      Query.equal("workspaceId", workspaceId)
    ]
  );

  return documentMembers.documents[0];
}