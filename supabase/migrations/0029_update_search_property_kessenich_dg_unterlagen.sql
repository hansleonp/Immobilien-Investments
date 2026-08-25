-- Update: Kessenich-DG (Kleinanzeigen 3438579091 / Becker-2397) — Nachbewertung 10.08.2026 mit Objektunterlagen
-- (Grundbuch, Teilungserklaerung 1980, Aufteilungsplaene, Energieausweis, Hausgeld-Aufstellung 2026,
-- Grundbesitzabgaben 2023-2025, Versicherung, Strom-/Wasserabrechnungen, Verbrauchsliste).
-- Urteil bestaetigt (Kaufen wenn Preis passt), konservativer Zielpreis leicht auf ~209.000 EUR verbessert.
-- Adresse jetzt bekannt: Kessenicher Str. 134 (grundbuchlich Gemarkung Dottendorf).
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

update public.search_properties
set
  data = data || jsonb_build_object(
    'adresse', 'Kessenicher Str. 134',
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      'Analyse 10.08.2026 (Nachbewertung mit Objektunterlagen): Kaufen wenn Preis passt - bestaetigt. Zielpreis ~210.000 EUR (konservativ CF 0 jetzt bei ~209.000 EUR statt 206.500, da n. uml. Hausgeld real nur 40 EUR; App-Logik CF 0 bei 233.300 EUR), max. ~220.000 EUR. Bei 238.000 EUR: CF -18 (App-Logik), konservativ ca. -111 EUR/Monat (n. uml. 40 EUR Ruecklagenzufuehrung + eigene Instandhaltungsreserve 0,80 EUR/m2 = 53 EUR), Faktor 22,2, Brutto 4,5 %.'
      || E'\n' || 'Neu aus den Unterlagen: Adresse Kessenicher Str. 134 - grundbuchlich Gemarkung DOTTENDORF Blatt 626 (Grenzlage zu Kessenich, Vermarktung als Kessenich). Grundbuch LASTENFREI (Abt. II und III komplett geloescht), Eigentuemerin C. Jalowy seit 2017, Verkauf aus einer Hand. WE Nr. 6 = DG rechts, 1/6 MEA, Keller Nr. 6 + PKW-Garage Nr. 1 im Hof als Sondereigentum sauber im Grundbuch. Kein Vorkaufsrecht auf WE 6 (Vorkaufsrecht der TE betrifft nur WE 5). Etagen-Widerspruch geklaert: DG = 2. OG (EG + 1. OG + DG). Hausgeld 2026 real 126,60 EUR/M (1.519,16 EUR/J: Grundabgaben 283 + Versicherung 406,30 + Schornsteinfeger 164,30 + Allg. Strom/Wasser 185,64 + Ruecklage 480); Grundsteuer 224,43 EUR/J (2025, nach Reform gesunken) wird direkt beim Eigentuemer erhoben - beides umlagefaehig. Energieausweis C (80,7 kWh, Verbrauch, bis 02.11.2031) bestaetigt; Ausweis nennt Waermeerzeuger-Bj. 2014.'
      || E'\n' || 'Red Flags: (1) LAIENVERWALTUNG - WEG vertreten durch Miteigentuemer J.-N. Gerbens, Abrechnungen informell (Excel/handschriftlich), keine WEG-konformen Jahresabrechnungen/Protokolle/Beschlusssammlung vorgelegt; Bauers + Gerbens zahlen fuer ihre Verwaltungsdienste WENIGER Ruecklage ein. (2) Ruecklagenzufuehrung WEG-weit nur ~2.880 EUR/J (40 EUR/Einheit/M), STAND UNBEKANNT - Dach Bj. 1959 ueber dem DG = jedes groessere Gewerk laeuft auf Sonderumlage hinaus. (3) Gebaeudeversicherungs-Police fehlt (vorgelegt nur Haftpflicht 53,20 EUR/J), Elementarschutz/Unterversicherung unklar. (4) Heizung widerspruechlich: Verbrauchsliste 2007 nennt DG rechts Etagenheizung Bj. 2000, Energieausweis 2014, Inserat "veraltetes Kachelofenmodell" - Tausch ~8-12 TEUR Eigen-Capex einpreisen. (5) Wohnflaeche unbelegt: Inserat 66 m2, alte SV-Aufstellung 70 m2, TE ohne m2 - WoFl-Berechnung fehlt. (6) Wasser wird nicht je Einheit erfasst (Umlage nach Personenzahl lt. TE) - NK-Abrechnung als Vermieter aufwendig, Kessenicher Str. ist zudem befahrene Durchgangsstrasse.'
      || E'\n' || 'Mietansatz unveraendert (bezugsfrei): 12,50 EUR/m2 = 825 EUR + Garage ~70 EUR = 895 EUR kalt, konservativ (Kessenich-Schnitt ~14,26 EUR/m2 - Luft nach oben; bei real 70 m2 weiteres Potenzial).'
      || E'\n' || 'Fehlt weiterhin: Ruecklagenstand/WEG-Kontoauszug, ETV-Protokolle bzw. Beschluesse, Wirtschaftsplan, Gebaeudeversicherungs-Police, Wohnflaechenberechnung, Baujahr/Wartung der Gastherme WE 6.'
      || E'\n' || 'Status: Unterlagen von Hrn. Kalf (Becker Immobilien) erhalten 10.08.2026; Antwort-Mail mit Dank, gezielten Nachfragen und Besichtigungswunsch entworfen.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/gepflegte-3-zimmer-dg-wohnung-mit-sonnenbalkon-und-pkw-garage-in-beliebter-lage-von-bonn-kessenich/3438579091-196-23696';
