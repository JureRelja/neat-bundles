import { Module } from "@nestjs/common";
import { CacheMiddleware } from "./cache.middleware";
import { CacheService } from "./cache.service";

@Module({
    providers: [CacheMiddleware, CacheService],
    exports: [CacheMiddleware, CacheService],
})
export class CacheModule {}
