//Function to format money

//https://gist.github.com/stewartknapman/8d8733ea58d2314c373e94114472d44c
Shopify.formatMoney = function (cents, format) {
  if (typeof cents == "string") {
    cents = cents.replace(".", "");
  }
  let value = "";
  let placeholderRegex = /{{\s*(\w+)\s*}}/;
  let formatString = format || this.money_format;
  function defaultOption(opt, def) {
    return typeof opt == "undefined" ? def : opt;
  }
  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ",");
    decimal = defaultOption(decimal, ".");
    if (isNaN(number) || number == null) {
      return 0;
    }
    number = (number / 100.0).toFixed(precision);
    var parts = number.split("."),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands),
      cents = parts[1] ? decimal + parts[1] : "";
    return dollars + cents;
  }
  switch (formatString.match(placeholderRegex)[1]) {
    case "amount":
      value = formatWithDelimiters(cents, 2);
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0);
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ".", ",");
      break;
  }
  return formatString.replace(placeholderRegex, value);
};

//Function to find a product variant for a given set of selected options
const findVariantIndex = (selectedOptions, productVariants) => {
  const index = productVariants.findIndex((variant) => {
    return variant.options.every((option, index) => {
      const res = option === selectedOptions[index];
      return res;
    });
  });

  return index;
};

// //Function for filtering only product options that are available and used in the product
// const filterAvailableOptionsAndValues = (productOptions, productVariants) => {
//   productOptions = productOptions.map((option) => {
//     return {
//       ...option,
//       values: option.values.filter((value) => {
//         return productVariants.some(
//           (variant) =>
//             variant.options[productOptions.indexOf(option)] === value,
//         );
//       }),
//     };
//   });

//   //Removing title option and options that don't have any available values
//   productOptions = productOptions.filter((option) => {
//     //Option with name "Title" is a default option that is present on products that don't have any variants specified
//     if (option.name == "Title" && option.values.length == 1) return false;

//     // Removing options that don't have any available values
//     return option.values.length > 0;
//   });
// };

//Function to add products to bundle storage
const addProductToBundle = (
  productId,
  activeStepNumber,
  stepInputs,
  maxProductsOnStep,
) => {
  if (getProductsOnStep(activeStepNumber, stepInputs) >= maxProductsOnStep)
    return;

  //Finding the index of the step in the stepInputs array
  const thisStepIndex = stepInputs.findIndex((step) => {
    return step.stepNumber == activeStepNumber;
  });

  //If there are already inputs started on this step
  if (thisStepIndex != -1) {
    //Checking if the product is already added on this step
    const productAlreadyAdded = stepInputs[thisStepIndex].products.find(
      (product) => product.id == productId,
    );

    //If the product is not already added on this step
    if (!productAlreadyAdded) {
      stepInputs[thisStepIndex].products.push({
        id: productId,
        quantity: 1,
      });
      //If the product is already added on this step
    } else {
      productAlreadyAdded.quantity++;
    }

    //If there are no inputs started on this step
  } else {
    stepInputs.push({
      stepNumber: activeStepNumber,
      products: [{ id: productId, quantity: 1 }],
    });
  }
};

const removeProductFromBundle = (productId, activeStepNumber, stepInputs) => {
  //Finding the index of the step in the stepInputs array
  const thisStepIndex = stepInputs.findIndex((step) => {
    return step.stepNumber == activeStepNumber;
  });

  if (thisStepIndex == -1) return;

  //Checking if the product is already added on this step
  const productInBundle = stepInputs[thisStepIndex].products.find(
    (product) => product.id == productId,
  );

  if (!productInBundle) return;

  //If the product quantity is more than 1
  if (productInBundle.quantity > 1) {
    productInBundle.quantity--;
    //If the product quantity is 1
  } else {
    stepInputs[thisStepIndex].products = stepInputs[
      thisStepIndex
    ].products.filter((product) => product.id != productId);
  }
};

//Function to get the total quantity of one product in the bundle
const getProductQuantityInBundle = (
  productId,
  stepInputs,
  activeStepNumber,
) => {
  const thisStepIndex = stepInputs.findIndex((step) => {
    return step.stepNumber == activeStepNumber;
  });

  if (thisStepIndex == -1) return 0;

  const productInBundle = stepInputs[thisStepIndex].products.find(
    (product) => product.id == productId,
  );

  if (!productInBundle) return 0;

  return productInBundle.quantity;
};

const getProductsOnStep = (activeStep, stepInputs) => {
  if (!stepInputs[activeStep - 1] || !stepInputs[activeStep - 1].products)
    return 0;

  return stepInputs[activeStep - 1].products.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);
};

//Function to get the total quantity of all products in the bundle
const getTotalProductsInBundle = (stepInputs) => {
  return stepInputs.reduce((stepAcc, step) => {
    if (!step.products) return stepAcc;

    return (
      stepAcc +
      step.products.reduce((productAcc, product) => {
        return productAcc + product.quantity;
      }, 0)
    );
  }, 0);
};

//Check if product is already in bundle storage
const isProductInBundle = (productId, stepInputs, activeStep) => {
  return (
    stepInputs[activeStep - 1] &&
    stepInputs[activeStep - 1].products.some(
      (p) => p.id == productId && p.quantity > 0,
    )
  );
};

//Function to add imput value to bundle storage
const handleContentInput = (
  event,
  stepInputs,
  activeStepNumber,
  contentInputId,
) => {
  console.log(event.target.files ? event.target.files[0] : event.target.value);
  //If there are no inputs started yet
  if (stepInputs.length == 0) {
    stepInputs.push({
      stepNumber: activeStepNumber,
      content: [
        {
          id: contentInputId,
          value: event.target.files
            ? event.target.files[0]
            : event.target.value,
        },
      ],
    });
  } else {
    //Inputs already started
    //Finding the step in the stepInputs array
    const stepInput = stepInputs.find((step) => {
      return step.stepNumber == activeStepNumber;
    });

    //If there is already an input started on this step
    if (stepInput) {
      const contentInputIndex = stepInput.content.findIndex((content) => {
        return content.id == contentInputId;
      });

      //If there is already an input with the same id
      if (contentInputIndex != -1) {
        stepInput.content[contentInputIndex] = {
          ...stepInput.content[contentInputIndex],
          value: event.target.files
            ? event.target.files[0]
            : event.target.value,
        };
      }
      //No input with the same id
      else {
        stepInput.content.push({
          id: contentInputId,
          value: event.target.files
            ? event.target.files[0]
            : event.target.value,
        });
      }
    }
    //Nothing added to the step yet
    else {
      stepInputs.push({
        stepNumber: activeStepNumber,
        content: [
          {
            id: contentInputId,
            value: event.target.files
              ? event.target.files[0]
              : event.target.value,
          },
        ],
      });
    }
  }
};

//Function for creating a preview of the selected images
const createImagePreview = (event) => {
  let files = event.target.files;
  let preview = document.getElementById(`preview-${event.target.id}`);

  // Clear any existing content
  preview.innerHTML = "";

  let file = files[0];

  // Only process image files
  if (!file.type.match("image.*")) {
    return;
  }

  let imgContainer = document.createElement("div");

  let img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.style.width = "200px";
  img.style.maxHeight = "180px";
  img.style.display = "block"; // Ensure the image is displayed in a block to put it on a new line

  var changeImageText = document.createElement("p");
  changeImageText.textContent = `Click to change image`;
  changeImageText.style.fontSize = "14px";
  changeImageText.style.marginTop = "5";

  imgContainer.appendChild(img);
  imgContainer.appendChild(changeImageText);

  // Append the image to the preview div
  preview.appendChild(imgContainer);
};
