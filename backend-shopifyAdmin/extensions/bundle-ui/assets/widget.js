const APP_URL = "https://operational-integer-milk-ict.trycloudflare.com";

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
      await fetch(`${APP_URL}/api`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
        });
    },
  }));
});
