import { json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Text, Button, Banner, InlineGrid, Divider } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { JsonData } from "../../adminBackend/service/dto/jsonData";
import styles from "./route.module.css";
import userRepository from "~/adminBackend/repository/impl/UserRepository";
import { BundleBuilderRepository } from "~/adminBackend/repository/impl/BundleBuilderRepository";
import type { BundleBuilder } from "@db/server";
import { AuthorizationCheck } from "~/adminBackend/service/utils/AuthorizationCheck";
import { GapBetweenSections, GapInsideSection, LargeGapBetweenSections } from "~/constants";
import { EditIcon, ExternalIcon } from "@shopify/polaris-icons";
import { Shop } from "~/adminBackend/shopifyGraphql/graphql";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { session, admin, redirect } = await authenticate.admin(request);

    const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));

    if (!isAuthorized) {
        throw new Response(null, {
            status: 404,
            statusText: "Not Found",
        });
    }

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect("/app");

    if (!params.bundleid) {
        throw new Response(null, {
            status: 404,
            statusText: "Bundle id is required",
        });
    }

    const bundleBuilder: BundleBuilder | null = await BundleBuilderRepository.getBundleBuilderById(Number(params.bundleid));

    if (!bundleBuilder) {
        throw new Response(null, {
            status: 404,
            statusText: "Bundle with this id not found",
        });
    }

    //Url of the bundle page
    const primaryDomainResponse = await admin.graphql(
        `#graphql
            query getStore {
            shop {
                
                primaryDomain {
                    url
                }
                
            }
            }`,
    );
    const primaryDomain: Partial<Shop> = (await primaryDomainResponse.json()).data;

    const userPrimaryDomain = primaryDomain?.primaryDomain?.url as string;

    return json(new JsonData(true, "success", "Loader response", [], { bundleBuilder, userPrimaryDomain }), { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    // const { admin, session } = await authenticate.admin(request);

    // const formData = await request.formData();
    // const action = formData.get("action");

    return json(
        {
            ...new JsonData(true, "success", "This is the default action that doesn't do anything."),
        },
        { status: 200 },
    );
};

export default function Index() {
    const params = useParams();

    const loaderData = useLoaderData<typeof loader>();

    return (
        <div className={styles.fadeIn}>
            <BlockStack gap={"1000"} inlineAlign="center">
                <Banner title="Congratulations! You have successfully created your first bundle." tone="success" onDismiss={() => {}}>
                    <BlockStack gap={GapInsideSection}>
                        <Divider borderColor="transparent" borderWidth="100" />

                        <BlockStack gap={LargeGapBetweenSections}>
                            <Text as="p">Continue editing your bundle or check it out live on your store.</Text>
                            <InlineGrid gap={GapBetweenSections} columns={2}>
                                <Button url={`/app/edit-bundle-builder/${params.bundleid}/builder`} icon={EditIcon}>
                                    Edit bundle
                                </Button>
                                <Button
                                    variant="primary"
                                    icon={ExternalIcon}
                                    url={`${loaderData.data.userPrimaryDomain}/apps/nb/widgets/${loaderData.data.bundleBuilder.id}`}
                                    target="_blank">
                                    See live on your store
                                </Button>
                            </InlineGrid>
                        </BlockStack>

                        <Divider borderColor="transparent" borderWidth="100" />
                    </BlockStack>
                </Banner>
            </BlockStack>
        </div>
    );
}
