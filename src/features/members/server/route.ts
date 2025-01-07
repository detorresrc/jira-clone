import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { sessionMiddleware } from "@/lib/middlewares/session-middleware";
import { createAdminClient } from "@/lib/server/appwrite";
import { getMember, getMembers } from "../utils";
import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Query } from "node-appwrite";
import { Member, MemberRole } from "../types";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({
      workspaceId: z.string()
    })),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.valid("query");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id
      });

      if(!member)
        return c.json({
          error: "You are not a member of this workspace"
        }, 401);

      const members = await getMembers({
        databases,
        workspaceId
      });

      const populatedMembers = await Promise.all(
        members.map(async (member) => {
          const user = await users.get(member.userId);
          
          return {
            ...member,
            name: user.name,
            email: user.email
          };
        })
      );

      return c.json({
        data: {
          ...members,
          documents: populatedMembers
        }
      }, 200);
    }
  )
  .delete(
    "/:memberId",
    sessionMiddleware,
    zValidator("param", z.object({
      memberId: z.string()
    })),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { memberId } = c.req.valid("param");

      const memberToDelete = await databases.getDocument<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        memberId
      );

      if(!memberToDelete)
        return c.json({
          error: "Invalid member ID"
        }, 404);

      const { workspaceId } = memberToDelete;

      const allMembersinWorkspace = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", workspaceId)]
      );

      if(allMembersinWorkspace.total === 1)
        return c.json({
          error: "You cannot remove the last member of a workspace"
        }, 400);

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId
      });
      if(!member)
        return c.json({
          error: "You are not a member of this workspace"
        }, 401);

      if(member.$id !== memberToDelete.$id && member.role !== "ADMIN")
        return c.json({
          error: "You are not allowed to remove this member"
        }, 401);

      await databases.deleteDocument(
        DATABASE_ID,
        MEMBERS_ID,
        memberId
      );

      return c.json({
        data: {
          message: "Member removed successfully",
          data: {
            member: memberToDelete
          }
        }
      }, 200);
    }
  )
  .patch(
    "/:memberId",
    sessionMiddleware,
    zValidator("json", z.object({
      role: z.nativeEnum(MemberRole)
    })),
    zValidator("param", z.object({
      memberId: z.string()
    })),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { memberId } = c.req.valid("param");
      const { role } = c.req.valid("json");
    
      const memberToUpdate = await databases.getDocument<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        memberId
      );

      if(!memberToUpdate)
        return c.json({
          error: "Invalid member ID"
        }, 404);
      
      const { workspaceId } = memberToUpdate;

      const allMembersinWorkspace = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", workspaceId)]
      );
      if(allMembersinWorkspace.total === 1)
        return c.json({
          error: "You cannot update the last member of a workspace"
        }, 400);

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId
      });
      if(!member)
        return c.json({
          error: "You are not a member of this workspace"
        }, 401);

      if(member.role !== "ADMIN")
        return c.json({
          error: "You are not allowed to update this member"
        }, 401);

      const updatedMember = await databases.updateDocument<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        memberId,
        {
          role
        }
      );

      return c.json({
        data: {
          message: "Member updated successfully",
          data: {
            member: updatedMember
          }
        }
      }, 200);
    }
  );

export default app;