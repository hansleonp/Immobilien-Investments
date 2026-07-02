// ImmoFinder-Extension — gemeinsame Logik für alle Portale.
// Extrahiert Inseratsdaten aus der GEÖFFNETEN Seite (JSON-LD → OpenGraph → Regex)
// und öffnet den ImmoFinder-Wizard mit vorbefüllten Feldern.

/** Deutsche Zahl ("285.000", "1.234,56", "58,5 m²") → Number oder null */
function ifParseGermanNumber(s) {
  if (s == null) return null;
  if (typeof s === "number") return Number.isNaN(s) ? null : s;
  const cleaned = String(s).replace(/[^\d.,]/g, "");
  if (!cleaned) return null;
  let normalized;
  if (cleaned.includes(",")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    const parts = cleaned.split(".");
    normalized =
      parts.length > 1 && parts[parts.length - 1].length === 3
        ? parts.join("")
        : cleaned;
  }
  const n = Number(normalized);
  return Number.isNaN(n) ? null : n;
}

/** Generische Extraktion aus der aktuellen Seite (funktioniert auf allen Portalen) */
function ifGenericExtract() {
  const data = {};

  // 1) JSON-LD
  const RELEVANT_TYPES = [
    "Product",
    "Offer",
    "Place",
    "Residence",
    "Apartment",
    "SingleFamilyResidence",
    "RealEstateListing",
  ];
  const nodes = [];
  document
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((script) => {
      try {
        const parsed = JSON.parse(script.textContent || "");
        const list = Array.isArray(parsed) ? parsed : [parsed];
        list.forEach((item) => {
          if (item && typeof item === "object") {
            nodes.push(item);
            if (Array.isArray(item["@graph"])) nodes.push(...item["@graph"]);
          }
        });
      } catch {
        /* defektes JSON-LD ignorieren */
      }
    });
  for (const node of nodes) {
    const type = [].concat(node["@type"] || []).join(",");
    if (!RELEVANT_TYPES.some((t) => type.includes(t))) continue;
    if (!data.title && typeof node.name === "string") data.title = node.name.trim();
    const offer = node.offers && !Array.isArray(node.offers) ? node.offers : (node.offers || [])[0];
    const price = node.price ?? (offer && offer.price);
    if (!data.price && price != null) data.price = ifParseGermanNumber(price);
    const image = Array.isArray(node.image) ? node.image[0] : node.image;
    if (!data.image_url && image) {
      data.image_url = typeof image === "string" ? image : image.url;
    }
    const addr = node.address;
    if (addr && typeof addr === "object") {
      if (!data.street && addr.streetAddress) data.street = String(addr.streetAddress).trim();
      if (!data.zip && addr.postalCode) data.zip = String(addr.postalCode).trim();
      if (!data.city && addr.addressLocality) data.city = String(addr.addressLocality).trim();
    }
    if (!data.living_area && node.floorSize) {
      data.living_area = ifParseGermanNumber(node.floorSize.value ?? node.floorSize);
    }
    if (!data.rooms && node.numberOfRooms != null) {
      data.rooms = ifParseGermanNumber(node.numberOfRooms.value ?? node.numberOfRooms);
    }
  }

  // 2) OpenGraph
  const og = (prop) => {
    const el = document.querySelector(`meta[property="${prop}"]`);
    return el ? el.getAttribute("content") : null;
  };
  if (!data.title) data.title = og("og:title") || document.title || undefined;
  if (!data.image_url) data.image_url = og("og:image") || undefined;
  if (data.title) {
    // Portal-Präfixe/Suffixe säubern ("Reserviert • Gelöscht • …", " | kleinanzeigen.de")
    data.title = data.title
      .replace(/^(?:(?:Reserviert|Gelöscht|Verkauft|TOP)\s*•\s*)+/i, "")
      .replace(/\s*\|\s*[^|]+$/, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // 3) Regex über den sichtbaren Text
  const text = document.body ? document.body.innerText.slice(0, 20000) : "";
  if (!data.price) {
    const m = text.match(/([\d.]{4,})\s*€/);
    if (m) data.price = ifParseGermanNumber(m[1]);
  }
  if (!data.living_area) {
    const m = text.match(/([\d.,]+)\s*m²/);
    if (m) data.living_area = ifParseGermanNumber(m[1]);
  }
  if (!data.rooms) {
    const m = text.match(/(\d+(?:[.,]5)?)\s*[-\s]?Zimmer/i);
    if (m) data.rooms = ifParseGermanNumber(m[1]);
  }
  if (!data.zip || !data.city) {
    // Zweiteilige Ortsnamen ("Bad Sassendorf") erlauben, Bundesländer ausschließen
    const m = text.match(
      /\b(\d{5})\s+([A-ZÄÖÜ][a-zäöüß.-]+(?:\s+[A-ZÄÖÜ][a-zäöüß.-]+|\s+am\s+\w+)?)/
    );
    const isState = (s) =>
      /^(Nordrhein|Rheinland|Baden|Sachsen|Niedersachsen|Bayern|Hessen|Thüringen|Brandenburg|Mecklenburg|Schleswig|Saarland)\b/.test(s);
    if (m && !isState(m[2])) {
      if (!data.zip) data.zip = m[1];
      if (!data.city) data.city = m[2].trim();
    } else if (m && !data.zip) {
      data.zip = m[1];
    }
  }

  data.source_url = window.location.href.split("#")[0];
  return data;
}

/** Objekt → base64url für den ?prefill=-Query-Param des Wizards */
function ifEncodePrefill(data) {
  const clean = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value != null && value !== "") clean[key] = value;
  });
  const bytes = new TextEncoder().encode(JSON.stringify(clean));
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Schwebenden Übernahme-Button einblenden. siteExtract kann Felder überschreiben. */
function ifInjectButton(siteExtract) {
  if (document.getElementById("immofinder-take-button")) return;

  const button = document.createElement("button");
  button.id = "immofinder-take-button";
  button.textContent = "🏠 In ImmoFinder übernehmen";
  Object.assign(button.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    zIndex: "999999",
    padding: "12px 18px",
    background: "#15803d",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "system-ui, sans-serif",
    boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
    cursor: "pointer",
  });
  button.addEventListener("mouseenter", () => (button.style.background = "#166534"));
  button.addEventListener("mouseleave", () => (button.style.background = "#15803d"));

  button.addEventListener("click", () => {
    button.textContent = "⏳ Lese Daten…";
    try {
      const generic = ifGenericExtract();
      const specific = typeof siteExtract === "function" ? siteExtract() || {} : {};
      const data = { ...generic, ...specific };
      const prefill = ifEncodePrefill(data);
      chrome.storage.sync.get({ appUrl: "https://immobilien-investments.vercel.app" }, ({ appUrl }) => {
        const base = appUrl.replace(/\/+$/, "");
        window.open(`${base}/immobilien/neu?prefill=${prefill}`, "_blank");
        button.textContent = "✓ Übernommen";
        setTimeout(() => (button.textContent = "🏠 In ImmoFinder übernehmen"), 3000);
      });
    } catch (e) {
      console.error("[ImmoFinder]", e);
      button.textContent = "⚠️ Fehler — Konsole prüfen";
    }
  });

  document.body.appendChild(button);
}
