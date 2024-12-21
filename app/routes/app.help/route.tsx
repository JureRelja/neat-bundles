import { useNavigation, json, Link, useNavigate } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Page, Card, BlockStack, SkeletonPage, Text, SkeletonBodyText } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";
import { JsonData } from "@adminBackend/service/dto/jsonData";

import { GapBetweenSections } from "~/constants";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticate.admin(request);

    return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
    await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get("action");

    switch (action) {
        case "dismissHomePageBanner": {
            break;
        }
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
    const isLoading = nav.state !== "idle";

    const navigate = useNavigate();

    return (
        <>
            {isLoading ? (
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
                <>
                    <Page
                        title="Need some help?"
                        backAction={{
                            content: "Back",
                            onAction: async () => {
                                navigate(-1);
                            },
                        }}>
                        <BlockStack gap={GapBetweenSections}>
                            <Text as="p">
                                There are two possible explanations for why you are visiting this page. Either you are just exploring, or you have been stuck and really need some
                                help.
                            </Text>

                            <Text as="p">If you are just exploring, that's great! We are happy to have you here.</Text>

                            <Text as="p" fontWeight="bold">
                                If you are stuck, we are here to help you. Please don't hesitate to send us an email describing your problem. We will do our best to help you.
                            </Text>

                            <Text as="p">
                                Send the email to{" "}
                                <Link to="mailto:support@neatmerchant.com" target="_blank">
                                    support@neatmerchant.com
                                </Link>
                                , All the emails are read and replied to by me. I usually reply within 24 hours.
                            </Text>

                            <Text as="p" alignment="end">
                                Jure Reljanovic, the creator of Neat Merchant and NeatBundles
                            </Text>
                        </BlockStack>
                        {/* <FooterHelp>
                            View the <Link to="/app/help">help docs</Link>, <Link to="/app/feature-request">suggest new features</Link>, or{' '}
                            <Link to="mailto:contact@neatmerchant.com" target="_blank">
                                contact us
                            </Link>{' '}
                            for support.
                        </FooterHelp> */}
                    </Page>
                </>
            )}
        </>
    );
}
