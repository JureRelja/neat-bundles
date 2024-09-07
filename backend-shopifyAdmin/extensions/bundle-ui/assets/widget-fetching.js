const fetchActiveStepData = async (bundleId, activeStepNumber) => {
  console.log(activeStepNumber);
  const data = await fetch(
    `${APP_URL}/bundleData/step?bundleId=${bundleId}&stepNum=${activeStepNumber}`,
    { mode: "cors" },
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.ok) {
        console.log(data.data[0]);
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
) => {};
