import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import db from '~/db.server';
import { JsonData } from '~/adminBackend/service/dto/jsonData';
import { checkPublicAuth } from '~/adminBackend/service/utils/publicApi.auth';
import { FileStoreRepositoryImpl } from '~/adminBackend/repository/impl/FIleStoreServiceImpl';
import { BundleFullAndStepsFullDto, bundleFullStepsFull } from '@adminBackend/service/dto/BundleFullAndStepsFullDto';
import { CustomerInputDto } from '@adminBackend/service/dto/CustomerInputDto';
import { ProductDto } from '@adminBackend/service/dto/ProductDto';
import { ContentDto } from '@adminBackend/service/dto/ContentDto';
import { CreatedBundleRepository } from '@adminBackend/repository/impl/CreatedBundleRepository';
import { CustomerInputsDto } from '~/adminBackend/service/dto/CustomerInputsDto';
import { ShopifyProductVariantService } from '~/adminBackend/repository/impl/ShopifyCreatedBundleProductVariantRepository';
import { BundleVariantForCartDto } from '@adminBackend/service/dto/BundleVariantForCartDto';
import { bundlePagePreviewKey } from '~/constants';
import { AddedContentItemDto } from '~/adminBackend/service/dto/AddedContentItemDto';
import { ShopifyBundleBuilderProductRepository } from '~/adminBackend/repository/impl/ShopifyBundleBuilderProductRepository';
import { unauthenticated } from '~/shopify.server';

export const action = async ({ request }: ActionFunctionArgs) => {
    const res = await checkPublicAuth(request); //Public auth check

    if (!res.ok)
        return json(res, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            status: 200,
        });

    //Get query params
    const url = new URL(request.url);
    const shop = url.searchParams.get('shop') as string;
    const bundleBuilderId = url.searchParams.get('bundleId');
    const isBundleInPreview = url.searchParams.get(bundlePagePreviewKey);

    const { admin } = await unauthenticated.admin(shop);

    if (isBundleInPreview === 'true') {
        return json(new JsonData(true, 'success', "You can't create a bundle.", []));
    }

    try {
        const formData = await request.formData();

        //Get the customer inputs
        const customerInputs: CustomerInputDto[] = JSON.parse(formData.get('customerInputs') as string) as CustomerInputDto[];

        //Get the files
        const files: File | File[] | null = formData.get('files') as File | File[] | null;

        if (!customerInputs) {
            return json(new JsonData(true, 'error', 'Invalid form data.', []), {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                status: 400,
            });
        }

        //Check if all bundle conditions are met

        //Get the bundle with all the steps
        const bundleBuilder: BundleFullAndStepsFullDto = (await db.bundleBuilder.findUnique({
            where: {
                id: Number(bundleBuilderId as string),
            },
            include: bundleFullStepsFull,
        })) as BundleFullAndStepsFullDto;

        let error = false;

        //Check conditions for each step
        bundleBuilder.steps.forEach((step) => {
            const customerInputsOnThisStep = customerInputs.find((input: CustomerInputDto) => {
                return input.stepNumber === step.stepNumber;
            });

            if (!customerInputsOnThisStep || customerInputsOnThisStep?.stepType != step.stepType) {
                error = true;
                return;
            }

            if (step.stepType === 'PRODUCT') {
                //Check if the number of products is in the range
                const maxProductsOnThisStep: number = step.productInput?.maxProductsOnStep as number;
                const minProductsOnThisStep: number = step.productInput?.minProductsOnStep as number;

                const actualProductsOnThisStep: ProductDto[] = customerInputsOnThisStep?.inputs as ProductDto[];

                if (actualProductsOnThisStep.length < minProductsOnThisStep || actualProductsOnThisStep.length > maxProductsOnThisStep) {
                    error = true;
                    return;
                }

                //Checking if the customer vas allowed to select the same product multiple times
                const allowMultipleSelections: boolean = step.productInput?.allowProductDuplicates as boolean;

                if (!allowMultipleSelections) {
                    actualProductsOnThisStep.forEach((product) => {
                        if (product.quantity > 1) {
                            error = true;
                        }
                    });
                }

                //Check in the future if the customer is allowed to select the products that are selected
                //
                // Implementation
                //
            } else if (step.stepType === 'CONTENT') {
                const contentInputs: ContentDto[] = customerInputsOnThisStep?.inputs as ContentDto[];

                step.contentInputs?.forEach((contentInput) => {
                    if (contentInput.inputType === 'NONE') return;

                    //Customer content input on this step
                    const contentInputsOnThisStep: ContentDto = contentInputs.find((input) => {
                        return input.id == contentInput.id;
                    }) as ContentDto;

                    //Check if the content is required and if the content is not empty
                    if (contentInputsOnThisStep.value.length == 0 && contentInput.required) {
                        error = true;
                        return;
                    }

                    //Check if the content is not too long
                    if (contentInput.inputType != 'IMAGE' && contentInputsOnThisStep.value.length > contentInput.maxChars) {
                        error = true;
                        return;
                    }

                    //Check if the content type is correct

                    //prettier-ignore
                    if (contentInputsOnThisStep.type === "file" && contentInput.inputType != "IMAGE") { error = true; return;}

                    //prettier-ignore
                    if (contentInputsOnThisStep.type === "text" && !(contentInput.inputType === "TEXT" || contentInput.inputType === "NUMBER")) { error = true; return ;}
                });
            }
        });

        if (error) {
            console.log(error);

            return json(new JsonData(false, 'error', 'Invalid form data.', []), {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                status: 200,
            });
        }

        //Service for creating the product variant
        const productVariantService = await ShopifyProductVariantService.build(shop);

        //Extract the data from the customer inputs
        const { addedProductVariants, addedContent, totalProductPrice } = await CustomerInputsDto.extractDataFromCustomerInputs(
            customerInputs,
            bundleBuilder,
            productVariantService,
        );

        if (files) {
            const fileStoreService = new FileStoreRepositoryImpl();

            await Promise.all(
                addedContent.map(async (contentItem) => {
                    await Promise.all(
                        contentItem.getContentItems().map(async (contentInput: AddedContentItemDto) => {
                            if (contentInput.contentType === 'IMAGE') {
                                //Upload the image to the storage
                                const imageUrl = await fileStoreService.uploadFile(contentInput.value, files);

                                //Set the input value to the image url for storing in the database
                                contentInput.value = imageUrl;
                            }
                        }),
                    );
                }),
            );
        }

        //Get the final bundle prices
        const { bundlePrice, bundleCompareAtPrice, discountAmount } = BundleVariantForCartDto.getFinalBundlePrices(bundleBuilder, totalProductPrice);

        //Store the created bundle in the database
        //Get the id of the created bundle
        const newCreatedBundleId = await CreatedBundleRepository.createCreatedBundle(bundleBuilder.id, bundlePrice, discountAmount, addedProductVariants, addedContent);

        //Check if the bundle builder product exists (it may have been deleted by the user on accident)
        const doesBundleBuilderProductExist = await ShopifyBundleBuilderProductRepository.checkIfProductExists(admin, bundleBuilder.shopifyProductId);

        //If the product does not exist, create a new one
        if (!doesBundleBuilderProductExist) {
            const newBundleBuilderProductId = await ShopifyBundleBuilderProductRepository.createBundleProduct(admin, bundleBuilder.title, shop);

            if (newBundleBuilderProductId) {
                bundleBuilder.shopifyProductId = newBundleBuilderProductId;
            }
        } else {
            //Check the number of variants for the bundle builder product
            const numOfBundleBuilderProductVariants = await ShopifyBundleBuilderProductRepository.getNumberOfProductVariants(admin, bundleBuilder.shopifyProductId);

            //If the number of variants is greater than 100, create a new product
            if (numOfBundleBuilderProductVariants >= 100) {
                const newBundleBuilderProductId = await ShopifyBundleBuilderProductRepository.createBundleProduct(admin, bundleBuilder.title, shop);

                if (newBundleBuilderProductId) {
                    bundleBuilder.shopifyProductId = newBundleBuilderProductId;
                }
            }
        }

        //Create a new dummy product variant with the bundle data and return the variant id
        const newVariantId = await productVariantService.createProductVariant(newCreatedBundleId, bundleBuilder.shopifyProductId, bundleCompareAtPrice, bundlePrice);

        //Link the addedProductVariants to the new bundle variant
        const success = await productVariantService.updateProductVariantRelationship(newVariantId, addedProductVariants);

        //Create the bundle variant for the cart
        //This variant includes the variant id and the list of added content inputs
        const bundleVariantForCart = new BundleVariantForCartDto(newVariantId, bundleBuilder.title, addedContent);

        if (!success) {
            return json(new JsonData(false, 'error', 'Error while adding the bundle to the cart.', []), {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                status: 200,
            });
        }

        return json(new JsonData(true, 'success', 'Bundle succesfuly added to cart.', [], bundleVariantForCart), {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            status: 200,
        });
    } catch (err) {
        console.log(err);
        console.log('There was an error');

        return json(new JsonData(false, 'error', 'Invalid form data.', []), {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            status: 200,
        });
    }
};
