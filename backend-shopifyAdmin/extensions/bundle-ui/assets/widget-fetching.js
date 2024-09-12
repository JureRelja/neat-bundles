const fetchActiveStepData = async (bundleId, activeStepNumber) => {
  const data = await fetch(
    `${APP_URL}/bundleData/step?bundleId=${bundleId}&stepNum=${activeStepNumber}`,
    { mode: "cors" },
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.ok) {
        return data.data[0];
      } else {
        console.log(data.message);
        alert(
          "There was an error with fetching content for this step. Try refreshing the page.",
        );
      }
    })
    .catch((error) => {
      console.log("error", error);
      alert(
        "There was an error with fetching content for this step. Try refreshing the page.",
      );
    });
  return data;
};

const fetchProducts = async (
  activeStepData,
  activeStepProducts,
  windowShopify,
  Shopify,
) => {
  if (activeStepData.stepType == "PRODUCT") {
    //Getting product handles for all products
    const productHandlesToFetch = activeStepData.productInput.products.map(
      (product) => product.shopifyProductHandle,
    );
    activeStepProducts.length = 0; //Clearing the array

    //Fetching products data
    await Promise.all(
      productHandlesToFetch.map(async (productHandle) => {
        fetch(windowShopify.routes.root + `products/${productHandle}.js`)
          .then((response) => response.json())
          .then((product) => {
            if (product.id) {
              //Formating prices of products
              product = {
                ...product,
                price: Shopify.formatMoney(product.price),
                variants: product.variants.map((variant) => {
                  return {
                    ...variant,
                    price: Shopify.formatMoney(variant.price),
                  };
                }),
              };

              product.selectedVariantIndex = 0; //By default first variant is selected
              product.outOfStock = product.variants.every(
                (variant) => !variant.available,
              );

              product.options = product.options.filter(
                (option) =>
                  option.name !== "Title" && option.values.length !== 1,
              );

              activeStepProducts.push(product);

              // //leaving only available variants
              // product.variants = product.variants.filter((variant) => variant.available);

              // if (product.variants.length > 0) {
              //   // Removing options values that don't have any available variants
              //   filterAvailableOptionsAndValues(product.options, product.variants);
              //   product.selectedVariantIndex = 0; //By default first variant is selected
              //   product.outOfStock = false

              //   activeStepProducts.push(product);
              // }
            } else {
              console.log(data.message);
            }
          })
          .catch((error) => {
            console.log("error", error);
          });
      }),
    );
  }
};

const finishAndAddBundleToCart = async (
  stepInputs,
  bundleId,
  shopDomain,
  Shopify,
) => {
  let formData = new FormData();

  //Adding files to formData
  stepInputs.forEach((stepInput) => {
    if (
      stepInput.inputs &&
      stepInput.inputs.length != 0 &&
      stepInput.stepType == "CONTENT"
    ) {
      //Adding files to formData
      stepInput.inputs.forEach((content) => {
        if (content.type == "file") {
          formData.append("files", content.value);
          content.value = content.value.name;
        }
      });
    }
  });

  //Adding products to formData
  console.log(stepInputs);
  formData.append("customerInputs", JSON.stringify(stepInputs));

  const response = await fetch(
    `${APP_URL}/bundleData/addToCart?bundleId=${bundleId}&shop=${shopDomain}`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (data.ok) {
    window.location.href = Shopify.routes.cart_url;
  } else {
    console.log(data.message);
    alert(
      "There was an error with adding the bundle to the cart. Try refreshing the page.",
    );
  }
};
