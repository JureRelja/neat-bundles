import HmacSha256 from "crypto-js/hmac-sha256";
import Hex from "crypto-js/enc-hex";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";

// Function to check if the bundle is published and belongs to the store
@Injectable()
export class ProxyAuthService {
    authentificate(request: Request): void {
        const url: URL = new URL(`${process.env.SHOPIFY_APP_URL as string}${request.originalUrl}`);

        if (this.checkSignature(url)) {
            throw new UnauthorizedException("There was an error with your request. Signature is invalid.");
        }

        const shop: string | null = url.searchParams.get("shop");

        if (!shop) {
            throw new UnauthorizedException("There was an error with your request. 'shop' is missing.");
        }
    }

    checkSignature(url: URL): boolean {
        const searchParams: URLSearchParams = url.searchParams;

        const receivedSignature: string | null = searchParams.get("signature");

        searchParams.delete("signature");

        const queryParamsForSigning: string = this.getUrlForSigning(searchParams);

        // Calculate the signature
        const calculatedSignature: string = Hex.stringify(HmacSha256(queryParamsForSigning, process.env.NEAT_BUNDLES_DEV_SHOPIFY_API_SECRET as string));
        // Compare the received signature with the calculated signature
        if (receivedSignature !== calculatedSignature) {
            return false;
        }

        return true;
    }

    private getUrlForSigning(queryParams: URLSearchParams): string {
        const queryParamEntries: IterableIterator<[string, string]> = queryParams.entries();

        const arrayOfParams: [string, string][] = [];

        // Iterate over the query params and add them to the array
        for (const paramKeyValuePair of queryParamEntries) {
            arrayOfParams.push(paramKeyValuePair);
        }

        // Sort the array of params by key
        arrayOfParams.sort((a: [string, string], b: [string, string]) => {
            return a[0].localeCompare(b[0]);
        });

        // Create the query string
        let queryParametersString: string = "";

        arrayOfParams.forEach((param: [string, string]): void => {
            queryParametersString += `${param[0]}=${param[1]}`;
        });

        return queryParametersString;
    }
}
