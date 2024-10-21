import { json, redirect } from '@remix-run/node';
import { Link, Outlet, useFetcher, useLoaderData, useNavigate, useNavigation, useParams, useSubmit } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Page, Card, BlockStack, SkeletonPage, SkeletonBodyText, FooterHelp, Divider } from '@shopify/polaris';
import { useAppBridge } from '@shopify/app-bridge-react';
import { authenticate } from '../../shopify.server';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import styles from './route.module.css';
import userRepository from '~/adminBackend/repository/impl/UserRepository';
import { BundleBuilderRepository } from '~/adminBackend/repository/impl/BundleBuilderRepository';
import { BundleBuilder } from '@prisma/client';
import { GapBetweenSections } from '~/constants';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect('/app');

    if (!params.bundleid) {
        throw new Response(null, {
            status: 404,
            statusText: 'Bundle id is required',
        });
    }

    const bundleBuilder: BundleBuilder | null = await BundleBuilderRepository.getBundleBuilderById(Number(params.bundleid));

    if (!bundleBuilder) {
        throw new Response(null, {
            status: 404,
            statusText: 'Bundle with this id not found',
        });
    }

    return json(new JsonData(true, 'success', 'Loader response', [], bundleBuilder), { status: 200 });
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
    const isLoading: boolean = nav.state === 'loading';
    const loaderData = useLoaderData<typeof loader>();
    const params = useParams();

    const bundleBuilder = loaderData.data;

    return (
        <Page title={bundleBuilder.title}>
            <div className={styles.cardWrapper}>
                <Card padding={'600'}>
                    <BlockStack gap={GapBetweenSections}>
                        <div className={styles.fadeIn}>
                            <Outlet />
                        </div>

                        <Divider borderColor="transparent" />
                        <div className={styles.progressBar} style={{ width: `${(100 / 6) * 1}%` }}>
                            &nbsp;
                        </div>
                    </BlockStack>
                </Card>
            </div>

            <FooterHelp>
                You stuck? <Link to="/app/help">Get help</Link> from us, or <Link to="/app/feature-request">suggest new features</Link>.
            </FooterHelp>
        </Page>
    );
}
