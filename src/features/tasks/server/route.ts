import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/middlewares/session-middleware";
import { createTaskSchema } from "@/features/tasks/schema";
import { getMember } from "@/features/members/utils";
import { Task, TaskStatus } from "../types";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { Project } from "@/features/projects/types";
import { Member } from "@/features/members/types";
import { createAdminClient } from "@/lib/server/appwrite";

const app = new Hono()
  .delete(
    "/:taskId",
    sessionMiddleware,
    zValidator("param", z.object({
      taskId: z.string()
    })),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");

      const { taskId } = c.req.valid("param");
    
      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );
      if(!task)
        return c.json({
          error: "Task not found"
        }, 404);

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: task.workspaceId
      });
      if (!member)
        return c.json({
          error: "Unauthorized"
        }, 401);

      await databases.deleteDocument(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );

      return c.json({
        data: task
      });
    }
  )
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({
      projectId: z.string().nullish(),
      workspaceId: z.string(),
      status: z.nativeEnum(TaskStatus).nullish(),
      assignedId: z.string().nullish(),
      dueDate: z.string().nullish(),
      search: z.string().nullish()
    })),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { users } = await createAdminClient();
      const { projectId, workspaceId, status, assignedId, dueDate, search } = c.req.valid("query");

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId
      });
      if (!member)
        return c.json({
          error: "Unauthorized"
        }, 401);

      const query = [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt")
      ];

      if (projectId) {
        query.push(Query.equal("projectId", projectId));
      }

      if (status) {
        query.push(Query.equal("status", status));
      }

      if (assignedId) {
        query.push(Query.equal("assignedId", assignedId));
      }

      if (dueDate) {
        query.push(Query.equal("dueDate", dueDate ));
      }

      if (search) {
        query.push(Query.search("name", search));
      }

      const tasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        query
      );

      const projectIds = tasks.documents.map(task => task.projectId);
      const assignedIds = tasks.documents.map(task => task.assignedId);

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectIds.length > 0
          ? [Query.contains("$id", projectIds)]
          : []
      );

      const members = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        assignedIds.length > 0
          ? [Query.contains("userId", assignedIds)]
          : []
      );

      const assignees = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);
          return {
            ...member,
            name: user.name,
            email: user.email
          }
        }));

      const populatedTasks = tasks.documents.map((task) => {
        const project = projects.documents.find((project) => project.$id === task.projectId);
        const assignee = assignees.find((assignee) => assignee.userId === task.assignedId);

        return {
          ...task,
          project,
          assignee
        }
      });

      return c.json({
        data: {
          ...tasks,
          documents: populatedTasks
        }
      }, 200);
    }
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");

      const {
        assignedId,
        dueDate,
        name,
        projectId,
        status,
        workspaceId,
        description
      } = c.req.valid("json");

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId
      });
      if (!member)
        return c.json({
          error: "Unauthorized"
        }, 401);

      const highestPositionTask = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("status", status),
          Query.orderDesc("position"),
          Query.limit(1)
        ]
      );

      const newPosition =
        highestPositionTask.documents.length === 0
          ? 1
          : highestPositionTask.documents[0].position + 1000;

      const createdTask = await databases.createDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        ID.unique(),
        {
          name,
          status,
          workspaceId,
          dueDate,
          assignedId,
          description,
          projectId,
          position: newPosition,
          createdById: user.$id,
        }
      );

      return c.json({
        data: createdTask
      });
    }
  )
  .patch(
    "/:taskId",
    sessionMiddleware,
    zValidator("param", z.object({
      taskId: z.string()
    })),
    zValidator("json", createTaskSchema.partial()),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { taskId } = c.req.valid("param");

      const {
        assignedId,
        dueDate,
        name,
        projectId,
        status,
        description
      } = c.req.valid("json");

      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );
      if(!task)
        return c.json({
          error: "Task not found"
        }, 404);

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: task.workspaceId
      });
      if (!member)
        return c.json({
          error: "Unauthorized"
        }, 401);

      const updatedTask = await databases.updateDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        task.$id,
        {
          name,
          status,
          dueDate,
          assignedId,
          description,
          projectId,
        }
      );

      return c.json({
        data: updatedTask
      });
    }
  )
  .get(
    "/:taskId",
    sessionMiddleware,
    zValidator("param", z.object({
      taskId: z.string()
    })),
    async (c) => {
      const databases = c.get("databases");
      const currentUser = c.get("user");
      const { users } = await createAdminClient();
      const { taskId } = c.req.valid("param");

      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );
      if(!task)
        return c.json({
          error: "Task not found"
        }, 404);

      const isCurrentUserMember = await getMember({
        databases,
        userId: currentUser.$id,
        workspaceId: task.workspaceId
      });
      if (!isCurrentUserMember)
        return c.json({
          error: "Unauthorized"
        }, 401);

      const project = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        task.projectId
      );

      const member = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        [
          Query.equal("userId", task.assignedId),
          Query.equal("workspaceId", task.workspaceId)
        ]
      );

      const user = await users.get(task.assignedId);

      const assignee = {
        ...member.documents[0],
        name: user.name,
        email: user.email
      };

      return c.json({
        data: {
          ...task,
          project,
          assignee
        }
      });
    }
  );

export default app;