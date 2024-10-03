import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { checkPublicAuth } from '~/adminBackend/service/utils/publicApi.auth';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const res = await checkPublicAuth(request); //Public auth check
    if (!res.ok)
        return json(res, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            status: 200,
        });

    const url = new URL(request.url);

    //Get query params
    const bundleBuilderId = url.searchParams.get('bundleId');
    const shop = url.searchParams.get('shop') as string;
};
