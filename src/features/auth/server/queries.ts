"use server"

import { createSessionClient } from "@/lib/server/appwrite";

export const getCurrentUser = async () => {
  try {
    const { account } = await createSessionClient();

    return await account.get();
  } catch(e) {
    console.error(e);
    return null;
  }
}