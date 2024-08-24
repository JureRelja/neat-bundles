import type {
  HeadersFunction,
  LoaderFunctionArgs,
  Session,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { sessionHandler } from "../store.sessions";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, jsonResponse } = await sessionHandler(request);

  return jsonResponse({ msg: "Hello, World!" });
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const { session, jsonResponse } = await sessionHandler(request);

  return jsonResponse();
};

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
