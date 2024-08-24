const bundleContainer = document.getElementById(
  "neat-bundles-widget-container",
);

document.addEventListener("alpine:init", () => {
  Alpine.data("bundle", () => ({
    bundleId: bundleContainer.getAttribute("data-bundle-id"),
    shopDomain: bundleContainer.getAttribute("data-shop-domain"),
    async init() {
      await this.getData();
    },

    async getData() {
      await fetch(`https://www-forum-technological-raw.trycloudflare.com/app`);
      //quickstart-24926068.myshopify.com/apps/neat-bundle-api/app
      https: await fetch(
        `https://${this.shopDomain}/apps/neat-bundle-api/`,
      ).then((response) => console.log(response));
    },
  }));
});
