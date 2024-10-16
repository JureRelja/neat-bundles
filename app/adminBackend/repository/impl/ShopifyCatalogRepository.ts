import { AdminApiContext } from '@shopify/shopify-app-remix/server';
import { Catalog } from '@shopifyGraphql/graphql';
import userRepository from './UserRepository';

export class ShopifyCatalogRepository {
    //** Get the publication id of the "Online store" sales channel */
    public static async getOnlineStorePublicationId(admin: AdminApiContext) {
        const getAllPublicationsResponse = await admin.graphql(
            `#graphql
                query getAllPublications {
                    catalogs (first: 100, type: APP) {
                        nodes {
                        id
                        title
                        publication {
                            id
                            autoPublish
                        }
                        }
                    }
                    }`,
        );

        const allPUblicationsData: Catalog[] = (await getAllPublicationsResponse.json()).data.catalogs.nodes;

        const onlineStorePublication = allPUblicationsData.find((publication) => publication.title.includes('Online Store'));

        if (!onlineStorePublication || !onlineStorePublication.publication || !onlineStorePublication.publication.id) {
            return null;
        }

        return onlineStorePublication.publication.id;
    }

    /**
     * Publish a product to online store sales channel
     *
     * @param admin AdminApiContext
     * @param productId GraphQL ID of the product
     * @return     True if the product was published successfully, false otherwise
     */
    public static async publishProductToOnlineStore(admin: AdminApiContext, productId: string, storeUrl: string): Promise<boolean> {
        const user = await userRepository.getUserByStoreUrl(storeUrl);
        if (!user) throw Error('No user');
        const onlineStorePublicationId = user.onlineStorePublicationId;

        const response = await admin.graphql(
            `#graphql
            mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
              publishablePublish(id: $id, input: $input) {
                publishable {
                  availablePublicationsCount {
                    count
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }`,
            {
                variables: {
                    id: productId,
                    input: {
                        publicationId: onlineStorePublicationId,
                    },
                },
            },
        );

        const data = await response.json();

        if (data.data.publishablePublish.userErrors && data.data.publishablePublish.userErrors.length > 0) {
            return false;
        }

        return true;
    }
}
