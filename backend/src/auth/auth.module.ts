import { Module } from "@nestjs/common";
import { BundleBuilderModule } from "~/bundle-builders/bundle-builder.module";
import { ProxyAuthMiddleware } from "./proxy-auth.middleware";
import { ProxyAuthService } from "./proxy-auth.service";

@Module({
    exports: [ProxyAuthMiddleware, ProxyAuthService],
    providers: [ProxyAuthService, ProxyAuthMiddleware],
    imports: [BundleBuilderModule],
})
export class AuthModule {}
