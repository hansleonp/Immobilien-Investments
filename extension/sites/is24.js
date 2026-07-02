// ImmobilienScout24 — Selektoren als Ergänzung zur generischen Extraktion.
ifInjectButton(function () {
  const data = {};
  const title = document.querySelector("#expose-title, h1[data-qa='expose-title']");
  if (title) data.title = title.textContent.trim();
  const price = document.querySelector(".is24qa-kaufpreis, [data-qa='is24qa-kaufpreis']");
  if (price) data.price = ifParseGermanNumber(price.textContent);
  const area = document.querySelector(".is24qa-wohnflaeche-ca, .is24qa-wohnflaeche");
  if (area) data.living_area = ifParseGermanNumber(area.textContent);
  const rooms = document.querySelector(".is24qa-zi, .is24qa-zimmer");
  if (rooms) data.rooms = ifParseGermanNumber(rooms.textContent);
  const address = document.querySelector(".address-block, [data-qa='is24-expose-address']");
  if (address) {
    const m = address.textContent.match(/(\d{5})\s+([A-ZÄÖÜ][\wäöüß-]+)/);
    if (m) {
      data.zip = m[1];
      data.city = m[2];
    }
  }
  return data;
});
