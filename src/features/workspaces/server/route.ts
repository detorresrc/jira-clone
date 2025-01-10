import { Hono } from "hono";
import { cache } from 'hono/cache'
import { zValidator } from "@hono/zod-validator";

import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACE_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";

import { createWorkspaceSchema, updateWorkspaceSchema } from "../schema";
import { sessionMiddleware } from "@/lib/middlewares/session-middleware";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
import { getMember, getMembers } from "@/features/members/utils";
import { getMembersWorkspace, getWorkspace } from "./queries";
import { Workspace } from "../types";
import { createAdminClient } from "@/lib/server/appwrite";

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
  .get(
    "/:workspaceId",
    sessionMiddleware,
    zValidator("param", z.object({
      workspaceId: z.string()
    })),
    async (c) => {
      const { workspaceId } = c.req.valid("param");
      const user = c.get("user");
      const databases = c.get("databases");

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId
      );
      if(!workspace)
        return c.json({
          error: "Workspace not found"
        }, 404);

      const documentMembers = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [
          Query.equal("userId", user.$id),
          Query.equal("workspaceId", workspaceId)
        ]
      );
      if(documentMembers.total === 0)
        return c.json({
          error: "Unauthorized"
        }, 404);

      return c.json({
        data: workspace
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

        uploadedImageUrl = `/api/workspaces/background-image/${file.$id}`;
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

      const oldWorkspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId
      );
      if(!oldWorkspace)
        return c.json({
          error: "Workspace not found"
        }, 404);

      let uploadedImageUrl = oldWorkspace.imageUrl;
      let imageId = oldWorkspace.imageId;

      if(imageUrl instanceof File){
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          imageUrl
        );

        uploadedImageUrl = `/api/workspaces/background-image/${file.$id}`;
        imageId = file.$id;
      }

      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId,
        {
          name,
          imageId,
          imageUrl: uploadedImageUrl,
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

      const workspace = await getMembersWorkspace({
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

      const workspace = await getMembersWorkspace({
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
  )
  .post(
    "/:workspaceId/join",
    sessionMiddleware,
    zValidator("json", z.object({
      inviteCode: z.string()
    })),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { inviteCode } = c.req.valid("json");

      const databases = c.get("databases");
      const user = c.get("user");

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId
      });

      if(member){
        return c.json({
          error: "You are already a member of this workspace"
        }, 400);
      }// if(member)

      const workspace = await getWorkspace({
        workspaceId
      });

      if(!workspace){
        return c.json({
          error: "Workspace not found"
        }, 404);
      }// if(!workspace)

      if(workspace.inviteCode !== inviteCode){
        return c.json({
          error: "Invalid invite code"
        }, 400);
      }// if(workspace.inviteCode !== inviteCode)

      await databases.createDocument(
        DATABASE_ID,
        MEMBERS_ID,
        ID.unique(),
        {
          userId: user.$id,
          workspaceId,
          role: MemberRole.MEMBER
        }
      );

      return c.json({
        data: workspace
      });
    }
  )
  .get(
    "/background-image/:imageId",
    cache({
      cacheName: 'background-image',
      cacheControl: 'public, max-age=3600'
    }),
    async (c) => {
      const { imageId } = c.req.param();
      const { storage } = await createAdminClient();

      const arrayBuffer = await storage.getFilePreview(
        IMAGES_BUCKET_ID,
        imageId
      );

      return c.body(arrayBuffer, 200);
    }
  );

export default app;