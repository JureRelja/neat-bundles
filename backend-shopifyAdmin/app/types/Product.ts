export type ProductResponse = {
  data: {
    product: Product;
  };
};

export type CollectionProductResponse = {
  data: {
    collection: {
      products: {
        nodes: Product[];
      };
    };
  };
};

export type Product = {
  availableForSale: boolean;
  title: string;
  featuredImage: {
    url: string;
  };
  descriptionHtml: string;
  variants: {
    nodes: {
      price: {
        currencyCode: string;
        amount: number;
      };
      image: {
        url: string;
      };
    };
  };
};

export type ProductResource = {
  shopifyId: string;
  handle: string;
};
