-- Beethovenstr. 50: Angepasstes Angebot 145.000 EUR am 31.08.2026 per Mail an Hrn. Titze abgegeben.
-- Anlass: Titze bestaetigte selbst die Kaltmiete 620 (700 inkl. NK Whg + 90 inkl. NK Garage) und bat um Anpassung.
-- Begruendung in der Mail: ~90 EUR/M bzw. ~1.080 EUR/J weniger Miete als in der eigenen bisherigen Annahme,
-- kapitalisiert ~10.000 EUR -> 155.000 minus 10.000 = 145.000. Formulierung bewusst nicht expose-vorwurfsvoll.
-- Beigelegt: Finanzierungsbestaetigung der Sparkasse (Signalwirkung). Bitte um kurzfristigen Rueckruf.
-- Frist 14.09.2026. Intern: hartes Limit 148.000 (stille Reserve, in der Mail als "kein Spielraum nach oben").

update public.search_properties
set
  data = data || jsonb_build_object(
    'wunschpreis', 145000,
    'datum', '2026-08-31',
    'wiedervorlage', '2026-09-14',
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', '2f9b6e04-8c17-4a53-9d82-b60e4c1a7f35',
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', 'ANGEBOT 145.000 EUR ABGEGEBEN (Mail an Titze, 31.08.2026): Anpassung nach bestaetigter Kaltmiete 620. Begruendung ~10.000 kapitalisierte Mietdifferenz. Finanzierungsbestaetigung der Sparkasse beigelegt, Bitte um Rueckruf. Frist 14.09.2026. Intern: Limit 148.000, ab 149 freundlich Schluss.'
        )
      ),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'ANGEBOT 145.000 EUR ABGEGEBEN 31.08.2026 (Mail an Hrn. Titze, ersetzt das 155er-Gebot): Anlass war Titzes eigene Bestaetigung der Kaltmiete 620 (700 inkl. NK Wohnung + 90 inkl. NK Garage) und seine Bitte um ein angepasstes Angebot. Argumentation in der Mail: rund 90 EUR/Monat bzw. 1.080 EUR/Jahr weniger Mieteinnahmen als in der eigenen bisherigen Annahme (bewusst NICHT als Expose-Vorwurf formuliert), kapitalisiert rund 10.000 EUR -> 155.000 minus 10.000 = 145.000. Wichtig: Die strenge Kapitalisierung (Faktor ~17) haette ~18.000 ergeben, also 137.000 - diese 8.000 EUR wurden bewusst nicht ins Feld gefuehrt; Konter bei Nachfassen: "Volle Kapitalisierung waere 137.000 gewesen, ich bin bewusst darueber geblieben."'
      || E'\n' || 'FLANKIERUNG: Finanzierungsbestaetigung der Sparkasse (4,11 % / 10 J., Bonitaetsschreiben Hr. Hennenberg) als Anhang beigelegt - macht aus "Finanzierung steht" einen Beleg. Zusaetzlich um kurzfristigen telefonischen Rueckruf gebeten (+49 151 50692657), um das weitere Vorgehen direkt zu besprechen. Verbleibender Vorbehalt: nur noch die Zweitbesichtigung mit Handwerker inkl. Mieter-Kennenlernen (ETV-Protokoll erledigt, Mietfrage durch Titzes Bestaetigung erledigt; fuer die Notarakte noch ein Kontoauszug erbeten).'
      || E'\n' || 'VERHANDLUNGSRAHMEN (intern): Gebot 145.000 = kommuniziert als final ("nach oben kein Spielraum mehr"). Hartes Limit 148.000 als stille Reserve fuer ein symbolisches Entgegenkommen; ab 149.000 freundlich absagen. Am Telefon NICHT auf "lassen Sie uns bei 150 die Mitte nehmen" eingehen - die Mitte wurde schon genommen (140er-Logik -> 145). Wirtschaftlicher Stand bei 145.000 (Zins 4,11 %, Tilgung 2 %): Cash-Bedarf 46.502 (EK 29.000 + KNK 17.502), Darlehen 116.000, Rate 591/M; realistischer Kapitalbedarf J1 ~52-55 T inkl. Sofortinstandhaltung 3 T, Kapitalerhoehungs-Anteil 4,1 T und RND-Gutachten 1,5 T. Cashflow J1 mit Hebel 1b und Last 245: -81/M (bei 1,5 % Tilgung -32/M; mit RND-Gutachten +46/M besser = praktisch 0). EK-Rendite all-in: Mieter bleibt 4,6 % (mit RND 5,4 %), Auszug J5 + 30 T Reno 5,6-6,6 % (mit RND ~6,4-7,4 %). ETF-Gegentest nachsteuer: im Auszug-Szenario schlaegt die Wohnung den ETF bis 7 % Erwartungsrendite. 6-%-Preis laut Zinsupdate: 139.000 auf Ist-Miete, 148.000 im Potenzialszenario - das Limit 148 hat damit KEINE Reserve mehr.'
      || E'\n' || 'FINANZIERUNGS-EMPFEHLUNG fuer den Abschlussfall: 1,5 % Tilgung (spart 49 EUR/M Liquiditaet, kostet praktisch keine Rendite) plus 5 % Sondertilgung p. a. zur Selbststeuerung; 10 J. Zinsbindung bei 4,11 % (die 15-J.-Variante zu 4,42 % druecken den Zielpreis um ~6 %); keine tilgungsfreien Anlaufjahre; Vergleichsangebot einer zweiten Bank einholen (0,2 pp = ~19 EUR/M). Nach Kauf sofort: Index ziehen (620 -> ~655), Garage per Aenderungskuendigung auf ~100, Restnutzungsdauer-Gutachten beauftragen (~1.500 EUR, +0,8 pp EK-Rendite dauerhaft; Beweislage aus ETV-Protokoll: Brandschutz-Befund, Elektrik 1937, Bleirohr-Historie).'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';
