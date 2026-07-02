// Kleinanzeigen — Selektoren als Ergänzung zur generischen Extraktion.
ifInjectButton(function () {
  const data = {};
  const title = document.querySelector("#viewad-title");
  if (title) data.title = title.textContent.trim();
  const price = document.querySelector("#viewad-price");
  if (price) data.price = ifParseGermanNumber(price.textContent);
  const locality = document.querySelector("#viewad-locality");
  if (locality) {
    const m = locality.textContent.match(/(\d{5})\s+(.+)/);
    if (m) {
      data.zip = m[1];
      data.city = m[2].trim().split("-")[0].trim();
    }
  }
  // Detail-Liste: "Wohnfläche 58 m²", "Zimmer 2" etc.
  document.querySelectorAll("#viewad-details li").forEach((li) => {
    const text = li.textContent || "";
    if (/Wohnfläche/i.test(text)) data.living_area = ifParseGermanNumber(text);
    if (/Zimmer/i.test(text) && !/Badezimmer|Schlafzimmer/i.test(text)) {
      data.rooms = ifParseGermanNumber(text);
    }
  });
  return data;
});
