import { Hono } from "hono";
import { cache } from 'hono/cache'
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ID, Query } from "node-appwrite";

import { sessionMiddleware } from "@/lib/middlewares/session-middleware";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID, TASKS_ID } from "@/config";

import { Project } from "../types";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { createAdminClient } from "@/lib/server/appwrite";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskStatus } from "@/features/tasks/types";

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
      if (!member)
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
  .get(
    "/:projectId",
    sessionMiddleware,
    zValidator("param", z.object({
      projectId: z.string()
    })),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { projectId } = c.req.valid("param");

      const project = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );
      if(!project)
        return c.json({
          error: "Project not found"
        }, 404);

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: project.workspaceId
      });
      if (!member)
        return c.json({
          error: "Unauthorized",
        }, 401);

      return c.json({
        data: project
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
      if (!member)
        return c.json({
          error: "Unauthorized"
        }, 401);

      let uploadedImageUrl  = null;
      let imageId = null;

      if (imageUrl instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          imageUrl
        );

        uploadedImageUrl = `/api/projects/background-image/${file.$id}`;
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
      const { name, imageUrl } = c.req.valid("form");

      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const currentProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );
      if (!currentProject)
        return c.json({
          error: "Project not found"
        }, 404);

      const oldProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );
      if (!oldProject)
        return c.json({
          error: "Project not found"
        }, 404);

      // Check if the user is an admin of the workspace
      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: currentProject.workspaceId
      });
      if (!member)
        return c.json({
          error: "Unauthorized"
        }, 401);

      let uploadedImageUrl = oldProject.imageUrl;
      let imageId = oldProject.imageId;
      if (imageUrl instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          imageUrl
        );

        uploadedImageUrl = `/api/projects/background-image/${file.$id}`;
        imageId = file.$id;
      }

      const project = await databases.updateDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
        {
          name,
          imageId,
          imageUrl: uploadedImageUrl,
        }
      );

      return c.json({
        data: project
      });
    }
  )
  .delete(
    "/:projectId",
    sessionMiddleware,
    async (c) => {
      const { projectId } = c.req.param();
      const databases = c.get("databases");
      const storage = c.get("storage");
      const { $id : userId} = c.get("user");

      const currentProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );
      if (!currentProject)
        return c.json({
          error: "Project not found"
        }, 404);

      const member = await getMember({
        databases,
        userId: userId,
        workspaceId: currentProject.workspaceId
      });
      if (!member)
        return c.json({
          error: "You are not allowed to delete this project"
        }, 401);

      // Delete Bucket
      if (currentProject.imageId)
        await storage.deleteFile(IMAGES_BUCKET_ID, currentProject.imageId);

      // Delete Workspace
      await databases.deleteDocument(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );

      return c.json({
        data: currentProject
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
  )
  .get(
    "/:projectId/analytics",
    sessionMiddleware,
    zValidator("param", z.object({
      projectId: z.string()
    })),
    async (c) => {
      const { projectId } = c.req.valid("param");
      const databases = c.get("databases");
      const user = c.get("user");

      const currentProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );
      if (!currentProject)
        return c.json({
          error: "Project not found"
        }, 404);

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: currentProject.workspaceId
      });
      if (!member)
        return c.json({
          error: "Unauthorized"
        }, 401);

      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const thisMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      const thisMonthTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );
      const lastMonthTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
        ]
      );
      const taskCount = thisMonthTasks.total;
      const taskDifference = taskCount - lastMonthTasks.total;

      //----------------------------------------------------------------------------------------
      const thisMonthAssignedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),
          Query.equal("assignedId", user.$id),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );
      const lastMonthAssignedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),
          Query.equal("assignedId", user.$id),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
        ]
      );
      const assignedTaskCount = thisMonthAssignedTasks.total;
      const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;

      //----------------------------------------------------------------------------------------
      const thisMonthIncompleteTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );
      const lastMonthIncompleteTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
        ]
      );
      const incompleteTaskCount = thisMonthIncompleteTasks.total;
      const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompleteTasks.total;

      //----------------------------------------------------------------------------------------
      const thisMonthCompletedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),
          Query.equal("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );
      const lastMonthCompletedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
        ]
      );
      const completedTaskCount = thisMonthCompletedTasks.total;
      const completedTaskDifference = completedTaskCount - lastMonthCompletedTasks.total;

      //----------------------------------------------------------------------------------------
      const thisMonthOverDueTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.lessThan("dueDate", now.toISOString()),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );
      const lastMonthOverDueTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.lessThan("dueDate", now.toISOString()),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
        ]
      );
      const overDueTaskCount = thisMonthOverDueTasks.total;
      const overDueTaskDifference = overDueTaskCount - lastMonthOverDueTasks.total;

      return c.json({
        data: {
          taskCount,
          taskDifference,
          assignedTaskCount,
          assignedTaskDifference,
          completedTaskCount,
          completedTaskDifference,
          incompleteTaskCount,
          incompleteTaskDifference,
          overDueTaskCount,
          overDueTaskDifference
        }
      });
    }
  )
  ;

export default app;