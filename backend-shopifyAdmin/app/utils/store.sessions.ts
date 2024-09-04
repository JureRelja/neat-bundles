// app/sessions.ts
import { createCookieSessionStorage, Session } from "@remix-run/node";
import { randomUUID } from "crypto";
import { redisClient } from "../shopify.server";
import { BundleAllResources } from "~/types/Bundle";

type SessionId = {
  customerId: string;
  activeBundles: string[];
};

type SessionFlashData = {
  error: string;
};

// Session data availabe to the customer browsing the shopify store

type SessionData = {
  customerId: string;
  bundlesActive: BundleAllResources[];
  newActiveBundles?: string[];
};

//Generating a session cookie
export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionId, SessionFlashData>({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: "store_session",
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "none",
      partitioned: true,
      secrets: [process.env.STORE_COOKIE_SECRET || ""],
      secure: true,
    },
  });

//Session handler for loader and action
export const sessionHandler = async (
  request: Request,
): Promise<Session<SessionId, SessionFlashData>> => {
  const session = await getSession(request.headers.get("Cookie"));

  if (!session.has("customerId") || !session.get("customerId")) {
    const customerId = randomUUID();
    session.set("customerId", customerId);
  }

  const redisSession = await redisClient.hGet(
    session.get("customerId") as string,
    "activeBundles",
  );

  const customerId = session.get("customerId") as string;

  if (!redisSession) {
    await redisClient.hSet(customerId, [
      "customerId",
      customerId,
      "activeBundles",
      JSON.stringify(new Map<number, BundleAllResources>()),
    ]);
    await redisClient.expire(customerId, 60 * 60 * 24); // Delete data after 1 day
  }

  return session;
};
