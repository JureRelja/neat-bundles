import { json } from '@remix-run/node';
import { useNavigate, useNavigation, useLoaderData, Outlet } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Card, BlockStack, Text, SkeletonPage, SkeletonBodyText, InlineStack, Badge, Divider } from '@shopify/polaris';
import { authenticate } from '../../shopify.server';
import { GapBetweenTitleAndContent, GapInsideSection } from '../../constants';
import db from '../../db.server';
import { inclBundleFullStepsBasic } from '../../adminBackend/service/dto/Bundle';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import { useNavigateSubmit } from '../../hooks/useNavigateSubmit';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const bundleBuilder = await db.bundleBuilder.findUnique({
        where: {
            id: Number(params.bundleid),
        },
        include: {
            ...inclBundleFullStepsBasic,
        },
    });

    if (!bundleBuilder) {
        throw new Response(null, {
            status: 404,
            statusText: 'Not Found',
        });
    }

    return json(new JsonData(true, 'success', 'Bundle succesfuly retrieved', [], bundleBuilder), { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get('action');

    return json(
        {
            ...new JsonData(true, 'success', "This is the default action that doesn't do anything."),
        },
        { status: 200 },
    );
};

export default function Index() {
    const nav = useNavigation();
    const navigate = useNavigate();
    const isLoading: boolean = nav.state === 'loading';
    const isSubmitting: boolean = nav.state === 'submitting';
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit with a navigation (the same if you were to use a From with a submit button)

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
                <>
                    <Divider borderWidth="100" borderColor="transparent" />

                    <Card padding={'300'}>
                        <InlineStack gap={GapBetweenTitleAndContent} align="center">
                            <Text variant="headingLg" as="h1">
                                {serverBundle.title} | Bundle ID: {serverBundle.id}
                            </Text>
                            {serverBundle.published ? <Badge tone="success">Active</Badge> : <Badge tone="info">Draft</Badge>}
                        </InlineStack>
                    </Card>
                    <Outlet />
                </>
            )}
        </>
    );
}
