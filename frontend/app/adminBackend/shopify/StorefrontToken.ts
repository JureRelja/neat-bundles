import { AdminApiContext } from "@shopify/shopify-app-remix/server";

export class StorefrontToken {
    static async createToken(admin: AdminApiContext) {
        const response = await admin.graphql(
            `#graphql
            mutation StorefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
              storefrontAccessTokenCreate(input: $input) {
                userErrors {
                  field
                  message
                }
                shop {
                  id
                }
                storefrontAccessToken {
                  accessScopes {
                    handle
                  }
                  accessToken
                  titleb
                }
              }
            }`,
            {
                variables: {
                    input: {
                        title: "New Storefront Access Token",
                    },
                },
            },
        );

        const data = await response.json();

        if (data.data.userErrors && data.data.userErrors.length > 0) {
            throw new Error(data.data.userErrors[0].message);
        }

        return data.data.storefrontAccessTokenCreate.storefrontAccessToken.accessToken;
    }
}
