import { json, redirect } from '@remix-run/node';
import { useActionData, useNavigate, Form, useNavigation, useLoaderData, useParams } from '@remix-run/react';
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
} from '@shopify/polaris';
import { DeleteIcon, PlusIcon, ArrowDownIcon, ArrowUpIcon, PageAddIcon, EditIcon, QuestionCircleIcon, ExternalIcon, SettingsIcon, RefreshIcon } from '@shopify/polaris-icons';
import { useAppBridge, Modal, TitleBar } from '@shopify/app-bridge-react';
import { authenticate } from '../../shopify.server';
import { BigGapBetweenSections } from '../../constants';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '../../hooks/useAsyncSubmit';
import { useNavigateSubmit } from '../../hooks/useNavigateSubmit';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    // const bundleBuilder = await db.bundleBuilder.findUnique({
    //     where: {
    //         id: Number(params.bundleid),
    //     },
    //     include: inclBundleFullStepsBasic,
    // });

    // if (!bundleBuilder) {
    //     throw new Response(null, {
    //         status: 404,
    //         statusText: 'Not Found',
    //     });
    // }

    // const user = await userRepository.getUserByStoreUrl(admin, session.shop);

    // //Url of the bundle page
    // const bundleBuilderPageUrl = `${user.primaryDomain}/pages/${bundleBuilder.bundleBuilderPageHandle}`;

    // const bundleBuilderWithPageUrl: BundleFullStepBasicServer = { ...bundleBuilder, bundleBuilderPageUrl };

    return json(new JsonData(true, 'success', 'Bundle succesfuly retrieved', [], null), { status: 200 });
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

    const asyncSubmit = useAsyncSubmit(); //Function for doing the submit action where the only data is action and url

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
                            </BlockStack>
                            {/* Labels settings, commented for now */}
                            {/* <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                <Box as="section">
                  <BlockStack gap="400">
                    <Text as="h3" variant="headingMd">
                      Dimensions
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Interjambs are the rounded protruding bits of your puzzlie
                      piece
                    </Text>
                  </BlockStack>
                </Box>
                <Card>
                  <BlockStack gap={GapInsideSection}>
                    <Text as="p">Labels</Text>
                    <InlineGrid columns={2} gap={HorizontalGap}>
                      <BlockStack gap={GapInsideSection} inlineAlign="start">
                        <TextField
                          label='"Add to bundle" btn label'
                          name={`addToBundleBtn`}
                          value={settingsState.bundleLabels?.addToBundleBtn}
                          autoComplete="off"
                          onChange={(newLabel: string) => {
                            setSetttingsState(
                              (prevSettings: SettingsWithAllResources) => {
                                if (!prevSettings.bundleLabels)
                                  return prevSettings;

                                return {
                                  ...prevSettings,
                                  bundleLabels: {
                                    ...prevSettings.bundleLabels,
                                    addToBundleBtn: newLabel,
                                  },
                                };
                              },
                            );
                          }}
                        />
                        <TextField
                          label='"Next" button label'
                          name={`nextStepBtn`}
                          value={settingsState.bundleLabels?.nextStepBtn}
                          type="text"
                          autoComplete="off"
                          onChange={(newLabel: string) => {
                            setSetttingsState(
                              (prevSettings: SettingsWithAllResources) => {
                                if (!prevSettings.bundleLabels)
                                  return prevSettings;

                                return {
                                  ...prevSettings,
                                  bundleLabels: {
                                    ...prevSettings.bundleLabels,
                                    addToBundleBtn: newLabel,
                                  },
                                };
                              },
                            );
                          }}
                        />
                      </BlockStack>
                      <BlockStack gap={GapInsideSection}>
                        <TextField
                          label='"View product" btn label'
                          name={`viewProductBtn`}
                          value={settingsState.bundleLabels?.viewProductBtn}
                          type="text"
                          autoComplete="off"
                          onChange={(newLabel: string) => {
                            setSetttingsState(
                              (prevSettings: SettingsWithAllResources) => {
                                if (!prevSettings.bundleLabels)
                                  return prevSettings;

                                return {
                                  ...prevSettings,
                                  bundleLabels: {
                                    ...prevSettings.bundleLabels,
                                    addToBundleBtn: newLabel,
                                  },
                                };
                              },
                            );
                          }}
                        />
                        <TextField
                          label='"Previous" button label'
                          value={settingsState.bundleLabels?.prevStepBtn}
                          type="text"
                          name={`prevStepBtn`}
                          autoComplete="off"
                          onChange={(newLabel: string) => {
                            setSetttingsState(
                              (prevSettings: SettingsWithAllResources) => {
                                if (!prevSettings.bundleLabels)
                                  return prevSettings;

                                return {
                                  ...prevSettings,
                                  bundleLabels: {
                                    ...prevSettings.bundleLabels,
                                    addToBundleBtn: newLabel,
                                  },
                                };
                              },
                            );
                          }}
                        />
                      </BlockStack>
                    </InlineGrid>
                  </BlockStack>
                </Card>
              </InlineGrid> */}
                        </Form>
                    </Page>
                </>
            )}
        </>
    );
}
