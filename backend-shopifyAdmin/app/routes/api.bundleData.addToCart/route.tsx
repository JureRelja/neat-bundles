import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { bundleAndSteps } from "~/types/Bundle";
import db from "~/db.server";
import { JsonData } from "~/types/jsonData";
import { checkPublicAuth } from "~/utils/publicApi.auth";
import { FileStoreService } from "../../service/FileStoreService";
import { FileStoreServiceImpl } from "~/service/impl/FIleStoreServiceImpl";
import {
  BundleFullAndStepsFullDto,
  bundleFullStepsFull,
} from "~/dto/BundleFullAndStepsFullDto";
import { CustomerInputDto } from "../../dto/CustomerInputDto";
import { ProductInputDto } from "~/dto/ProductInputDto";
import { ContentInputsDto } from "../../dto/ContentInputsDto";
import { ContentDto } from "~/dto/ContentDto";

export const action = async ({ request }: ActionFunctionArgs) => {
  const res = await checkPublicAuth(request); //Public auth check

  console.log(request);
  if (!res.ok)
    return json(res, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });

  //Get query params
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") as string;
  const bundleId = url.searchParams.get("bundleId");

  try {
    const formData = await request.formData();

    const customerInputsJson = formData.get("customerInputs");
    const files: File[] | null = formData.get("files") as File[] | null;

    if (!customerInputsJson) {
      return json(new JsonData(true, "error", "Invalid form data.", []), {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 400,
      });
    }

    const customerInputs: CustomerInputDto[] = JSON.parse(
      customerInputsJson as string,
    );

    //Check if all bundle conditions are met

    const bundle: BundleFullAndStepsFullDto = (await db.bundle.findUnique({
      where: {
        id: Number(bundleId as string),
      },
      include: bundleFullStepsFull,
    })) as BundleFullAndStepsFullDto;

    let error = false;

    bundle.steps.forEach((step) => {
      const customerInputsOnThisStep = customerInputs.find(
        (input: CustomerInputDto) => {
          return input.getStepNumber() === step.stepNumber;
        },
      );

      if (
        !customerInputsOnThisStep ||
        customerInputsOnThisStep?.getStepType() != step.stepType
      )
        error = true;

      if (step.stepType === "PRODUCT") {
        //Check if the number of products is in the range
        const maxProductsOnThisStep: number = step.productInput
          ?.maxProductsOnStep as number;
        const minProductsOnThisStep: number = step.productInput
          ?.minProductsOnStep as number;

        const actualProductsOnThisStep: ProductInputDto =
          customerInputsOnThisStep?.getInput() as ProductInputDto;

        if (
          actualProductsOnThisStep.getProducts().length <
            minProductsOnThisStep ||
          actualProductsOnThisStep.getProducts().length > maxProductsOnThisStep
        )
          error = true;

        //Checking if the customer vas allowed to select the same product multiple times
        const allowMultipleSelections: boolean = step.productInput
          ?.allowProductDuplicates as boolean;

        const products = actualProductsOnThisStep.getProducts();

        if (!allowMultipleSelections) {
          products.forEach((product) => {
            if (product.getQuantity() > 1) {
              error = true;
            }
          });
        }

        //Check in the future if the customer is allowed to select the products that are selected
        //
        // Implementation
        //
      } else if (step.stepType === "CONTENT") {
        step.contentInputs?.forEach((contentInput) => {
          const contentInputOnThisStep: ContentInputsDto =
            customerInputsOnThisStep?.getInput() as ContentInputsDto;

          //Check if the number of content inputs is equal to the number of content inputs on the step
          if (
            contentInputOnThisStep.getContent().length !=
            step.contentInputs.length
          ) {
            error = true;
          }

          contentInputOnThisStep.getContent().forEach((content: ContentDto) => {
            //Check if the content is required and if the content is not empty
            if (content.length() == 0 && contentInput.required) error = true;

            //Check if the content is not too long
            if (content.length() > contentInput.maxChars) error = true;

            //Check if the content type is correct

            //prettier-ignore
            if (content.getType() === "file" &&contentInput.inputType != "IMAGE")error = true;

            //prettier-ignore
            if (content.getType() === "text" &&(contentInput.inputType != "TEXT" || "IMAGE"))error = true;
          });
        });
      }
    });

    if (error) {
      return json(new JsonData(true, "error", "Invalid form data.", []), {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 400,
      });
    }

    //Upload files to the file store
    if (!files) {
    } else {
      const fileStoreService: FileStoreService = new FileStoreServiceImpl();
      files.forEach((file: File) => {
        const result = fileStoreService.uploadFile(file);
      });
    }

    //Create a new dummy product variant with the bundle data and return the variant id

    // Implementation
  } catch (error) {
    console.log(error);
  }

  return json(
    new JsonData(false, "success", "Bundle succesfuly added to cart.", []),
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    },
  );
};
