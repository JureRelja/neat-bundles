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
    if (!bundleId) {
        return new JsonData(false, 'error', "There was an error with your request. 'bundleId' wasn't specified.");
    }

    //Checking if the the bundle is published and belongs to the store
    const bundle = await db.bundle.findUnique({
        where: {
            id: Number(bundleId),
        },
        select: {
            published: true,
            storeUrl: true,
        },
    });

    if (!bundle || !bundle.published || bundle.storeUrl !== shop) {
        return new JsonData(false, 'error', "There was an error with your request. Requested bundle either doesn't exist or it's not active.");
    } else {
        return new JsonData(true, 'success', 'Bundle is published and belongs to the store.');
    }
}
