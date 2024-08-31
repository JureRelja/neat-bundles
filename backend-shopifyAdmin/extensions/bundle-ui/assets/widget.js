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

//Function for filtering only product options that are available and used in the product
const filterAvailableOptionsAndValues = (productOptions, productVariants) => {
  productOptions = productOptions.map((option) => {
    return {
      ...option,
      values: option.values.filter((value) => {
        return productVariants.some(
          (variant) =>
            variant.options[productOptions.indexOf(option)] === value,
        );
      }),
    };
  });

  //Removing title option and options that don't have any available values
  productOptions = productOptions.filter((option) => {
    //Option with name "Title" is a default option that is present on products that don't have any variants specified
    if (option.name == "Title" && option.values.length == 1) return false;

    // Removing options that don't have any available values
    return option.values.length > 0;
  });
};
