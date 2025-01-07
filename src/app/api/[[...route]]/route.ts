import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import auth from "@/features/auth/server/route";
import workspaces from "@/features/workspaces/server/route";

 /* eslint-disable @typescript-eslint/no-unused-vars */
export const runtime = 'edge'

const app = new Hono().basePath('/api')

const routes = app
  .route("/auth", auth)
  .route("/workspaces", workspaces);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);

export type AppType = typeof routes;