const fetchProducts = async (
  activeStepData,
  activeStepProducts,
  windowShopify,
  Shopify,
) => {
  if (activeStepData.stepType == "PRODUCT") {
    stepLoading = true;
    //Getting product handles for all products
    const productHandlesToFetch = activeStepData.productInput.products.map(
      (product) => product.shopifyProductHandle,
    );
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
