import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { OnlineStoreTheme, OnlineStoreThemeConnection, OnlineStoreThemeFileBodyText } from "~/adminBackend/shopifyGraphql/graphql";
import { getMaxListeners } from "events";

class ShopifyThemesRepository {
    public async getAllThemes(admin: AdminApiContext): Promise<OnlineStoreTheme[]> {
        const response = await admin.graphql(`
            #graphql
            query getThemes {
                themes(first: 20) {
                    nodes {
                        name
                        processing
                        role
                        files(filenames: ["sections*.json", "templates*.json"]) {
                            nodes {
                                filename
                                body {
                                    __typename
                                }
                            }
                        }
                    }
                }
            }`);

        const data: OnlineStoreThemeConnection = (await response.json()).data.themes;

        return data.nodes;
    }

    public async getMainThemeWithTandS(admin: AdminApiContext): Promise<OnlineStoreTheme> {
        const response = await admin.graphql(`
            #graphql
            query getThemes {
                themes(first: 1, roles: MAIN) {
                    nodes {
                        name
                        processing
                        role
                        files(filenames: ["sections*.json", "templates*.json"]) {
                            nodes {
                                filename
                                body {
                                    __typename
                                    ... on OnlineStoreThemeFileBodyText {
                                        content
                                    }

                                }
                            }
                        }
                    }
                }
            }`);

        const data: OnlineStoreThemeConnection = (await response.json()).data.themes;

        return data.nodes[0];
    }

    public async getMainThemeWithSettings(admin: AdminApiContext): Promise<OnlineStoreTheme> {
        const response = await admin.graphql(`
            #graphql
            query getThemes {
                themes(first: 1, roles: MAIN) {
                    nodes {
                        name
                        processing
                        role
                        files(filenames: ["*settings_data.json"]) {
                            nodes {
                                filename
                                body {
                                    __typename
                                    ... on OnlineStoreThemeFileBodyText {
                                        content
                                    }

                                }
                            }
                        }
                    }
                }
            }`);

        const data: OnlineStoreThemeConnection = (await response.json()).data.themes;

        return data.nodes[0];
    }
}

const shopifyThemesRepository = new ShopifyThemesRepository();

export default shopifyThemesRepository;
