import db from '~/db.server';
import { JsonData } from '~/types/jsonData';
import { SignatureValidator } from '../service/impl/SignatureValidator';

// Function to check if the bundle is published and belongs to the store
export async function checkPublicAuth(request: Request): Promise<JsonData<undefined>> {
    // Get query params
    const url = new URL(request.url);

    const shop = url.searchParams.get('shop');
    const bundleId = url.searchParams.get('bundleId');

    //Veryfing digital signature
    const signatureValidator = new SignatureValidator(url.searchParams);

    if (!(await signatureValidator.verifySignature())) {
        return new JsonData(false, 'error', "There was an error with your request. 'signature' is invalid.");
    }

    // Check if shop is provided
    if (!shop) {
        return new JsonData(false, 'error', "There was an error with your request. 'shop' wasn't specified.");
    }

    // Check if bundleId is provided
    if (!bundleId || !Number(bundleId)) {
        return new JsonData(false, 'error', "There was an error with your request. 'bundleId' wasn't specified.");
    }

    //Checking if the the bundle is published and belongs to the store
    const bundleBuilder = await db.bundleBuilder.findUnique({
        where: {
            id: Number(bundleId) || undefined,
            deleted: false,
        },
        select: {
            id: true,
            user: {
                select: {
                    hasAppInstalled: true,
                },
            },
            published: true,
            storeUrl: true,
        },
    });

    if (bundleBuilder && bundleBuilder.id === 1) {
        return new JsonData(true, 'success', 'Returning test bundle.');
    }

    if (!bundleBuilder || !bundleBuilder.published || bundleBuilder.storeUrl !== shop || !bundleBuilder.user.hasAppInstalled) {
        return new JsonData(false, 'error', "There was an error with your request. Requested bundle either doesn't exist or it's not active.");
    } else {
        return new JsonData(true, 'success', 'Bundle is published and belongs to the store.');
    }
}
