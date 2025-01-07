import { getCurrentUser } from "./server/queries";

export type User = Awaited<ReturnType<typeof getCurrentUser>>