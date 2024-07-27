import { useAppBridge } from "@shopify/app-bridge-react";
import { Button } from "@shopify/polaris";
import { ProductResourceType } from "../types/BundleStep";
import { bundleTagIndentifier } from "../constants";
import {
  BaseResource,
  SelectPayload,
  Resource,
} from "@shopify/app-bridge-types";

export default function Index({
  type,
  updateSelectedResources,
  selectedResources,
}: {
  type: ProductResourceType;
  updateSelectedResources: (selectedResource: SelectPayload) => void;
  selectedResources: BaseResource[];
}) {
  const shopify = useAppBridge();

  const showModalPicker = async () => {
    const newSelectedResources = await shopify.resourcePicker({
      type: type,
      multiple: true,
      action: "select",
      filter: {
        variants: false,
        draft: false,
        archived: false,
        query: `-tag:${bundleTagIndentifier}`,
      },
      selectionIds: selectedResources,
    });
    // If the user closes the modal without selecting anything, newSelectedResources will be undefined
    if (!newSelectedResources) return;

    // Convert the selected resources to the base resource type
    const baseSelectedResources: BaseResource[] = newSelectedResources.map(
      (selectedResource: Resource) => {
        return { id: selectedResource.id };
      },
    );
    updateSelectedResources(baseSelectedResources);
  };

  return (
    <>
      <Button
        onClick={showModalPicker}
        fullWidth
        variant={selectedResources.length > 0 ? "secondary" : "primary"}
      >
        {type === ProductResourceType.COLLECTION
          ? selectedResources.length === 0
            ? "Select collections"
            : `${selectedResources.length} collections selected`
          : selectedResources.length === 0
            ? "Select products"
            : `${selectedResources.length} products selected`}
      </Button>
    </>
  );
}
