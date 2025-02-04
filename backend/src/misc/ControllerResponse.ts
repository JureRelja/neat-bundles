export class ControllerResponse<T> {
    fromCache: boolean = false;
    ok: boolean;
    message: string;
    data: T;

    constructor(ok: boolean, message: string, fromCache: boolean, data: T) {
        this.ok = ok;
        this.message = message;
        this.data = data;
        this.fromCache = fromCache;
    }
}
