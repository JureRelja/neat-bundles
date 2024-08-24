// app/sessions.ts
import {
  createCookieSessionStorage,
  json,
  TypedResponse,
  Session,
} from "@remix-run/node";
import { randomUUID } from "crypto";
import { redisClient } from "../shopify.server";
import db from "../db.server";
import { BundleAllResources, bundleAllResources } from "~/types/Bundle";

type SessionId = {
  customerId: string;
};

type SessionFlashData = {
  error: string;
};

// Session data availabe to the customer browsing the shopify store
class SessionData {
  private customerId: string;
  private bundlesActive: BundleAllResources[] = [];

  constructor(customerId: string) {
    this.customerId = customerId;
  }

  public async addActiveBundle(bundleId: number) {
    if (!bundleId) return;

    const bundle = await db.bundle.findUnique({
      where: { id: bundleId },
      include: bundleAllResources,
    });

    if (bundle) {
      this.bundlesActive.push(bundle);
    }
  }

  public getActiveBundle(bundleId: number): BundleAllResources | undefined {
    return this.bundlesActive.find((bundle) => bundle.id === bundleId);
  }

  public deleteActiveBundle(bundleId: number) {
    this.bundlesActive = this.bundlesActive.filter(
      (bundle) => bundle.id !== bundleId,
    );
  }
}

//Generating a session cookie
const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionId, SessionFlashData>({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: "store_session",
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax",
      secrets: [process.env.STORE_COOKIE_SECRET || ""],
      secure: true,
    },
  });

//Session handler for loader and action
export const sessionHandler = async (
  request: Request,
): Promise<{
  session: Session<SessionId, SessionFlashData>;
  jsonResponse: (additonalData?: unknown) => Promise<
    TypedResponse<{
      data: unknown;
      headers: {
        "Set-Cookie": string;
        "Access-Control-Allow-Origin": string;
      };
      status: number;
    }>
  >;
}> => {
  const session = await getSession(request.headers.get("store_session"));

  if (!session.has("customerId")) {
    const customerId = randomUUID();

    session.set("customerId", customerId);
    redisClient.hSet(customerId, { ...new SessionData(customerId) });
    redisClient.expire(customerId, 60 * 60 * 24); // Delete data after 1 day
  }

  const jsonReponse = async (additonalData?: unknown) => {
    return json({
      data: additonalData,
      headers: {
        "Set-Cookie": await commitSession(session),
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });
  };

  return {
    session: session,
    jsonResponse: jsonReponse,
  };
};
