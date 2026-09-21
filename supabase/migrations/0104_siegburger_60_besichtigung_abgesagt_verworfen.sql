-- Siegburger Str. 60, Bonn Beuel-Ost/Puetzchen (IS24 169516648): Besichtigung abgesagt,
-- Objekt verworfen (21.09.2026).
--
-- Der Termin am 21.09.2026 17:00 Uhr wurde per Mail an Till Herrmann abgesagt
-- (Antwort im Thread vom 09.09.2026). Auslöser: Die Makler-Mail vom 09.09. liefert die
-- Vormiete mit 564,42 EUR (8,18 EUR/m2) - sie liegt UNTER dem Mietpreisbremsen-Deckel.
-- Damit ist der Bestandsschutz nach Par. 556e Abs. 1 BGB, die einzige offene Zahl, die
-- den Zielpreis noch haette heben koennen, endgueltig vom Tisch.
-- Status: Verworfen. Wiedervorlage entfernt, fav zurueckgesetzt.

with neu(link, txt) as (
  values (
    'https://www.immobilienscout24.de/expose/169516648',
    'ABSAGE UND VERWORFEN 21.09.2026: Besichtigungstermin heute 17:00 Uhr per Mail an Till Herrmann abgesagt. Begruendung gegenueber dem Makler: Zielpreis liegt so weit unter der Preisvorstellung (110.000 vs. 215.000 EUR), dass auch nach einer Besichtigung kein fuer die Verkaeuferseite interessantes Angebot moeglich waere - daher keine Inanspruchnahme seiner Zeit. ENTSCHEIDENDE ZAHL LIEGT VOR: Die Makler-Mail vom 09.09.2026 nennt die VORMIETE mit 564,42 EUR (8,18 EUR/m2) und die ortsuebliche Vergleichsmiete mit 8,22 EUR/m2. Die Vormiete liegt damit UNTER dem Mietpreisbremsen-Deckel -> Par. 556e Abs. 1 BGB greift nicht, der in der Nachbewertung vom 01.09. als einziger Preishebel offen gebliebene Bestandsschutz ist tot. Mehr noch: Die Rechnung des Maklers selbst (8,22 EUR/m2 + 10 % = 9,00 EUR/m2 = 620 EUR) liegt UNTER dem hier angesetzten Mietansatz von 660 EUR und drueckt den tragbaren Preis damit noch unter die 110.000 EUR, statt ihn zu heben. Das Urteil "Finger weg" vom 01.09. ist damit belegt und abschliessend. Nicht wieder aufnehmen, solange der Angebotspreis nicht um mehr als 40 % faellt. Der in der Makler-Mail verlinkte WeTransfer-Ordner mit den Beleihungsunterlagen wurde nicht mehr abgerufen.'
  )
)
update public.search_properties sp
set
  data = sp.data || jsonb_build_object(
    'status', jsonb_build_array('Verworfen'),
    'fav', false,
    'wiedervorlage', null,
    'wunschmiete', 620,
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'history',
      coalesce(sp.data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', gen_random_uuid()::text,
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', neu.txt
        )
      ),
    'notizen', coalesce(sp.data->>'notizen', '') || E'\n\n' || neu.txt
  ),
  updated_at = now()
from neu
where sp.data->>'link' = neu.link;
