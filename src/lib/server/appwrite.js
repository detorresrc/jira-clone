"use server";

import "server-only";
import { Account } from "node-appwrite";
import { cookies } from "next/headers";
import { getAppWriteClient } from "@/lib/utils"

export async function createSessionClient() {
  const client = getAppWriteClient();

  const session = await cookies().get("my-custom-session");
  if (!session || !session.value) {
    throw new Error("No session");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function createAdminClient() {
  const client = getAppWriteClient().setKey(process.env.NEXT_APPWRITE_KEY);

  return {
    get account() {
      return new Account(client);
    },
  };
}