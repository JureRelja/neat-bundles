import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateBundleBuilderDto } from "./dto/create-bundle-builder.dto";
import { UpdateBundleBuilderDto } from "./dto/update-bundle-builder.dto";
import { BundleBuilderRepository } from "./bundle-builder.repository";
import { BundleBuilderEntity } from "./entities/bundle-builder.entity";
import { BundleBuilderAndStepsBasicDto } from "./dto/bundle-builder-basic.dto";

@Injectable()
export class BundleBuilderService {
    constructor(private readonly bundleBuilderRepository: BundleBuilderRepository) {}

    create(createBundleBuilderDto: CreateBundleBuilderDto): Promise<BundleBuilderEntity> {
        try {
            return this.bundleBuilderRepository.create(createBundleBuilderDto);
        } catch (error) {
            throw new BadRequestException("There was an error with your request. BundleBuilder not created.");
        }
    }

    async findAll(shop: string): Promise<BundleBuilderEntity[]> {
        try {
            const bundleBuilders = await this.bundleBuilderRepository.getAll(shop);
            return bundleBuilders;
        } catch (error) {
            throw new BadRequestException("There was an error with your request. BundleBuilders not found.");
        }
    }

    async findOne(id: number, shop: string, includeSteps: boolean): Promise<BundleBuilderEntity | BundleBuilderAndStepsBasicDto> {
        try {
            let bundleBuilder: BundleBuilderEntity | BundleBuilderAndStepsBasicDto | null = null;

            if (includeSteps) {
                bundleBuilder = await this.bundleBuilderRepository.getWithSteps(id, shop);
            } else {
                bundleBuilder = await this.bundleBuilderRepository.get(id, shop);
            }

            if (!bundleBuilder) {
                throw new BadRequestException("BundleBuilder not found.");
            }

            return bundleBuilder;
        } catch (error) {
            throw new BadRequestException("There was an error with your request. BundleBuilder not found.");
        }
    }

    update(id: number, updateBundleBuilderDto: UpdateBundleBuilderDto) {
        return `This action updates a #${id} bundleBuilder`;
    }

    remove(id: number) {
        return `This action removes a #${id} bundleBuilder`;
    }
}
