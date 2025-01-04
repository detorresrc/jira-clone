import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACE_ID } from "@/config";
import { ID, Query } from "node-appwrite";

import { createWorkspaceSchema, updateWorkspaceSchema } from "../schema";
import { sessionMiddleware } from "@/lib/middlewares/session-middleware";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
import { getMember, getMembers } from "@/features/members/utils";
import { getWorkspace } from "./queries";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");

      const documentMembers = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("userId", user.$id)]
      );
      if(documentMembers.total === 0)
        return c.json({
          data: {
            documents: [],
            total: 0
          }
        });

      const workspaceIds = documentMembers.documents.map((document) => document.workspaceId);

      const workspaces = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACE_ID,
        [
          Query.orderDesc("$createdAt"),
          Query.contains("$id", workspaceIds)]
      );

      if(workspaces.total === 0)
        return c.json({
          data: {
            documents: [],
            total: 0
          }
        });

      return c.json({
        data: workspaces
      });
    }
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createWorkspaceSchema),
    async (c) => {
      const { name, imageUrl } = c.req.valid("form");
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      let uploadedImageUrl: string | undefined;
      let imageId: string | undefined;

      if(imageUrl instanceof File){
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          imageUrl
        );
        console.log({file});

        const arrayBuffer = await storage.getFilePreview(
          IMAGES_BUCKET_ID,
          file.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
        imageId = file.$id;
      }

      const workspace = await databases.createDocument(
        DATABASE_ID,
        WORKSPACE_ID,
        ID.unique(),
        {
          name,
          imageId,
          userId: user.$id,
          imageUrl: uploadedImageUrl,
          inviteCode: generateInviteCode(10),
        }
      );

      await databases.createDocument(
        DATABASE_ID,
        MEMBERS_ID,
        ID.unique(),
        {
          userId: user.$id,
          workspaceId: workspace.$id,
          role: MemberRole.ADMIN
        }
      )

      return c.json({
        data: workspace
      });
    }
  )
  .patch(
    "/:workspaceId",
    sessionMiddleware,
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { name, imageUrl } = c.req.valid("form");
      
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      // Check if the user is an admin of the workspace
      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId
      });
      if(!member || member.role !== MemberRole.ADMIN)
        return c.json({
          error: "You are not allowed to update this workspace"
        }, 401);

      let uploadedImageUrl: string | undefined;
      if(imageUrl instanceof File){
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          imageUrl
        );

        const arrayBuffer = await storage.getFilePreview(
          IMAGES_BUCKET_ID,
          file.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
      } else{
        uploadedImageUrl = imageUrl;
      }

      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId,
        {
          name,
          imageUrl: uploadedImageUrl
        }
      );
      
      return c.json({
        data: workspace
      });
    }
  )
  .delete(
    "/:workspaceId",
    sessionMiddleware,
    async (c) => {
      const { workspaceId } = c.req.param();
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId
      });
      if(!member || member.role !== MemberRole.ADMIN)
        return c.json({
          error: "You are not allowed to delete this workspace"
        }, 401);

      const workspace = await getWorkspace({
        workspaceId
      });
      if(!workspace)
        return c.json({
          error: "Workspace not found"
        }, 404);

      // TODO: Delete projects, and tasks
      
      // Delete Members
      const membersIds = (await getMembers({
        databases,
        workspaceId
      })).map((doc) => doc.$id);
      if(membersIds){
        for(const memberId of membersIds){
          await databases.deleteDocument(
            DATABASE_ID,
            MEMBERS_ID,
            memberId
          );
        }
      }

      // Delete Bucket
      if(workspace.imageId)
        await storage.deleteFile(IMAGES_BUCKET_ID, workspace.imageId);

      // Delete Workspace
      await databases.deleteDocument(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId
      );

      return c.json({
        data: {
          $id: workspaceId
        }
      });
    }
  )
  .post(
    "/:workspaceId/reset-invite-code",
    sessionMiddleware,
    async (c) => {
      const { workspaceId } = c.req.param();
      const databases = c.get("databases");
      const user = c.get("user");

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId
      });
      if(!member || member.role !== MemberRole.ADMIN)
        return c.json({
          error: "You are not allowed to reset the invite code"
        }, 401);

      const workspace = await getWorkspace({
        workspaceId
      });
      if(!workspace)
        return c.json({
          error: "Workspace not found"
        }, 404);

      const inviteCode = generateInviteCode(10);

      await databases.updateDocument(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId,
        {
          inviteCode
        }
      );

      return c.json({
        data: {
          inviteCode,
          workspace
        }
      });
    }
  );

export default app;