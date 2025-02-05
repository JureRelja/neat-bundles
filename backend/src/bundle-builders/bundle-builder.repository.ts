import db from "@db";
import { Injectable } from "@nestjs/common";
import { CreateBundleBuilderDto } from "./dto/create-bundle-builder.dto";
import { UpdateBundleBuilderDto } from "./dto/update-bundle-builder.dto";
import { bundleBuilderAndStepsBasicSelect, BundleBuilderAndStepsBasicDto } from "./dto/bundle-builder-basic.dto";
import { BundleBuilderEntity } from "./entities/bundle-builder.entity";

@Injectable()
export class BundleBuilderRepository {
    public async create(createBundleBuilderDto: CreateBundleBuilderDto): Promise<BundleBuilderEntity> {
        const bundleBuilder: BundleBuilderEntity = await db.bundleBuilder.create({
            data: {
                user: {
                    connect: {
                        shop: createBundleBuilderDto.shop,
                    },
                },
                title: createBundleBuilderDto.title,
                published: true,
                shopifyProductId: createBundleBuilderDto.title,
                bundleBuilderConfig: {
                    create: {
                        skipTheCart: false,
                        allowBackNavigation: true,
                        showOutOfStockProducts: false,
                    },
                },
            },
        });

        return bundleBuilder;
    }

    public async delete(id: number): Promise<BundleBuilderEntity | null> {
        return await db.bundleBuilder.update({
            where: {
                id: id,
            },
            data: {},
        });
    }

    public async get(id: number, shop: string): Promise<BundleBuilderEntity | null> {
        return db.bundleBuilder.findUnique({
            where: {
                id: id,
                shop: shop,
            },
        });
    }

    async getWithSteps(id: number, shop: string): Promise<BundleBuilderAndStepsBasicDto | null> {
        return db.bundleBuilder.findUnique({
            where: {
                id: id,
                shop: shop,
            },
            select: bundleBuilderAndStepsBasicSelect,
        });
    }

    public async getAll(shop: string): Promise<BundleBuilderEntity[] | null> {
        return db.bundleBuilder.findMany({
            where: {
                shop: shop,
            },
        });
    }

    public async update(updateBundleBuilderDto: UpdateBundleBuilderDto): Promise<BundleBuilderEntity> {
        return await db.bundleBuilder.update({
            where: {
                id: updateBundleBuilderDto.id,
            },
            data: updateBundleBuilderDto,
        });
    }

    public async getCount(shop: string): Promise<number> {
        return db.bundleBuilder.count({
            where: {
                shop: shop,
            },
        });
    }
}
