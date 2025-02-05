import { OutgoingHttpHeaders } from "http";

export class CacheData {
    statusCode: number;
    headers: OutgoingHttpHeaders;
    data: string;

    constructor(statusCode: number, headers: OutgoingHttpHeaders, data: string) {
        this.statusCode = statusCode;
        this.headers = headers;
        this.data = data;
    }
}
