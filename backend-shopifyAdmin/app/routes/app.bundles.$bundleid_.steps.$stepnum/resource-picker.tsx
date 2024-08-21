import { useAppBridge } from "@shopify/app-bridge-react";
import { Button } from "@shopify/polaris";
import { bundleTagIndentifier } from "../../constants";
import {
  BaseResource,
  SelectPayload,
  Resource,
} from "@shopify/app-bridge-types";
import { ProductResourceType } from "@prisma/client";

export default function Index({
  resourceType,
  updateSelectedResources,
  selectedResources,
}: {
  resourceType: ProductResourceType;
  updateSelectedResources: (selectedResource: string[]) => void;
  selectedResources: string[];
}) {
  const shopify = useAppBridge();

  const showModalPicker = async () => {
    const selectedResourcesIds: { id: string }[] = selectedResources.map(
      (resource: Resource) => {
        return { id: resource.id };
      },
    );

    const type =
      resourceType === ProductResourceType.COLLECTION
        ? "collection"
        : "product";

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
      selectionIds: selectedResourcesIds,
    });
    // If the user closes the modal without selecting anything, newSelectedResources will be undefined
    if (!newSelectedResources) return;

    // Convert the selected resources to the base resource type
    const baseSelectedResources: string[] = newSelectedResources.map(
      (selectedResource: Resource) => {
        return selectedResource.id;
      },
    );
    updateSelectedResources(baseSelectedResources);
  };

  return (
    <>
      <Button
        onClick={showModalPicker}
        fullWidth
        variant={selectedResources?.length > 0 ? "secondary" : "primary"}
      >
        {resourceType === ProductResourceType.COLLECTION
          ? selectedResources?.length === 0
            ? "Select collections"
            : `${selectedResources?.length} collections selected`
          : selectedResources?.length === 0
            ? "Select products"
            : `${selectedResources?.length} products selected`}
      </Button>
    </>
  );
}
