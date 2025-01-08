import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ID, Query } from "node-appwrite";

import { sessionMiddleware } from "@/lib/middlewares/session-middleware";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID } from "@/config";

import { Project } from "../types";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { MemberRole } from "@/features/members/types";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({
      workspaceId: z.string()
    })),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { workspaceId } = c.req.valid("query");

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId
      });
      if(!member)
        return c.json({
          error: "Unauthorized",
        }, 401);

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.orderDesc("$createdAt")
        ]
      );

      return c.json({
        data: projects
      });
    }
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
      const { name, imageUrl, workspaceId } = c.req.valid("form");
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      // Check workspaceId
      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId
      });
      if(!member)
        return c.json({
          error: "Unauthorized"
        }, 401);

      let uploadedImageUrl: string | undefined;
      let imageId: string | undefined;

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
        imageId = file.$id;
      }

      const project = await databases.createDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        ID.unique(),
        {
          name,
          imageId,
          userId: user.$id,
          imageUrl: uploadedImageUrl,
          workspaceId
        }
      );

      return c.json({
        data: project
      });
    }
  )
  .patch(
      "/:projectId",
      sessionMiddleware,
      zValidator("form", updateProjectSchema),
      async (c) => {
        const { projectId } = c.req.param();
        const { name, imageUrl, workspaceId } = c.req.valid("form");
        
        const databases = c.get("databases");
        const storage = c.get("storage");
        const user = c.get("user");
  
        const currentProject = await databases.getDocument<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          projectId
        );
        if(!currentProject)
          return c.json({
            error: "Project not found"
          }, 404);

        // Check if the user is an admin of the workspace
        const member = await getMember({
          databases,
          userId: user.$id,
          workspaceId: currentProject.workspaceId
        });
        if(!member)
          return c.json({
            error: "Unauthorized"
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
  
        const project = await databases.updateDocument<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          projectId,
          {
            name,
            imageUrl: uploadedImageUrl
          }
        );
        
        return c.json({
          data: project
        });
      }
    );

export default app;