import { Module } from '@nestjs/common';
import { ProductService } from './product.service';

@Module({
    exports: [ProductService],
    providers: [ProductService],
})
export class ShopifyModule {
}
