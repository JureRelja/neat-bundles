import Alpine from "alpinejs";

window.Alpine = Alpine;

Alpine.start();

const apiURL = "https://gb-pick-pledge-iv.trycloudflare.com/app/bundles"; //Change this URL when redeploying the backend

//Getting the list of all bundles created in the store
async function getBundle(bundleId) {
  let response = await fetch(`${apiURL}/${bundleId}`, {
    method: "GET",
    body: JSON.stringify(),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
}

//Managing bundle state
Alpine.data("bundleData", () => ({
  init() {
    this.getBundleData(this.$el.getAttribute("data-bundle-id"));
  },
  bundle: null,
  async getBundleData(bundleId) {
    this.bundle = await getBundle(bundleId);
  },
}));
