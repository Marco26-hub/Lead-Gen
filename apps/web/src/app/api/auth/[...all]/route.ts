/* Better Auth catch-all handler — powers /api/auth/* (sign-in, sign-out,
   session, etc.). This path sits under /api so the locale middleware skips
   it automatically. */
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
