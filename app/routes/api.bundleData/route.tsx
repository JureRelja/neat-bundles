import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { bundleAndSteps, BundleAndStepsBasicServer } from '~/types/Bundle';
import db from '~/db.server';
import { JsonData } from '~/types/jsonData';
import { checkPublicAuth } from '~/utils/publicApi.auth';
import { ApiCacheService } from '../../service/impl/ApiCacheService';
import { ApiCacheKeyService } from '~/service/impl/ApiCacheKeyService';

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

    const shop = url.searchParams.get('shop') as string;

    //Cache aside
    const cacheKey = new ApiCacheKeyService(shop as string);

    const cache = new ApiCacheService(cacheKey.getBundleDataKey(url.searchParams.get('bundleId')));

    const cacheData = await cache.readCache();

    //Get query params
    const bundleId = url.searchParams.get('bundleId');

    if (cacheData) {
        return json(new JsonData(true, 'success', 'Bundle succesfuly retirieved.', [], cacheData, true), {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            status: 200,
        });
    } else {
        // Returning bundle alone or with selected step
        try {
            const bundleData: BundleAndStepsBasicServer | null = await db.bundleBuilder.findUnique({
                where: {
                    id: Number(bundleId),
                },
                select: {
                    ...bundleAndSteps,
                    id: true,
                    title: true,
                    published: true,
                    createdAt: true,
                    priceAmount: true,
                    pricing: true,
                    bundleSettings: true,
                    steps: {
                        select: {
                            title: true,
                            stepNumber: true,
                            stepType: true,
                        },
                        orderBy: {
                            stepNumber: 'asc',
                        },
                    },
                },
            });

            //Write to cache
            await cache.writeCache(bundleData);

            return json(new JsonData(false, 'success', 'Bundle succesfuly retirieved.', [], bundleData), {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                status: 200,
            });
        } catch (error) {
            console.error(error);
        }
    }
};
