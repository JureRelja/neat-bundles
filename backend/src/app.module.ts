import { Module } from "@nestjs/common";

import { BundleBuilderModule } from "./bundle-builders/bundle-builder.module";
import { WidgetsModule } from "./widgets/widget.module";
import { ShopifyModule } from "./shopify/shopify.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";

@Module({
    imports: [BundleBuilderModule, ShopifyModule, AuthModule, WidgetsModule, UsersModule, UsersModule],
})
export class AppModule {}
