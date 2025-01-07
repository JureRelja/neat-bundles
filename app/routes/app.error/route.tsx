// import { useNavigation, json, useLoaderData, Link, useNavigate, Form } from "@remix-run/react";
// import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
// import { Page, Card, BlockStack, SkeletonPage, Text, SkeletonBodyText, FooterHelp, Banner, Box, Button } from "@shopify/polaris";
// import { authenticate } from "~/shopify.server";
// import { JsonData } from "@adminBackend/service/dto/jsonData";
// import { GapInsideSection } from "~/constants";

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//     await authenticate.admin(request);

//     const url = new URL(request.url);

//     const params = url.searchParams;

//     const errorType = params.get("type");

//     return errorType;
// };

// export const action = async ({ request }: ActionFunctionArgs) => {
//     await authenticate.admin(request);

//     const formData = await request.formData();
//     const action = formData.get("action");

//     switch (action) {
//         case "dismissHomePageBanner": {
//             break;
//         }
//         default: {
//             return json(
//                 {
//                     ...new JsonData(true, "success", "This is the default action that doesn't do anything."),
//                 },
//                 { status: 200 },
//             );
//         }
//     }
// };

// export default function Index() {
//     const nav = useNavigation();
//     const isLoading = nav.state !== "idle";
//     const navigate = useNavigate();

//     const loaderResponse = useLoaderData<typeof loader>();
//     const errorType = loaderResponse;

//     return (
//         <>
//             {isLoading ? (
//                 <SkeletonPage primaryAction>
//                     <BlockStack gap="500">
//                         <Card>
//                             <SkeletonBodyText />
//                         </Card>
//                         <Card>
//                             <SkeletonBodyText />
//                         </Card>
//                         <Card>
//                             <SkeletonBodyText />
//                         </Card>
//                         <Card>
//                             <SkeletonBodyText />
//                         </Card>
//                         <Card>
//                             <SkeletonBodyText />
//                         </Card>
//                         <Card>
//                             <SkeletonBodyText />
//                         </Card>
//                     </BlockStack>
//                 </SkeletonPage>
//             ) : (
//                 <>
//                     <Page
//                         title="Error"
//                         backAction={{
//                             content: "Back",
//                             onAction: async () => {
//                                 navigate(-1);
//                             },
//                         }}>
//                         <BlockStack gap={"500"}>
//                             {errorType === "firstPlan" && (
//                                 <BlockStack gap="500">
//                                     <Banner title="Thank you for choosing a plan!" tone="success" onDismiss={() => {}}>
//                                         <BlockStack gap={GapInsideSection}>
//                                             <Text as={"p"} variant="headingMd">
//                                                 You will be using NeatBundles to let your customers create bundles they love in no time.
//                                             </Text>

//                                             <Text as={"p"}>
//                                                 Just before you get there, you need to quickly go through the installation to get the NeatBundles app properly connected to your
//                                                 store.
//                                             </Text>
//                                         </BlockStack>
//                                     </Banner>
//                                 </BlockStack>
//                             )}
//                             {/*
//                             {thankYouType === "upgrade" && (
//                                 <BlockStack gap="500">
//                                     <Banner title="Thank you for upgrading!" tone="success" onDismiss={() => {}}>
//                                         <BlockStack gap={GapInsideSection}>
//                                             <Text as={"p"} variant="headingMd">
//                                                 We hope that new features will give you plenty of new power.
//                                             </Text>
//                                         </BlockStack>
//                                     </Banner>
//                                 </BlockStack>
//                             )} */}

//                             <Box width="full">
//                                 <BlockStack inlineAlign="end">
//                                     <Form method="post">
//                                         <Button
//                                             variant="primary"
//                                             onClick={() => {
//                                                 if (thankYouType === "upgrade") {
//                                                     navigate("/app");
//                                                 } else if (thankYouType === "firstPlan") {
//                                                     navigate("/app/installation");
//                                                 }
//                                             }}>
//                                             Go to bundles
//                                         </Button>
//                                     </Form>
//                                 </BlockStack>
//                             </Box>

//                             <FooterHelp>
//                                 Are you stuck? <Link to="/app/help">Get help</Link> from us, or <Link to="/app/feature-request">suggest new features</Link>.
//                             </FooterHelp>
//                         </BlockStack>
//                     </Page>
//                 </>
//             )}
//         </>
//     );
// }
