import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common";
import { BundleBuilderService } from "./bundle-builder.service";
import { CreateBundleBuilderDto } from "./dto/create-bundle-builder.dto";
import { UpdateBundleBuilderDto } from "./dto/update-bundle-builder.dto";
import { BundleBuilderAndStepsBasicDto } from "./dto/bundle-builder-basic.dto";
import { BundleBuilderEntity } from "./entities/bundle-builder.entity";

@Controller("bundle-builders")
export class BundleBuilderController {
    constructor(private readonly bundleBuilderService: BundleBuilderService) {}

    @Post()
    create(@Body() createBundleBuilderDto: CreateBundleBuilderDto) {
        return this.bundleBuilderService.create(createBundleBuilderDto);
    }

    @Get()
    findAll() {
        return this.bundleBuilderService.findAll();
    }

    @Get("/:shop/:id")
    async findOne(
        @Param("id") id: string,
        @Param("shop") shop: string,
        @Query("includeSteps") includeSteps: boolean,
    ): Promise<BundleBuilderEntity | BundleBuilderAndStepsBasicDto | null> {
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
