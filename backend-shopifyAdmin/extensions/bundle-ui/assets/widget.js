const APP_URL = "https://sodium-snake-tommy-contributors.trycloudflare.com";

const bundleContainer = document.getElementById(
  "neat-bundles-widget-container",
);

async function getBundleData() {
  const response = await fetch(
    `${APP_URL}/api/bundleData?bundleId=${this.bundleId}&storeUrl=${this.shopDomain}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.json();
  console.log(data);
  return data;
}
