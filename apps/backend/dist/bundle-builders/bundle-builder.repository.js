"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BundleBuilderRepository", {
    enumerable: true,
    get: function() {
        return BundleBuilderRepository;
    }
});
const _db = /*#__PURE__*/ _interop_require_default(require("../db/db.server"));
const _common = require("@nestjs/common");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let BundleBuilderRepository = class BundleBuilderRepository {
    async create(createBundleBuilderDto) {
        const bundleBuilder = await _db.default.bundleBuilder.create({
            data: {
                user: {
                    connect: {
                        shop: createBundleBuilderDto.shop
                    }
                },
                title: createBundleBuilderDto.title,
                published: true,
                shopifyProductId: createBundleBuilderDto.title,
                bundleBuilderConfig: {
                    create: {
                        skipTheCart: false,
                        allowBackNavigation: true,
                        showOutOfStockProducts: false
                    }
                }
            }
        });
        return bundleBuilder;
    }
    async delete(id) {
        return await _db.default.bundleBuilder.update({
            where: {
                id: id
            },
            data: {}
        });
    }
    async get(id, shop) {
        return _db.default.bundleBuilder.findUnique({
            where: {
                id: id,
                shop: shop
            }
        });
    }
    async getWithSteps(id, shop) {
        return _db.default.bundleBuilder.findUnique({
            where: {
                id: id,
                shop: shop
            },
            select: {
                id: true,
                shopifyProductId: true,
                discountType: true,
                discountValue: true,
                shop: true,
                title: true,
                published: true,
                createdAt: true,
                pricing: true,
                priceAmount: true,
                bundleBuilderSteps: {
                    select: {
                        id: true,
                        title: true,
                        stepNumber: true,
                        stepType: true,
                        description: true
                    }
                }
            }
        });
    }
    async getAll(shop) {
        return await _db.default.bundleBuilder.findMany({
            where: {
                shop: shop
            }
        });
    }
    async update(updateBundleBuilderDto) {
        return await _db.default.bundleBuilder.update({
            where: {
                id: updateBundleBuilderDto.id
            },
            data: updateBundleBuilderDto
        });
    }
    async getCount(shop) {
        return _db.default.bundleBuilder.count({
            where: {
                shop: shop
            }
        });
    }
};
BundleBuilderRepository = _ts_decorate([
    (0, _common.Injectable)()
], BundleBuilderRepository);

//# sourceMappingURL=bundle-builder.repository.js.map