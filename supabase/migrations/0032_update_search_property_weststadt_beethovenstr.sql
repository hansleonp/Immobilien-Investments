-- Update: Bonn-Weststadt, Beethovenstr. 50 (IS24 169615019 / Kleinanzeigen 3470543584) — Maklerauskunft 12.08.2026.
-- Neu: letzte Mieterhoehung 06/2023 (§558-Erhoehung sofort moeglich, Kappung 15 % -> bis ~805 EUR);
-- Grundbuchauszug zeigt aktuell KEINE Garage -> Garagenmiete bis Klaerung nicht einpreisen; weitere Unterlagen zugesagt.
-- Urteil bleibt "Kaufen wenn Preis passt", Zielpreis 190.000 EUR nur MIT gesicherter Garage.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte, damit der Local-first-Sync die Aenderung uebernimmt.

update public.search_properties
set
  data = data || jsonb_build_object(
    'datum', '2026-08-12',
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'Update 12.08.2026 (Maklerauskunft PlanetHome, Hr. Titze): (1) Letzte Mieterhoehung 06/2023 - 3-Jahres-Frist der Kappungsgrenze abgelaufen, §558-Erhoehung sofort moeglich: 700 EUR + 15 % (Bonn, angespannter Markt NRW) = bis ~805 EUR (13,88 EUR/m2 bei 58 m2, innerhalb Marktmiete 13,1-14,7). Mit ~805 EUR + Garage waere der CF schon zum Inseratspreis positiv (~+90 EUR/Monat App-Logik) - staerkt den Fall. (2) ACHTUNG: Grundbuchauszug zeigt aktuell KEINE Garage - klaeren, ob eigenes Teileigentums-Grundbuchblatt (bei Garagen ueblich), Sondernutzungsrecht laut Teilungserklaerung oder gar nicht im Eigentum des Verkaeufers. Bis zur Klaerung Garagenmiete 90 EUR NICHT einpreisen: Rechnung ohne Garage gilt (CF-0 bei 182.500 EUR), Erstgebot 182.000-185.000 EUR bestaetigt, Zielpreis 190.000 EUR nur MIT gesicherter Garage. (3) Makler schickt weitere Unterlagen (erwartet: Teilungserklaerung, Grundbuch inkl. Garage, ETV-Protokolle, Hausgeld-Abrechnung, Mietvertrag) - Wiedervorlage nach Eingang.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';
