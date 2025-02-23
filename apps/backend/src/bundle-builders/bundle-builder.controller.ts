import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common";
import { BundleBuilderService } from "./bundle-builder.service";
import { BundleBuilderDto } from "./dto/bundle-builder.dto";
import { BundleBuilderAndStepsBasicDto } from "./dto/bundle-builder-basic.dto";
import { CreateBundleBuilderDto } from "./dto/create-bundle-builder.dto";
import { UpdateBundleBuilderDto } from "./dto/update-bundle-builder.dto";

@Controller("bundle-builders")
export class BundleBuilderController {
    constructor(private readonly bundleBuilderService: BundleBuilderService) {}

    @Post()
    async create(@Body() createBundleBuilderDto: CreateBundleBuilderDto): Promise<BundleBuilderDto> {
        return this.bundleBuilderService.create(createBundleBuilderDto);
    }

    @Get("/:shop")
    async findAll(@Param("shop") shop: string): Promise<BundleBuilderDto[]> {
        return this.bundleBuilderService.findAll(shop);
    }

    @Get("/:shop/:id")
    async findOne(
        @Param("id") id: string,
        @Param("shop") shop: string,
        @Query("includeSteps") includeSteps: boolean,
    ): Promise<BundleBuilderDto | BundleBuilderAndStepsBasicDto | null> {
        return this.bundleBuilderService.findOne(+id, shop, includeSteps);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateBundleBuilderDto: UpdateBundleBuilderDto) {
        return this.bundleBuilderService.update(+id, updateBundleBuilderDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.bundleBuilderService.remove(+id);
    }
}
