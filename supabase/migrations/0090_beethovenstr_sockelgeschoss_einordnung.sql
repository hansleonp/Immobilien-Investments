-- Beethovenstr. 50: Einordnung nach Street-View-Foto 28.08.2026 — Wohnung liegt im Sockelgeschoss
-- (Souterrain-Charakter, Fenster tief hinter Hecke, Hauseingang erhoeht). Rechtlich KEINE Kellerwohnung
-- (Wohnungseigentum, 2,83 m, WoFlV 100 %), aber unterste/unattraktivste Einheit des Hauses.
-- Konsequenzen: Wertaufholungs-Best-Case gestutzt, Zweitbesichtigungs-Pruefpunkte ergaenzt, 155-Limit hart.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'SOCKELGESCHOSS-EINORDNUNG 28.08.2026 (Street-View-Foto, deckt sich mit Besichtigungseindruck "alter Kellerraum"): Die Wohnung ist rechtlich KEINE Kellerwohnung (eigenes Wohnungseigentum, 2,83 m lichte Hoehe, WoFlV zu 100 % angerechnet, Fenster ueber Gelaende), aber faktisch ein Sockelgeschoss mit Souterrain-Charakter - Fenster deutlich tiefer als Hochparterre, teils hinter Hecke, Hauseingang erhoeht. Unterste und unattraktivste Einheit des Hauses; erklaert die niedrige Miete (10,60/m2), die zwei abgesprungenen Interessenten und den Verkaufsdruck.'
      || E'\n' || 'KONSEQUENZEN: (1) Wertaufholungs-Best-Case gestutzt: realistische Obergrenze fuer Sockel-EG eher 3.600-4.000 EUR/m2 (~210-235 T) statt 4.000+ - Grundrichtung bleibt, Turbo kleiner. (2) Exit fast sicher wieder an Anleger (Eigennutzer kaufen Souterrain-Optik selten). (3) WG-/Neuvermietungsansatz auf ~820-880 EUR eingedampft (statt ~900). (4) LIMIT 155.000 IST HART - Best Case traegt keinen Euro mehr. NEUE PRUEFPUNKTE ZWEITBESICHTIGUNG (Handwerker): Feuchtemessung Sockelwaende (v. a. Hofseite - ETV-TOP 7.6 Wandanschluss!), Fensterbruestungshoehen vs. Gelaende (Starkregen/Rueckstau), Keller unter der Wohnung ansehen, klaeren ob Gebaeudeversicherung (15,9 T/J) Elementar einschliesst.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';
