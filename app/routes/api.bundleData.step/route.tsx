import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import db from '~/db.server';
import { JsonData } from '~/adminBackend/service/dto/jsonData';
import { checkPublicAuth } from '~/adminBackend/service/utils/publicApi.auth';
import { ApiCacheService } from '../../adminBackend/service/utils/ApiCacheService';
import { BundleStepAllResources, bundleStepFull } from '~/adminBackend/service/dto/BundleStep';
import { ApiCacheKeyService } from '~/adminBackend/service/utils/ApiCacheKeyService';

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
    const stepNumber = url.searchParams.get('stepNum');
    const bundleBuilderId = url.searchParams.get('bundleId');
    const shop = url.searchParams.get('shop') as string;

    //Cache aside
    const cacheKey = new ApiCacheKeyService(shop);

    const cacheService = new ApiCacheService(cacheKey.getStepKey(stepNumber, bundleBuilderId));

    const cacheData = await cacheService.readCache();

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
            const bundleStep: BundleStepAllResources[] | null = await db.bundleStep.findMany({
                where: {
                    bundleBuilderId: Number(bundleBuilderId),
                    stepNumber: Number(stepNumber),
                },
                include: bundleStepFull,
            });

            if (!bundleStep) {
                return json(new JsonData(false, 'error', "There was an error with your request. Requested step either doesn't exist or it's not active."), {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                    status: 200,
                });
            }

            //Write to cache
            await cacheService.writeCache(bundleStep);

            return json(new JsonData(false, 'success', 'Bundle succesfuly retirieved.', [], bundleStep), {
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
