-- Beethovenstr. 50 (Bonn-Weststadt): Nachlieferung Makler 25.08.2026 — WP 2026 + Anhang zum ETV-Protokoll 03.08.2026.
-- Hausgeld springt 2026 auf ~437 EUR/M (Whg 361,30 + Garage 75,67; 2025: 320) wegen 25-T-Instandhaltungsprogramm.
-- Konservative Preistreppe faellt; Erstgebot 155.000 bestaetigt, hartes Limit auf ~165.000 gesenkt. ETV-Protokoll fehlt weiter.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

update public.search_properties
set
  data = data || jsonb_build_object(
    'datum', '2026-08-25',
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', 'c9e14f77-6a2b-4d38-8f05-1e7a94b3c261',
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', 'Nachlieferung Makler: WP 2026 + Anhang ETV-Protokoll 03.08. ausgewertet - Hausgeld 2026 springt auf ~437 EUR/M (+37 %), hartes Limit auf 165 T gesenkt. ETV-Protokoll selbst fehlt weiter.'
        )
      ),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'Nachlieferung 25.08.2026 (4 PDFs, Ordner "Nachlieferung 2026-08-25"): WP 2026, Anhang zum ETV-Protokoll 03.08.2026, Expose (bekannt), ETV-Protokoll 03.07.2025 (Dublette). DAS EIGENTLICHE ETV-PROTOKOLL 03.08.2026 FEHLT WEITERHIN - nur der Anhang kam (Anmerkung Dr. Meurs, Nur-Garagen-Eigentuemer, zum Stimmrechtsausschluss; er WIDERSPRICHT der Kostenverteilung in Jahresabrechnung 2025 und WP 2026 -> Anfechtungs-/Nacharbeitsrisiko beim WP, betrifft 2 Nur-Garagen-Eigentuemer).'
      || E'\n' || 'WP 2026 (BB & Partner, erstellt 23.07.2026): Hausgeld springt massiv - Whg (Einheit 1) 4.335,56 EUR/J = 361,30 EUR/M (2025: 268), Garage (Einheit 28) 908,03 EUR/J = 75,67 EUR/M (2025: 52) -> GESAMT ~437 EUR/M statt 320 (+37 %). Treiber: 25.000 EUR Instandhaltungsbudget 2026 WEG-weit (TOP-7-Programm: Wandanschluss, Bleirohre, Glasdach Hinterhof, Hofgestaltung, Tauben, Kanal-Kamera; Whg-Anteil 4,1 % = 1.025 EUR/J n. uml.) + Ruecklagenzufuehrung weiter 21.500 EUR/J. Auffaellig: Gebaeudeversicherung 15.878 EUR/J (sehr hoch, passt zur Schadenhistorie) + Position "Einnahmen/Erstattungen Versicherungen 10.000 EUR" (versicherte Schadensreparaturen laufen durch den Plan).'
      || E'\n' || 'Neue Rechnung: Whg umlagefaehig ~119 EUR/M -> Eigentuemerlast Whg ~242 EUR/M inkl. Ruecklage; Garage netto ~66 EUR/M (Mieterin zahlt nur 10 EUR NK-Pauschale) -> EIGENTUEMERLAST 2026 GESAMT ~308 EUR/M (bisher konservativ 220 angenommen). Konservativer CF-0-Preis: ~120.500 EUR (2026-Planlast) bzw. ~136.000 EUR normalisiert (Instandhaltung zurueck auf ~10 T/J nach Abarbeitung TOP-7). Bei 160.000: CF konservativ -158 EUR/M (2026) bzw. ~-95 (normalisiert); Liquiditaetsschranke -250 haelt. App-Logik unveraendert (CF-0 197.500).'
      || E'\n' || 'Konsequenz: Erstgebot 155.000 EUR bestaetigt, HARTES LIMIT von 170.000 auf ~165.000 GESENKT. Verhandlungsargument neu: dokumentierter Hausgeld-Sprung +37 % im WP 2026. Vor Gebot weiter zwingend: ETV-Protokoll 03.08. (wurde WP 2026 so beschlossen? Sonderumlage TOP 8? Verwalterkuendigung TOP 11?), Mietkonto-Nachweis (700 kalt?), Therme-Rechnung. Besichtigung 27.08.2026 17:00 steht.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';
