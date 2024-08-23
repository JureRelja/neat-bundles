//Embeding the widget in the page

window.onload = function () {
  const widgetContainer = document.getElementById(
    "neat-bundles-widget-347204u230",
  );

  const mainContentShopify = document.getElementById("MainContent");

  let clone = widgetContainer.content.cloneNode(true);

  mainContentShopify.insertBefore(clone, mainContentShopify.firstChild); //Inserting the widget at the top of the page
};
