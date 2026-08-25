import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AppBar } from "../components/ui";
import { useStore } from "../lib/store";
import { statusList, statusStyle } from "../lib/property";
import { formatEUR } from "../lib/scoring";
import { geocode, geocodeQuery } from "../lib/geocode";
import type { Property } from "../lib/types";

const BONN: [number, number] = [50.7353, 7.1005];

function pinColor(p: Property): string {
  const st = statusList(p.status);
  if (st.includes("Verworfen")) return "#B42318";
  if (st.includes("Gekauft")) return "#166534";
  if (st.includes("Verhandlung")) return "#8E2C66";
  if (st.includes("Besichtigung")) return "#5B3E9B";
  return "#1F4E78";
}

function pinIcon(color: string, hl: boolean): L.DivIcon {
  const s = hl ? 32 : 24;
  return L.divIcon({
    className: "",
    html: `<div class="mappin${hl ? " hl" : ""}" style="--c:${color}"></div>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s],
    popupAnchor: [0, -s + 4],
  });
}

export default function MapView() {
  const { properties, patchProperty } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markerRef = useRef<Map<string, L.Marker>>(new Map());
  const fitKeyRef = useRef<string>("");
  const geocodingRef = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const located = useMemo(
    () => properties.filter((p) => p.lat != null && p.lng != null),
    [properties]
  );
  const unlocated = useMemo(
    () => properties.filter((p) => (p.lat == null || p.lng == null) && geocodeQuery(p)),
    [properties]
  );

  // Punkte mit kleinem Versatz, wenn mehrere exakt dieselbe Koordinate haben
  const points = useMemo(() => {
    const arr = located.map((p) => ({ p, lat: p.lat as number, lng: p.lng as number }));
    const groups = new Map<string, typeof arr>();
    for (const it of arr) {
      const k = `${it.lat.toFixed(4)},${it.lng.toFixed(4)}`;
      const g = groups.get(k) ?? [];
      g.push(it);
      groups.set(k, g);
    }
    for (const g of groups.values()) {
      if (g.length > 1) {
        g.forEach((it, i) => {
          const ang = (2 * Math.PI * i) / g.length;
          it.lat += 0.0012 * Math.cos(ang);
          it.lng += 0.0012 * Math.sin(ang);
        });
      }
    }
    return arr;
  }, [located]);

  // Karte einmalig initialisieren
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true }).setView(BONN, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fehlende Koordinaten nach und nach geocoden (sequenziell, ~1/Sek.)
  useEffect(() => {
    if (geocodingRef.current || unlocated.length === 0) return;
    geocodingRef.current = true;
    let cancelled = false;
    (async () => {
      for (const p of unlocated) {
        if (cancelled) break;
        const q = geocodeQuery(p);
        if (!q) continue;
        const res = await geocode(q);
        if (res && !cancelled) patchProperty(p.id, { lat: res.lat, lng: res.lng });
        await new Promise((r) => setTimeout(r, 1100));
      }
      geocodingRef.current = false;
    })();
    return () => {
      cancelled = true;
      geocodingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocated.length]);

  // Marker aufbauen / aktualisieren
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    markerRef.current.clear();
    for (const { p, lat, lng } of points) {
      const m = L.marker([lat, lng], { icon: pinIcon(pinColor(p), p.id === selectedId) });
      m.bindPopup(`<b>${(p.titel || p.ort || "Objekt").replace(/</g, "&lt;")}</b>`);
      m.on("click", () => setSelectedId(p.id));
      m.addTo(layer);
      markerRef.current.set(p.id, m);
    }
    // Nur beim Wechsel der verorteten Menge auf alle Marker zoomen
    const key = points.map((x) => x.p.id).sort().join(",");
    if (key && key !== fitKeyRef.current) {
      fitKeyRef.current = key;
      const b = L.latLngBounds(points.map((x) => [x.lat, x.lng] as [number, number]));
      if (b.isValid()) map.fitBounds(b.pad(0.2), { maxZoom: 15 });
    }
  }, [points, selectedId]);

  // Ausgewähltes Objekt anfliegen + Popup
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const m = markerRef.current.get(selectedId);
    if (m) {
      map.panTo(m.getLatLng());
      m.openPopup();
    }
  }, [selectedId]);

  const selected = properties.find((p) => p.id === selectedId) || null;

  return (
    <>
      <AppBar title="Karte" back="/immobilien" />
      <main className="content wide mapwrap">
        <div ref={containerRef} className="propmap" />

        {selected && (
          <Link to={`/immobilien/${selected.id}`} className="card card-tappable mapcard">
            <div className="row1">
              <span className="dot" style={{ background: pinColor(selected) }} />
              <div className="titleblock">
                <div className="t">{selected.titel || selected.ort || "Objekt"}</div>
                <div className="s">
                  {[selected.adresse || selected.ort, statusList(selected.status).join(", ")]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
              <b>{formatEUR(selected.preis)}</b>
            </div>
          </Link>
        )}

        <div className="maplegend">
          {points.length > 0
            ? `${points.length} von ${properties.length} Objekten verortet`
            : properties.length
            ? "Objekte werden verortet …"
            : "Noch keine Objekte."}
          {unlocated.length > 0 && ` · ${unlocated.length} werden noch geladen`}
        </div>

        {/* Kompakte Liste als Alternative zum Antippen der Pins */}
        <div className="card form-list" style={{ marginTop: 12 }}>
          {[...properties]
            .filter((p) => p.lat != null && p.lng != null)
            .map((p) => {
              const st = statusStyle(statusList(p.status)[0]);
              return (
                <button
                  key={p.id}
                  className="frow maplistrow"
                  onClick={() => setSelectedId(p.id)}
                  style={{ textAlign: "left", background: p.id === selectedId ? "var(--divider-soft)" : "transparent" }}
                >
                  <span className="dot" style={{ background: pinColor(p) }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="t" style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.titel || p.ort || "Objekt"}
                    </span>
                    <span className="fineprint">{p.adresse || p.ort || "—"}</span>
                  </span>
                  <span className="badge" style={{ background: st.background, color: st.color }}>
                    {statusList(p.status)[0]}
                  </span>
                </button>
              );
            })}
        </div>
      </main>
    </>
  );
}
