import { PartialType } from "@nestjs/mapped-types";
import { BundleBuilderEntity } from "../entities/bundle-builder.entity";

export class UpdateBundleBuilderDto extends PartialType(BundleBuilderEntity) {}
