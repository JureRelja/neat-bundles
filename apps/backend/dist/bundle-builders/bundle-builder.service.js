"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BundleBuilderService", {
    enumerable: true,
    get: function() {
        return BundleBuilderService;
    }
});
const _common = require("@nestjs/common");
const _bundlebuilderrepository = require("./bundle-builder.repository");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let BundleBuilderService = class BundleBuilderService {
    create(createBundleBuilderDto) {
        try {
            return this.bundleBuilderRepository.create(createBundleBuilderDto);
        } catch (error) {
            throw new _common.BadRequestException("There was an error with your request. BundleBuilder not created.");
        }
    }
    async findAll(shop) {
        try {
            const bundleBuilders = await this.bundleBuilderRepository.getAll(shop);
            return bundleBuilders;
        } catch (error) {
            throw new _common.BadRequestException("There was an error with your request. BundleBuilders not found.");
        }
    }
    async findOne(id, shop, includeSteps) {
        try {
            let bundleBuilder = null;
            if (includeSteps) {
                bundleBuilder = await this.bundleBuilderRepository.getWithSteps(id, shop);
            } else {
                bundleBuilder = await this.bundleBuilderRepository.get(id, shop);
            }
            if (!bundleBuilder) {
                throw new _common.BadRequestException("BundleBuilder not found.");
            }
            return bundleBuilder;
        } catch (error) {
            throw new _common.BadRequestException("There was an error with your request. BundleBuilder not found.");
        }
    }
    update(id, updateBundleBuilderDto) {
        return `This action updates a #${id} bundleBuilder`;
    }
    remove(id) {
        return `This action removes a #${id} bundleBuilder`;
    }
    constructor(bundleBuilderRepository){
        this.bundleBuilderRepository = bundleBuilderRepository;
    }
};
BundleBuilderService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _bundlebuilderrepository.BundleBuilderRepository === "undefined" ? Object : _bundlebuilderrepository.BundleBuilderRepository
    ])
], BundleBuilderService);

//# sourceMappingURL=bundle-builder.service.js.map