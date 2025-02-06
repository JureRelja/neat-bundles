// import HmacSha256 from 'crypto-js/hmac-sha256';
// import Hex from 'crypto-js/enc-hex';

// export class SignatureValidator {
//     private receivedSignature: string | null;
//     private otherQueryParams: URLSearchParams;

//     constructor(searchParams: URLSearchParams) {
//         this.otherQueryParams = searchParams;
//         this.receivedSignature = searchParams.get('signature');

//         this.otherQueryParams.delete('signature');
//     }

//     public getReceivedSignature(): string | null {
//         return this.receivedSignature;
//     }

//     public getOtherQueryParams(): URLSearchParams {
//         return this.otherQueryParams;
//     }

//     public async verifySignature(): Promise<boolean> {
//         const queryParamsForSigning = this.getUrlForSigning();

//         // Calculate the signature
//         const calculatedSignature = Hex.stringify(HmacSha256(queryParamsForSigning, process.env.SHOPIFY_API_SECRET as string));

//         // Compare the received signature with the calculated signature
//         if (this.receivedSignature === calculatedSignature) {
//             return true;
//         }

//         return false;
//     }

//     private getUrlForSigning(): string {
//         const queryParamEntries: IterableIterator<[string, string]> = this.otherQueryParams.entries();

//         let paramKeyValuePair: IteratorResult<[string, string], unknown> = queryParamEntries.next();

//         const arrayOfParams: [string, string][] = [];

//         // Iterate over the query params and add them to the array
//         while (true) {
//             if (!paramKeyValuePair.done) {
//                 arrayOfParams.push(paramKeyValuePair.value);
//             } else break;

//             paramKeyValuePair = queryParamEntries.next();
//         }

//         // Sort the array of params by key
//         arrayOfParams.sort((a, b) => {
//             return a[0].localeCompare(b[0]);
//         });

//         // Create the query string
//         let queryParametersString = '';

//         arrayOfParams.forEach((param: [string, string]): void => {
//             queryParametersString += `${param[0]}=${param[1]}`;
//         });

//         return queryParametersString;
//     }
// }
