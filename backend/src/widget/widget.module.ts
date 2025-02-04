import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { WidgetController } from "./widget.controller";
import { BundleBuilderModule } from "~/bundle-builders/bundle-builder.module";
import { WidgetService } from "./widget.service";
import { ProxyAuthMiddleware } from "~/auth/proxy-auth.middleware";
import { AuthModule } from "~/auth/auth.module";
import { CacheMiddleware } from "~/cache/cache.middleware";
import { CacheModule } from "~/cache/cache.module";

@Module({
    imports: [BundleBuilderModule, AuthModule, CacheModule],
    controllers: [WidgetController],
    providers: [WidgetService],
})
export class WidgetModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ProxyAuthMiddleware).forRoutes("widget");
        // consumer.apply(CacheMiddleware).forRoutes("widget");
    }
}
