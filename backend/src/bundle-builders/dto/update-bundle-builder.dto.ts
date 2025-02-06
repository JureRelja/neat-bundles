import { PartialType } from "@nestjs/mapped-types";
import { BundleBuilderEntity } from "../entities/bundle-builder.entity";
import { UpdateBundleBuilderClient } from "~/dto/bundle-builder/update-bundle-builder.client";

export class UpdateBundleBuilderDto extends PartialType(BundleBuilderEntity) implements UpdateBundleBuilderClient {}
