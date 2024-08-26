const APP_URL = "https://sodium-snake-tommy-contributors.trycloudflare.com";

document.addEventListener("alpine:init", () => {
  Alpine.data("bundle", () => ({
    init() {
      console.log(
        `${APP_URL}/api/bundleData?bundleId={{bundleId}}&storeUrl={{shop.permanent_domain}}`,
      );
      fetch(
        `${APP_URL}/api/bundleData?bundleId={{bundleId}}&storeUrl={{shop.permanent_domain}}`,
      )
        .then((response) => response.json())
        .then((data) => {
          this.bundleData = data;
        })
        .catch((error) => console.log("error", error));
    },

    shopDomain: "{{ shop.permanent_domain }}",
    bundleId: "{{ bundleId }}",
  }));
});
