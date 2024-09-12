import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "~/db.server";
import { JsonData } from "~/types/jsonData";
import { checkPublicAuth } from "~/utils/publicApi.auth";
import { FileStoreService } from "../../service/FileStoreService";
import { FileStoreServiceImpl } from "~/service/impl/FIleStoreServiceImpl";
import {
  BundleFullAndStepsFullDto,
  bundleFullStepsFull,
} from "~/dto/BundleFullAndStepsFullDto";
import { CustomerInput } from "../../dto/CustomerInputDto";
import { ProductDto } from "~/dto/ProductDto";
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

    const customerInputs: CustomerInput[] = JSON.parse(
      formData.get("customerInputs") as string,
    ) as CustomerInput[];
    const files: File[] | null = formData.get("files") as File[] | null;

    if (!customerInputs) {
      return json(new JsonData(true, "error", "Invalid form data.", []), {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 400,
      });
    }

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
        (input: CustomerInput) => {
          return input.stepNumber === step.stepNumber;
        },
      );

      if (
        !customerInputsOnThisStep ||
        customerInputsOnThisStep?.stepType != step.stepType
      ) {
        error = true;
        return;
      }

      if (step.stepType === "PRODUCT") {
        //Check if the number of products is in the range
        const maxProductsOnThisStep: number = step.productInput
          ?.maxProductsOnStep as number;
        const minProductsOnThisStep: number = step.productInput
          ?.minProductsOnStep as number;

        const actualProductsOnThisStep: ProductDto[] =
          customerInputsOnThisStep?.inputs as ProductDto[];

        if (
          actualProductsOnThisStep.length < minProductsOnThisStep ||
          actualProductsOnThisStep.length > maxProductsOnThisStep
        ) {
          error = true;
          return;
        }

        //Checking if the customer vas allowed to select the same product multiple times
        const allowMultipleSelections: boolean = step.productInput
          ?.allowProductDuplicates as boolean;

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
      } else if (step.stepType === "CONTENT") {
        const contentInputs: ContentDto[] =
          customerInputsOnThisStep?.inputs as ContentDto[];

        step.contentInputs?.forEach((contentInput) => {
          //Customer content input on this step
          const contentInputsOnThisStep: ContentDto = contentInputs.find(
            (input) => {
              console.log(input, contentInput);
              return input.id == contentInput.id;
            },
          ) as ContentDto;

          //Check if the content is required and if the content is not empty
          if (
            contentInputsOnThisStep.value.length == 0 &&
            contentInput.required
          ) {
            error = true;
            return;
          }

          //Check if the content is not too long
          if (contentInputsOnThisStep.value.length > contentInput.maxChars) {
            error = true;
            return;
          }

          //Check if the content type is correct

          //prettier-ignore
          if (contentInputsOnThisStep.type === "file" && contentInput.inputType != "IMAGE") { error = true; return;}

          //prettier-ignore
          if (contentInputsOnThisStep.type === "text" && !(contentInput.inputType === "TEXT" || contentInput.inputType === "NUMBER")) { error = true; return ;}
          console.log(error);
        });
      }
    });

    if (error) {
      return json(new JsonData(false, "error", "Invalid form data.", []), {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      });
    }

    //Upload files to the file store
    if (!files) {
    } else {
      const fileStoreService: FileStoreService = new FileStoreServiceImpl();
      if (files.length > 0) {
        files.forEach((file: File) => {
          const result = fileStoreService.uploadFile(file);
        });
      } else {
        const result = fileStoreService.uploadFile(files[0]);
      }
    }

    //Create a new dummy product variant with the bundle data and return the variant id

    // Implementation
  } catch (error) {
    console.log(error);
  }

  return json(
    new JsonData(true, "success", "Bundle succesfuly added to cart.", []),
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    },
  );
};
