import { PartialType } from "@nestjs/mapped-types";
import { BundleBuilderEntity } from "../entities/bundle-builder.entity";
import { UpdateBundleBuilderClient } from "@repo/shared-types";

export class UpdateBundleBuilderDto extends PartialType(BundleBuilderEntity) implements UpdateBundleBuilderClient {}
