import { json, redirect } from '@remix-run/node';
import { useActionData, useNavigate, Form, useNavigation, useLoaderData, useParams, Link } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
    Page,
    Card,
    Button,
    BlockStack,
    Text,
    Box,
    SkeletonPage,
    ChoiceList,
    SkeletonBodyText,
    SkeletonDisplayText,
    ButtonGroup,
    DataTable,
    EmptyState,
    InlineStack,
    Badge,
    Select,
    Tooltip,
    Icon,
    InlineGrid,
    Divider,
    FooterHelp,
} from '@shopify/polaris';
import { DeleteIcon, PlusIcon, ArrowDownIcon, ArrowUpIcon, PageAddIcon, EditIcon, QuestionCircleIcon, ExternalIcon, SettingsIcon, RefreshIcon } from '@shopify/polaris-icons';
import { useAppBridge, Modal, TitleBar } from '@shopify/app-bridge-react';
import { authenticate } from '../../shopify.server';
import { BigGapBetweenSections } from '../../constants';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '../../hooks/useAsyncSubmit';
import { useNavigateSubmit } from '../../hooks/useNavigateSubmit';
import globalSettingsRepository from '~/adminBackend/repository/impl/GlobalSettingsRepository';
import userRepository from '~/adminBackend/repository/impl/UserRepository';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const [globalSettings, user] = await Promise.all([globalSettingsRepository.getSettingsByStoreUrl(session.shop), userRepository.getUserByStoreUrl(session.shop)]);

    if (!globalSettings || !user) return redirect('/app');

    return json(new JsonData(true, 'success', 'Global settings retrieved', [], { user, globalSettings }));
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get('action');

    switch (action) {
        case 'updateSettings': {
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
    const navigate = useNavigate();
    const shopify = useAppBridge();
    const isLoading: boolean = nav.state === 'loading';
    const isSubmitting: boolean = nav.state === 'submitting';
    const params = useParams();
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit with a navigation (the same if you were to use a From with a submit button)
    const actionData = useActionData<typeof action>();

    const loaderData = useLoaderData<typeof loader>();

    const data = loaderData.data;

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
                    {/* Edit bundle page */}
                    <Page
                        backAction={{
                            content: 'Products',
                            onAction: async () => {
                                // Save or discard the changes before leaving the page
                                await shopify.saveBar.leaveConfirmation();
                                navigate(-1);
                            },
                        }}
                        title="Global settings"
                        subtitle="Edit the behaviour of all bundles"
                        compactTitle>
                        <Form method="POST" data-discard-confirmation data-save-bar>
                            <BlockStack gap={BigGapBetweenSections}>
                                {/* Show/hide out of stock products */}
                                <InlineGrid columns={{ xs: '1fr', md: '2fr 5fr' }} gap="400">
                                    <Box as="section">
                                        <BlockStack gap="400">
                                            <Text as="h3" variant="headingMd">
                                                Products
                                            </Text>
                                            <Text as="p" variant="bodyMd">
                                                Change settings on how products are displayed and used.
                                            </Text>
                                        </BlockStack>
                                    </Box>
                                    <Card>
                                        <ChoiceList
                                            title="Products"
                                            allowMultiple
                                            name={`showOutOfStockProducts`}
                                            choices={[
                                                {
                                                    label: (
                                                        <InlineStack>
                                                            <Text as={'p'}>Show “out of stock” and unavailable products</Text>
                                                            <Tooltip
                                                                width="wide"
                                                                content="By default, only products that have at least one variant that's in stock at the time of purchase will be displayed. If this is selected, all 'out of stock' products will be visible, but customers won't be able to add the to their bundles.">
                                                                <Icon source={QuestionCircleIcon}></Icon>
                                                            </Tooltip>
                                                        </InlineStack>
                                                    ),
                                                    value: 'true',
                                                },
                                            ]}
                                            selected={['true']}
                                            onChange={(value) => {}}
                                        />
                                    </Card>
                                </InlineGrid>

                                <Divider />

                                {/* Show/hide out of stock products */}
                                <InlineGrid columns={{ xs: '1fr', md: '2fr 5fr' }} gap="400">
                                    <Box as="section">
                                        <BlockStack gap="400">
                                            <Text as="h3" variant="headingMd">
                                                Styles
                                            </Text>
                                            <Text as="p" variant="bodyMd">
                                                Edit colors and other styling options.
                                            </Text>
                                        </BlockStack>
                                    </Box>
                                    <Card>
                                        <Button
                                            variant="primary"
                                            target="_blank"
                                            url={`https://${data.user.storeUrl}/admin/themes/current/editor?context=apps&activateAppId=${data.user.storeUrl}/${'embed_block'}`}>
                                            Activate app
                                        </Button>
                                    </Card>
                                </InlineGrid>

                                <Divider borderColor="transparent" />

                                <FooterHelp>
                                    View the <Link to="/app/featureRequest">help docs</Link>, <Link to="/app/featureRequest">suggest new features</Link>, or{' '}
                                    <Link to="mailto:contact@neatmerchant.com" target="_blank">
                                        contact us
                                    </Link>{' '}
                                    for support.
                                </FooterHelp>
                            </BlockStack>
                        </Form>
                    </Page>
                </>
            )}
        </>
    );
}
