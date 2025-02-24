// const fetchActiveStepData = async (bundleId, activeStepNumber, isBundleInPreview) => {
//     const response = await fetch(`${APP_URL}/bundleData/step?bundleId=${bundleId}&stepNum=${activeStepNumber}&neatBundlePreview=${isBundleInPreview}`, { mode: "cors" });

//     const data = await response.json();

//     if (data.ok) {
//         return data.data[0];
//     } else {
//         console.log(data.message);
//         alert("There was an error with fetching content for this step. Try refreshing the page.");
//         return null;
//     }
// };

// const fetchProducts = async (activeStepData, activeStepProducts, windowShopify, Shopify) => {
//     if (activeStepData.stepType == "PRODUCT") {
//         //Getting product handles for all products
//         const productHandlesToFetch = activeStepData.productInput.products.map((product) => product.shopifyProductHandle);
//         activeStepProducts.length = 0; //Clearing the array

//         const tempActiveStepProducts = [];

//         //Fetching products data
//         await Promise.all(
//             productHandlesToFetch.map(async (productHandle) => {
//                 try {
//                     const response = await fetch(windowShopify.routes.root + `products/${productHandle}.js`);

//                     let product = await response.json();

//                     if (product.id) {
//                         //Formating prices of products
//                         product = {
//                             ...product,
//                             price: product.price,
//                             priceForDisplay: Shopify.formatMoney(product.price),
//                             variants: product.variants.map((variant) => {
//                                 return {
//                                     ...variant,
//                                     price: variant.price,
//                                     priceForDisplay: Shopify.formatMoney(variant.price),
//                                 };
//                             }),
//                         };

//                         product.selectedVariantIndex = 0; //By default first variant is selected
//                         product.outOfStock = product.variants.every((variant) => !variant.available);

//                         product.options = product.options.filter((option) => option.name !== "Title" && option.values.length !== 1);

//                         tempActiveStepProducts.push(product);

//                         // //leaving only available variants
//                         // product.variants = product.variants.filter((variant) => variant.available);

//                         // if (product.variants.length > 0) {
//                         //   // Removing options values that don't have any available variants
//                         //   filterAvailableOptionsAndValues(product.options, product.variants);
//                         //   product.selectedVariantIndex = 0; //By default first variant is selected
//                         //   product.outOfStock = false

//                         //   activeStepProducts.push(product);
//                         // }
//                     } else {
//                         console.log(data.message);
//                     }
//                 } catch (error) {
//                     console.log(error);
//                 }
//             }),
//         );

//         //Sorting products by title
//         tempActiveStepProducts.sort((a, b) => {
//             return a.title.localeCompare(b.title);
//         });

//         //Adding products to the activeStepProducts array
//         activeStepProducts.push(...tempActiveStepProducts);
//     }
// };

// const finishAndAddBundleToCart = async (stepInputs, bundleId, shopDomain, Shopify, skipTheCart) => {
//     let formData = new FormData();

//     //Adding files to formData
//     stepInputs.forEach((stepInput) => {
//         if (stepInput.inputs && stepInput.inputs.length != 0 && stepInput.stepType == "CONTENT") {
//             //Adding files to formData
//             stepInput.inputs.forEach((content) => {
//                 if (content.type == "file") {
//                     //Extract blob from the old file
//                     let blob = content.value.slice(0, content.value.size, content.value.type);

//                     //Create new unique filename
//                     let newFileName = Date.now().toString() + content.value.name;

//                     //Create new file with old file blob and new unique name
//                     let newFile = new File([blob], newFileName, { type: content.value.type });

//                     //Add file to formData
//                     formData.append("files", newFile);
//                     console.log(newFile);

//                     //Save filename as a reference to a file
//                     content.value = newFile.name;
//                 }
//             });
//         }
//     });

//     //Adding products to formData
//     formData.append("customerInputs", JSON.stringify(stepInputs));

//     const response = await fetch(`${APP_URL}/bundleData/addToCart?bundleId=${bundleId}&shop=${shopDomain}`, {
//         method: "POST",
//         body: formData,
//     });

//     const result = await response.json();

//     if (result.ok) {
//         console.log(result);
//         const bundleVariantForCart = result.data;

//         let formData = {
//             items: [
//                 {
//                     id: bundleVariantForCart.bundleId,
//                     quantity: 1,
//                     properties: bundleVariantForCart.bundleInputsCustomer,
//                 },
//             ],
//         };
//         await fetch(Shopify.routes.root + "cart/add.js", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(formData),
//         }).catch((error) => {
//             console.error("Error:", error);
//         });

//         let bundleContentFormData = new FormData();

//         bundleContentFormData.append(`attributes[Customer inputs for bundle: ${bundleVariantForCart.bundleTitle}]`, bundleVariantForCart.bundleInputsAdmin);

//         await fetch(Shopify.routes.root + "cart/update.js", {
//             method: "POST",
//             body: bundleContentFormData,
//         })
//             .then(() => {
//                 // console.log("Bundle added to cart", skipTheCart);
//                 setTimeout(() => {
//                     if (skipTheCart) window.location.href = `/checkout`;
//                     else window.location.href = `/cart`;
//                 }, 100);
//             })
//             .catch((error) => {
//                 console.log("error", error);
//             });
//     } else {
//         console.log(result.message);
//         alert("There was an error with adding the bundle to the cart. Try refreshing the page.");
//     }
// };
