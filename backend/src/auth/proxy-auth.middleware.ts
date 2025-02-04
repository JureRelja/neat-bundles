import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ProxyAuthService } from "./proxy-auth.service";

@Injectable()
export class ProxyAuthMiddleware implements NestMiddleware {
    constructor(private readonly proxyAuthService: ProxyAuthService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        await this.proxyAuthService.authentificate(req);

        next();
    }
}
