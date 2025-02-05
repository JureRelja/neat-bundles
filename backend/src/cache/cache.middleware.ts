import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { CacheService } from "./cache.service";
import { CacheData } from "./dto/cache-data.dto";

@Injectable()
export class CacheMiddleware implements NestMiddleware {
    constructor(private readonly cacheService: CacheService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const key: string = this.cacheService.reqToKey(req);

        const cacheData: null | CacheData = await this.cacheService.readCache(key);

        if (cacheData !== null && cacheData !== undefined) {
            try {
                res.status(cacheData.statusCode).set(cacheData.headers);
                return res.send(cacheData.data);
            } catch (error) {
                console.error(error);
            }
        } else {
            const oldSend = res.send;

            res.send = (dataForCache: string) => {
                // set the function back to avoid the 'double-send' effect
                res.send = oldSend;

                // cache the response only if it is successful
                if (res.statusCode.toString().startsWith("2")) {
                    this.cacheService.writeCache(key, new CacheData(res.statusCode, res.getHeaders(), dataForCache));
                }
                return res.send(dataForCache);
            };
        }

        next();
    }
}
