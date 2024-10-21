import { useNavigation, json, useLoaderData, Link, useNavigate, Form } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Page, Card, BlockStack, SkeletonPage, Text, SkeletonBodyText, Divider, FooterHelp, Banner, Box, Button } from '@shopify/polaris';
import { authenticate } from '~/shopify.server';
import { JsonData } from '@adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '~/hooks/useAsyncSubmit';
import { useNavigateSubmit } from '~/hooks/useNavigateSubmit';
import { GapInsideSection } from '~/constants';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, admin } = await authenticate.admin(request);

    const url = new URL(request.url);

    const variant = url.searchParams.get('variant');

    if (variant === 'upgrade') return json({ type: 'upgrade' });

    if (variant === 'firstPlan') return json({ type: 'firstPlan' });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get('action');

    switch (action) {
        case 'dismissHomePageBanner': {
            break;
        }
        default: {
            return json(
                {
                    ...new JsonData(true, 'success', "This is the default action that doesn't do anything."),
                },
                { status: 200 },
            );
        }
    }
};

export default function Index() {
    const nav = useNavigation();
    const isLoading = nav.state !== 'idle';
    const asyncSubmit = useAsyncSubmit(); //Function for doing the submit action where the only data is action and url
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit action as if form was submitted
    const navigate = useNavigate();

    const loaderResponse = useLoaderData<typeof loader>();
    const thankYouType = loaderResponse.type;

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
                        title="Thank you"
                        backAction={{
                            content: 'Back',
                            onAction: async () => {
                                navigate(-1);
                            },
                        }}>
                        <BlockStack gap={'500'}>
                            {thankYouType === 'firstPlan' && (
                                <BlockStack gap="500">
                                    <Banner title="Thank you for choosing a plan!" tone="success" onDismiss={() => {}}>
                                        <BlockStack gap={GapInsideSection}>
                                            <Text as={'p'} variant="headingMd">
                                                You will be using Neat bundles to let your customer create bundles they love in no time.
                                            </Text>

                                            <Text as={'p'}>
                                                Just before you get there, you just need to quickly go through instalation to get Neat bundles app properly connected to your store.
                                            </Text>
                                        </BlockStack>
                                    </Banner>
                                </BlockStack>
                            )}

                            {thankYouType === 'upgrade' && (
                                <BlockStack gap="500">
                                    <Banner title="Thank you upgrading!" tone="success" onDismiss={() => {}}>
                                        <BlockStack gap={GapInsideSection}>
                                            <Text as={'p'} variant="headingMd">
                                                We hope that new features will give you plenty of new power.
                                            </Text>
                                        </BlockStack>
                                    </Banner>
                                </BlockStack>
                            )}

                            <Box width="full">
                                <BlockStack inlineAlign="end">
                                    <Form method="post">
                                        <Button
                                            variant="primary"
                                            onClick={() => {
                                                if (thankYouType === 'upgrade') {
                                                    navigate('/app');
                                                } else if (thankYouType === 'firstPlan') {
                                                    navigate('/app/installation');
                                                }
                                            }}>
                                            Go to bundles
                                        </Button>
                                    </Form>
                                </BlockStack>
                            </Box>

                            <FooterHelp>
                                You stuck? <Link to="/app/help">Get help</Link> from us, or <Link to="/app/feature-request">suggest new features</Link>.
                            </FooterHelp>
                        </BlockStack>
                    </Page>
                </>
            )}
        </>
    );
}
