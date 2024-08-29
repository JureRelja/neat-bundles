import { useAppBridge } from "@shopify/app-bridge-react";
import { Button } from "@shopify/polaris";
import { bundleTagIndentifier } from "../../constants";
import {
  BaseResource,
  SelectPayload,
  Resource,
} from "@shopify/app-bridge-types";
import { ProductResource } from "~/types/Product";

export default function Index({
  updateSelectedProducts,
  selectedProducts,
}: {
  updateSelectedProducts: (productResource: ProductResource[]) => void;
  selectedProducts: ProductResource[];
}) {
  const shopify = useAppBridge();

  const showModalPicker = async () => {
    // Convert the selected resources to the base resource type
    const selectedResourcesIds: { id: string }[] =
      selectedProducts?.map((product) => {
        return { id: product.shopifyId };
      }) || [];

    // const type =
    //   resourceType === ProductResourceType.COLLECTION
    //     ? "collection"
    //     : "product";

    const newSelectedResources = await shopify.resourcePicker({
      type: "product",
      multiple: true,
      action: "select",
      filter: {
        variants: false,
        draft: false,
        archived: false,
        multiple: 2,
        query: `-tag:${bundleTagIndentifier}`,
      },
      selectionIds: selectedResourcesIds,
    });
    // If the user closes the modal without selecting anything, newSelectedResources will be undefined
    if (!newSelectedResources) return;

    // Convert the selected resources to the base resource type
    const newSelectedProducts: ProductResource[] = newSelectedResources.map(
      (selectedResource: Resource) => {
        return {
          shopifyId: selectedResource.id as string,
          handle: selectedResource.handle as string,
        };
      },
    );
    updateSelectedProducts(newSelectedProducts);
  };

  return (
    <>
      <Button
        onClick={showModalPicker}
        fullWidth
        variant={selectedProducts?.length > 0 ? "secondary" : "primary"}
      >
        {/* {resourceType === ProductResourceType.COLLECTION
          ? selectedResources?.length === 0
            ? "Select collections"
            : `${selectedResources?.length} collections selected`
          : selectedResources?.length === 0
            ? "Select products"
            : `${selectedResources?.length} products selected`} */}

        {!selectedProducts || selectedProducts.length === 0
          ? "Select products"
          : `${selectedProducts?.length} products selected`}
      </Button>
    </>
  );
}
