import { useNavigation, json, useLoaderData, Link, useNavigate } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Page, Card, BlockStack, SkeletonPage, Text, SkeletonBodyText, Divider, FooterHelp } from '@shopify/polaris';
import { authenticate } from '~/shopify.server';
import { JsonData } from '@adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '~/hooks/useAsyncSubmit';
import { useNavigateSubmit } from '~/hooks/useNavigateSubmit';
import { GapBetweenSections } from '~/constants';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, admin } = await authenticate.admin(request);

    return null;
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

    const loaderResponse = useLoaderData<typeof loader>();
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
                        title="Want to request a feature?"
                        backAction={{
                            content: 'Back',
                            onAction: async () => {
                                navigate(-1);
                            },
                        }}>
                        <BlockStack gap={GapBetweenSections}>
                            <Text as="p">
                                My team and I have been working hard to make Neat Bundles into a product you love and want to share with others, but we understand that there is
                                always space for improvement.
                            </Text>

                            <Text as="p">
                                If you have a feature request or a suggestion, we'd love to hear it! Feel free to send us an email describing the feature that you would like Neat
                                Bundles to have. We will do our best to implement that feature as soon as possible.
                            </Text>

                            <Text as="p">
                                Send your feature requests to{' '}
                                <Link to="mailto:contact@neatmerchant.com" target="_blank">
                                    contact@neatmerchant.com
                                </Link>
                                , and we will get back to you as soon as possible. Every feature request will be personally reviewed by me and my team and considered for
                                implementation.
                            </Text>

                            <Text as="p">Thank you for your continued support and for helping us make Neat Bundles even better!</Text>

                            <Text as="p" alignment="end">
                                Jure Reljanovic, the creator of Neat Merchant and Neat Bundles
                            </Text>
                        </BlockStack>

                        {/*   <FooterHelp>
                                    You stuck? <Link to="/app/help">Get help</Link> from us, or <Link to="/app/feature-request">suggest new features</Link>.
                                </FooterHelp> */}
                    </Page>
                </>
            )}
        </>
    );
}
