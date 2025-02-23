import { json } from "@remix-run/node";
import { useNavigation, useLoaderData, Outlet } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Card, BlockStack, Text, SkeletonPage, SkeletonBodyText, InlineStack, Badge } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { GapBetweenTitleAndContent } from "../../constants";
import { JsonData } from "../../adminBackend/service/dto/jsonData";
import bundleBuilderRepository from "~/adminBackend/repository/impl/BundleBuilderRepository";
import styles from "./route.module.css";
import { AuthorizationCheck } from "~/adminBackend/service/utils/AuthorizationCheck";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request);

    console.log("I'm on bundleID loader");

    const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));

    if (!isAuthorized) {
        throw new Response(null, {
            status: 404,
            statusText: "Not Found",
        });
    }

    const bundleBuilder = await bundleBuilderRepository.get(Number(params.bundleid), session.shop);

    if (!bundleBuilder) {
        throw new Response(null, {
            status: 404,
            statusText: "Not Found",
        });
    }

    return json(new JsonData(true, "success", "Bundle succesfuly retrieved", [], bundleBuilder), { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    // const { admin, session } = await authenticate.admin(request);

    // const formData = await request.formData();
    // const action = formData.get("action");

    console.log("I'm on bundleID", action);

    switch (action) {
        default: {
            return json(
                {
                    ...new JsonData(true, "success", "This is the default action that doesn't do anything."),
                },
                { status: 200 },
            );
        }
    }
};

export default function Index() {
    const nav = useNavigation();
    const isLoading: boolean = nav.state === "loading";
    const isSubmitting: boolean = nav.state === "submitting";

    //Data from the loader
    const serverBundle = useLoaderData<typeof loader>().data;

    return (
        <>
            {isLoading || isSubmitting ? (
                <SkeletonPage primaryAction>
                    <BlockStack gap="500">
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                    </BlockStack>
                </SkeletonPage>
            ) : (
                <div>
                    <div className={styles.sticky}>
                        <Card padding={"300"}>
                            <InlineStack gap={GapBetweenTitleAndContent} align="center">
                                <Text variant="headingMd" as="h1">
                                    <InlineStack gap={"100"} align="center">
                                        <Text as="p">
                                            <u>Editing: </u>
                                        </Text>
                                        <Text as="p" fontWeight="bold">
                                            {serverBundle.title} | Bundle ID: {serverBundle.id}
                                        </Text>
                                    </InlineStack>
                                </Text>
                                {serverBundle.published ? <Badge tone="success">Active</Badge> : <Badge tone="info">Draft</Badge>}
                            </InlineStack>
                        </Card>
                    </div>
                    <Outlet />
                </div>
            )}
        </>
    );
}
