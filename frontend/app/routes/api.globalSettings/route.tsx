// import type { LoaderFunctionArgs } from '@remix-run/node';
// import { json } from '@remix-run/node';
// import { bundleAndSteps, BundleAndStepsBasicServer, BundleBuilderDto } from '~/adminBackend/service/dto/Bundle';
// import db from '~/db.server';
// import { JsonData } from '~/adminBackend/service/dto/jsonData';
// import { checkPublicAuth } from '~/adminBackend/service/utils/publicApi.auth';
// import { ApiCacheService } from '../../adminBackend/service/utils/ApiCacheService';
// import { ApiCacheKeyService } from '~/adminBackend/service/utils/ApiCacheKeyService';
// import globalSettingsRepository from '~/adminBackend/repository/impl/GlobalSettingsRepository';
// import { authenticate } from '~/shopify.server';

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//     const { admin, session } = await authenticate.public.appProxy(request);
//     // const res = await checkPublicAuth(request); //Public auth check

//     // if (!res.ok)
//     //     return json(res, {
//     //         headers: {
//     //             'Access-Control-Allow-Origin': '*',
//     //         },
//     //         status: 200,
//     //     });

//     const url = new URL(request.url);

//     const shop = url.searchParams.get('shop') as string;

//     //Cache aside
//     const cacheKey = new ApiCacheKeyService(shop as string);

//     const cache = new ApiCacheService(cacheKey.getGlobalSettingsKey());

//     const cacheData = await cache.readCache();

//     //Get query params
//     if (cacheData) {
//         return json(new JsonData(true, 'success', 'Global settings succesfuly retirieved.', [], cacheData, true), {
//             headers: {
//                 'Access-Control-Allow-Origin': '*',
//             },
//             status: 200,
//         });
//     } else {
//         // Returning bundle alone or with selected step
//         try {
//             const globalSettings = await globalSettingsRepository.getSettingsByStoreUrl(shop);

//             //Write to cache
//             await cache.writeCache(globalSettings);

//             return json(new JsonData(false, 'success', 'Global settings succesfuly retirieved.', [], globalSettings), {
//                 headers: {
//                     'Access-Control-Allow-Origin': '*',
//                 },
//                 status: 200,
//             });
//         } catch (error) {
//             console.error(error);
//         }
//     }
// };
