import { UrlRedirectCreatePayload } from "~/shopifyGraphql/graphql";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";

export class ShopifyRedirectRepository {
    public static async createProductToBundleRedirect(admin: AdminApiContext, pageHandle: string, productHandle: string) {
        const response = await admin.graphql(
            `#graphql
            mutation createProductToBundleRedirect($input: UrlRedirectInput!) {
              urlRedirectCreate(urlRedirect: $input) {
                urlRedirect {
                  id
                }
                userErrors {
                    field
                    message
                  }
              }
            }`,
            {
                variables: {
                    input: {
                        target: `/pages/${pageHandle}`,
                        path: `/products/${productHandle}`,
                    },
                },
            },
        );

        const data = await response.json();

        const urlRedirect: UrlRedirectCreatePayload = data.data.urlRedirectCreate;

        if (urlRedirect.userErrors && urlRedirect.userErrors.length > 0) {
            return false;
        }

        return true;
    }
}
