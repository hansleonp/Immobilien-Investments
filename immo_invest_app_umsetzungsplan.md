# ImmoFinder / Immobilien-Investment-App – Umsetzungsplan

## 1. Ziel der App

Die App soll Hans-Leon dabei unterstützen, bis Ende 2029 strukturiert drei Eigentumswohnungen in Bad Honnef, Königswinter, Bonn und Umgebung als Kapitalanlage zu kaufen.

Der Fokus liegt nicht nur auf der Suche nach Inseraten, sondern auf einem vollständigen Investment-Workflow:

1. Immobilien finden
2. Immobilien bewerten
3. Kontakte und Anfragen dokumentieren
4. Nachfassaktionen planen
5. Besichtigungen verwalten
6. Dokumente ablegen
7. Entscheidungen nachvollziehbar treffen
8. Zielerreichung bis 2029 tracken

Die App soll einfach, schnell und alltagstauglich sein. Ziel ist: möglichst schnell mit der Immobiliensuche starten, ohne direkt von komplexem Scraping abhängig zu sein.

---

## 2. Grundprinzip

Die App besteht aus zwei Wegen zur Erfassung von Immobilien:

### 2.1 Automatischer Import / Scraping / API

Langfristig sollen passende Inserate automatisch aus verschiedenen Quellen importiert werden:

- ImmobilienScout24
- Kleinanzeigen
- Immowelt
- Immonet
- lokale Maklerseiten
- Sparkassen-/Volksbank-Immobilien
- weitere Quellen später optional

Wichtig: Scraping/API-Anbindungen werden als Komfortfunktion betrachtet. Sie dürfen nicht der einzige Weg sein, Immobilien in die App zu bekommen.

### 2.2 Manueller Link-Import als Pflichtfunktion

Da Scraping technisch oder rechtlich eingeschränkt sein kann, muss die App von Anfang an ermöglichen, dass Inserate manuell hinzugefügt werden.

Der Nutzer kann einen Inseratslink einfügen, zum Beispiel:

- ImmobilienScout24-Link
- Kleinanzeigen-Link
- Immowelt-Link
- Makler-Webseite
- PDF-Exposé
- manuell erfasstes Objekt ohne Link

Nach dem Einfügen soll die App:

1. den Link speichern,
2. verfügbare Daten automatisch auslesen, soweit möglich,
3. fehlende Daten manuell abfragbar machen,
4. das Objekt bewerten,
5. es in die Immobilienliste aufnehmen,
6. den Kontakt- und Dokumentationsprozess starten.

Der MVP basiert daher zuerst auf:

> Manueller Link-Import + Bewertungslogik + Immobilienliste + Kontakt-/Statusdokumentation

---

## 3. Zielregion und Objektarten

### 3.1 Zielregionen

Primär:

- Bad Honnef
- Königswinter
- Bonn

Optional später:

- Rheinbreitbach
- Unkel
- Linz am Rhein
- Sankt Augustin
- Hennef
- Siegburg
- Remagen

### 3.2 Objektarten

MVP:

- Eigentumswohnungen als Kapitalanlage

Später:

- Mehrfamilienhäuser
- Einfamilienhäuser zur Eigennutzung
- gemischt genutzte Immobilien
- Grundstücke optional

---

## 4. Kernfunktionen MVP

## 4.1 Dashboard

Das Dashboard soll nur die wichtigsten Informationen zeigen und nicht überladen sein.

### Inhalte

- Neue Immobilien
- Interessante Immobilien
- Bereits kontaktierte Immobilien
- Antworten ausstehend
- Besichtigungstermine
- Offene Nachfassaktionen
- Top Deals nach Bewertung
- Zielstatus: 3 Wohnungen bis 2029

### Beispiel-KPIs

- Gesamtanzahl Immobilien
- Neue Immobilien diese Woche
- Kontaktierte Immobilien
- Antwort ausstehend
- Besichtigungen geplant
- Verworfen
- Gekauft

---

## 4.2 Immobilienliste als zentrale Arbeitsansicht

Die Webversion soll eine tabellarische Liste enthalten, in der alle relevanten Informationen auf einen Blick sichtbar sind.

Diese Liste ist der wichtigste Screen der App.

### Tabellen-Spalten

| Spalte | Beschreibung |
|---|---|
| Einheit / Objekt | Name, Adresse, Etage, Einheit |
| Ort | Bad Honnef, Königswinter, Bonn etc. |
| Quelle | ImmoScout24, Kleinanzeigen, manuell etc. |
| Link | Direktlink zum Inserat |
| Kaufpreis | aktueller Angebotspreis |
| Wohnfläche | m² |
| Zimmer | Anzahl Zimmer |
| Etage | z. B. EG, 1. OG, DG |
| Status Nutzung | frei, vermietet, unbekannt |
| Kaltmiete Ist/Soll | tatsächliche oder geschätzte Miete |
| Rendite brutto | Jahreskaltmiete / Kaufpreis |
| Kaufpreisfaktor / KGV | Kaufpreis / Jahreskaltmiete |
| Cashflow monatlich | nach Finanzierung und Kosten |
| Bewertung | Score 0–100 |
| Status | Neu, Interessant, Kontaktiert, Besichtigung, Verhandlung, Abgelehnt, Gekauft |
| Kontaktiert? | Ja/Nein |
| Kontaktart | Telefon, E-Mail, Plattform, WhatsApp |
| Letzter Kontakt | Datum und Kurznotiz |
| Antwortstatus | offen, geantwortet, keine Antwort, abgesagt |
| Nächste Aktion | kontaktieren, nachfassen, Unterlagen anfordern etc. |
| Fällig am | Datum der nächsten Aktion |
| Verworfen? | Ja/Nein |
| Verwerfungsgrund | zu teuer, schlechte Lage, schlechter Zustand etc. |
| Besichtigung | geplant / erledigt / nein |
| Dokumente | Anzahl Dokumente |
| Notizen | Kurznotiz |

### Filter

- Ort
- Preisbereich
- Wohnfläche
- Rendite
- Cashflow positiv/negativ
- Score
- Status
- Quelle
- Kontaktiert ja/nein
- Antwort ausstehend
- Nachfassen fällig
- Verworfen ja/nein
- Besichtigung geplant

### Aktionen direkt aus der Liste

- Inserat öffnen
- Status ändern
- Als kontaktiert markieren
- Nachfassdatum setzen
- Aufgabe erstellen
- Immobilie verwerfen
- Notiz hinzufügen
- Bewertung öffnen
- Detailansicht öffnen

---

## 4.3 Immobilie manuell hinzufügen

### Wizard: Immobilie hinzufügen

Der Wizard soll möglichst einfach sein.

#### Schritt 1: Quelle / Link

- Inseratslink einfügen
- Quelle auswählen
- optional: PDF hochladen
- optional: manuelle Anlage ohne Link

#### Schritt 2: Basisdaten

- Titel / Objektname
- Adresse
- Ort
- PLZ
- Wohnfläche
- Zimmer
- Etage
- Baujahr
- Objektzustand
- frei oder vermietet
- Anbietername
- Telefonnummer
- E-Mail

#### Schritt 3: Kaufdaten

- Kaufpreis
- Kaufnebenkosten in %
- Hausgeld
- nicht umlagefähiges Hausgeld
- Rücklage / Instandhaltung
- optional Maklerprovision

#### Schritt 4: Miete & Rendite

- Ist-Kaltmiete
- Soll-Kaltmiete
- Mietannahme pro m²
- Leerstandsrisiko
- Mietsteigerung optional

#### Schritt 5: Finanzierung

- Eigenkapitalquote
- Zinssatz
- Tilgung
- Zinsbindung
- Darlehensbetrag

#### Schritt 6: Bewertung

Automatische Anzeige:

- Rendite
- KGV
- Cashflow
- Score
- maximal sinnvoller Kaufpreis
- Empfehlung: interessant / beobachten / ablehnen

---

## 4.4 Detailansicht einer Immobilie

Die Detailansicht soll alle Informationen einer Immobilie bündeln.

### Tabs

1. Übersicht
2. Finanzen
3. Kontakt & Verlauf
4. Aufgaben
5. Besichtigungen
6. Dokumente
7. Notizen
8. Entscheidung

### Übersicht

- Foto
- Titel
- Adresse
- Kaufpreis
- Wohnfläche
- Zimmer
- Quelle
- Link zum Inserat
- aktueller Status
- Score
- Cashflow
- Rendite
- KGV
- wichtigste Notiz

### Finanzen

- Kaufpreis
- Kaufnebenkosten
- Gesamtkosten
- Eigenkapital
- Darlehen
- Zins
- Tilgung
- Rate
- Kaltmiete
- Hausgeld
- nicht umlagefähige Kosten
- Instandhaltungspuffer
- Cashflow
- Break-even-Kaufpreis
- maximal sinnvoller Kaufpreis

### Kontakt & Verlauf

Hier wird vollständig dokumentiert, was mit dem Objekt passiert ist.

Beispiele:

- 12.05.2026: Anfrage über ImmoScout gesendet
- 14.05.2026: telefonisch nachgefasst
- 15.05.2026: Anbieter hat Unterlagen zugesagt
- 18.05.2026: keine Antwort, erneut nachfassen

Erfassbare Felder:

- Datum
- Kontaktart
- Ansprechpartner
- Ergebnis
- Notiz
- nächste Aktion
- Wiedervorlage

### Aufgaben

- Anbieter kontaktieren
- Rückmeldung abwarten
- Nachfassen
- Unterlagen anfordern
- Exposé prüfen
- Hausgeldabrechnung prüfen
- Teilungserklärung prüfen
- Besichtigung organisieren
- Angebot vorbereiten
- Finanzierung prüfen

### Besichtigungen

- Datum
- Uhrzeit
- Ort
- Ansprechpartner
- Status: geplant / erledigt / abgesagt
- Besichtigungsnotizen
- Fotos optional
- Eindruck der Lage
- Zustand
- Renovierungsbedarf

### Dokumente

Dokumente pro Immobilie speichern:

- Exposé
- Grundriss
- Energieausweis
- Teilungserklärung
- Wirtschaftsplan
- Hausgeldabrechnung
- Protokolle der Eigentümerversammlung
- Mietvertrag
- Nebenkostenabrechnung
- Fotos
- Finanzierungsunterlagen

### Entscheidung

- weiter verfolgen
- beobachten
- Angebot abgeben
- verwerfen
- gekauft

Bei Verwerfen:

- Grund erfassen
- Datum erfassen
- optionale Notiz

---

## 5. Statusmodell

Jede Immobilie bekommt einen klaren Status.

### Hauptstatus

1. Neu
2. Interessant
3. Kontaktiert
4. Antwort ausstehend
5. Rückmeldung erhalten
6. Besichtigung geplant
7. Besichtigung erledigt
8. Unterlagen prüfen
9. Angebot vorbereiten
10. Angebot abgegeben
11. Verhandlung
12. Notarvorbereitung
13. Gekauft
14. Abgelehnt
15. Verworfen

### Zusatzstatus

- Favorit
- Wiedervorlage gesetzt
- Unterlagen unvollständig
- Finanzierung prüfen
- Preis verhandelbar
- Risiko erkannt

---

## 6. Bewertungslogik

## 6.1 Basiskennzahlen

### Bruttomietrendite

```text
Jahreskaltmiete / Kaufpreis * 100
```

### Kaufpreisfaktor / KGV

```text
Kaufpreis / Jahreskaltmiete
```

### Monatlicher Cashflow

```text
Kaltmiete
- nicht umlagefähiges Hausgeld
- Instandhaltungspuffer
- Zinszahlung
- Tilgung
= monatlicher Cashflow
```

### Gesamtkosten

```text
Kaufpreis + Kaufnebenkosten + Maklerkosten + geplante Sanierung
```

### Maximal sinnvoller Kaufpreis

Ausgehend von gewünschter Zielrendite oder gewünschtem Mindestcashflow.

---

## 6.2 Score 0–100

Vorschlag:

| Kriterium | Gewichtung |
|---|---:|
| Rendite | 25 % |
| Cashflow | 25 % |
| Kaufpreis im Verhältnis zum Markt | 20 % |
| Lage | 10 % |
| Vermietbarkeit | 10 % |
| Zustand/Risiko | 10 % |

### Score-Ergebnis

| Score | Bewertung |
|---:|---|
| 85–100 | Sehr interessant |
| 70–84 | Interessant |
| 55–69 | Durchschnittlich |
| 40–54 | Schwach |
| 0–39 | Ablehnen |

---

## 7. Finanzierungsannahmen

In den Einstellungen sollen Standardwerte gepflegt werden.

### Standardwerte

- Eigenkapitalquote: z. B. 20 %
- Zinssatz: z. B. 3,5–4,0 %
- Tilgung: z. B. 2,0 %
- Kaufnebenkosten NRW: z. B. ca. 10–12 % inkl. Grunderwerbsteuer, Notar, Grundbuch, ggf. Makler
- nicht umlagefähiges Hausgeld: manuell oder €/m²
- Instandhaltungspuffer: z. B. 1,00 €/m² monatlich
- Zielrendite
- gewünschter Mindestcashflow

Jede Immobilie kann eigene Annahmen überschreiben.

---

## 8. Suchprofile

Der Nutzer soll Suchprofile anlegen können.

### Suchprofil Beispiel

```text
Name: Kapitalanlage Bad Honnef / Königswinter
Orte: Bad Honnef, Königswinter, Bonn
Objektart: Eigentumswohnung
Preis: 100.000 € bis 300.000 €
Wohnfläche: 35 m² bis 90 m²
Zimmer: 1 bis 4
Status: frei oder vermietet
Mindest-Bruttorendite: 4,0 %
Maximaler Kaufpreisfaktor: 25
Cashflow: bevorzugt positiv oder maximal leicht negativ
```

---

## 9. Dokumentation & CRM-Funktionen

Dieser Bereich ist besonders wichtig, weil die App nicht nur rechnen, sondern die Suche organisieren soll.

### Pro Immobilie dokumentieren

- Wurde kontaktiert? Ja/Nein
- Wann wurde kontaktiert?
- Wie wurde kontaktiert?
- Wer wurde kontaktiert?
- Was wurde geschrieben/gesagt?
- Antwort erhalten? Ja/Nein
- Antwort offen seit wann?
- Soll nachgefasst werden?
- Nachfassdatum
- Besichtigung geplant?
- Unterlagen erhalten?
- Entscheidung getroffen?
- Verworfen? Ja/Nein
- Grund für Verwerfen

### Kontaktarten

- Plattformnachricht
- E-Mail
- Telefon
- WhatsApp
- persönlich
- Sonstiges

### Antwortstatus

- keine Anfrage gestellt
- Anfrage gesendet
- Antwort ausstehend
- Antwort erhalten
- kein Interesse vom Anbieter
- Objekt verkauft
- Besichtigung vereinbart
- Unterlagen erhalten

---

## 10. Aufgaben & Wiedervorlagen

Die App soll täglich zeigen, was zu tun ist.

### Beispiele

- Herr Müller anrufen
- Bei Frau Schneider nachfassen
- Unterlagen anfordern
- Exposé prüfen
- Finanzierung für Objekt X rechnen
- Besichtigung vorbereiten
- Angebot formulieren

### Felder

- Titel
- Immobilie
- Kontakt
- Fälligkeitsdatum
- Priorität
- Status
- Notiz
- erledigt ja/nein

---

## 11. Besichtigungsmodul

### Funktionen

- Besichtigungstermin erfassen
- Ansprechpartner speichern
- Adresse anzeigen
- Checkliste für Besichtigung
- Notizen erfassen
- Fotos hochladen
- Entscheidung nach Besichtigung dokumentieren

### Besichtigungscheckliste

- Zustand Gebäude
- Zustand Wohnung
- Treppenhaus
- Dach/Fassade/Fenster
- Heizung
- Elektrik
- Bad/Küche
- Feuchtigkeit/Schimmel
- Lärm
- Parkplatz
- ÖPNV
- Vermietbarkeit
- Renovierungsbedarf
- Bauchgefühl

---

## 12. Technische Architektur

## 12.1 Frontend

Empfehlung:

- Web-App zuerst
- Mobile später ergänzen

Option A:

- Flutter Web + Flutter Mobile

Option B:

- Next.js Web-App + später Flutter Mobile

Da die App schnell nutzbar sein soll und Tabellenansichten im Web wichtig sind, ist für den MVP eine Web-App mit Next.js oder Flutter Web sinnvoll.

Deployment:

- Vercel für Web-App

---

## 12.2 Backend

- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Edge Functions
- Supabase Cron Jobs
- Row Level Security

---

## 12.3 Externe Services später optional

- Scraper/API-Anbieter
- E-Mail-Import
- OCR/AI für Exposé-Auswertung
- Karten-/Geocoding-Service
- Kalenderintegration
- Benachrichtigungen per E-Mail oder Push

---

## 13. Supabase Datenmodell MVP

## 13.1 Tabelle: properties

```sql
id uuid primary key
created_at timestamp
updated_at timestamp
title text
unit_label text
street text
zip text
city text
district text
source text
source_url text
external_id text
property_type text
price numeric
living_area numeric
rooms numeric
floor text
construction_year int
condition text
energy_class text
is_rented boolean
current_rent_cold numeric
estimated_rent_cold numeric
housegeld numeric
non_recoverable_costs numeric
maintenance_reserve numeric
status text
score int
is_favorite boolean
is_discarded boolean
discard_reason text
notes text
```

## 13.2 Tabelle: property_financials

```sql
id uuid primary key
property_id uuid references properties(id)
purchase_price numeric
purchase_costs_percent numeric
purchase_costs_total numeric
equity_percent numeric
equity_amount numeric
loan_amount numeric
interest_rate numeric
repayment_rate numeric
monthly_interest numeric
monthly_repayment numeric
monthly_debt_service numeric
monthly_rent_cold numeric
monthly_non_recoverable_costs numeric
monthly_maintenance numeric
monthly_cashflow numeric
gross_yield numeric
purchase_factor numeric
max_reasonable_price numeric
break_even_price numeric
```

## 13.3 Tabelle: contacts

```sql
id uuid primary key
property_id uuid references properties(id)
name text
company text
role text
phone text
email text
platform text
notes text
```

## 13.4 Tabelle: contact_events

```sql
id uuid primary key
property_id uuid references properties(id)
contact_id uuid references contacts(id)
event_date timestamp
contact_type text
status text
summary text
next_action text
next_action_date date
created_at timestamp
```

## 13.5 Tabelle: tasks

```sql
id uuid primary key
property_id uuid references properties(id)
title text
description text
due_date date
priority text
status text
completed boolean
completed_at timestamp
```

## 13.6 Tabelle: viewings

```sql
id uuid primary key
property_id uuid references properties(id)
viewing_date timestamp
location text
contact_name text
status text
notes text
rating int
```

## 13.7 Tabelle: documents

```sql
id uuid primary key
property_id uuid references properties(id)
file_name text
file_type text
storage_path text
document_category text
uploaded_at timestamp
notes text
```

## 13.8 Tabelle: search_profiles

```sql
id uuid primary key
name text
cities text[]
min_price numeric
max_price numeric
min_living_area numeric
max_living_area numeric
min_rooms numeric
max_rooms numeric
min_yield numeric
max_purchase_factor numeric
only_positive_cashflow boolean
active boolean
```

## 13.9 Tabelle: financing_settings

```sql
id uuid primary key
name text
is_default boolean
equity_percent numeric
interest_rate numeric
repayment_rate numeric
purchase_costs_percent numeric
maintenance_per_sqm numeric
non_recoverable_costs_per_sqm numeric
target_yield numeric
minimum_cashflow numeric
```

---

## 14. Screens MVP

### Pflicht-Screens

1. Login
2. Dashboard
3. Immobilienliste
4. Immobilie hinzufügen Wizard
5. Immobiliendetail
6. Finanzbewertung
7. Kontaktverlauf
8. Aufgaben
9. Besichtigungen
10. Dokumente
11. Einstellungen Finanzierung
12. Ziele bis 2029

---

## 15. MVP-Umsetzungsphasen

## Phase 1: Schnellstart-Version

Ziel: innerhalb kurzer Zeit nutzbar machen.

Funktionen:

- Supabase-Projekt
- Auth
- Immobilien manuell anlegen
- Inseratslink speichern
- Immobilienliste mit allen Kernspalten
- einfache Detailansicht
- Finanzbewertung
- Statusverwaltung
- kontaktiert ja/nein
- letzter Kontakt
- nächste Aktion
- verworfen ja/nein
- Notizen

---

## Phase 2: Deal-CRM

Funktionen:

- Kontaktpersonen
- Kontaktverlauf
- Aufgaben
- Wiedervorlagen
- Antwortstatus
- Nachfasslogik
- Besichtigungstermine
- Verwerfungsgründe

---

## Phase 3: Dokumente & Besichtigung

Funktionen:

- Dokumentenupload
- Dokumentkategorien
- Besichtigungscheckliste
- Besichtigungsnotizen
- Fotos
- Entscheidungsdokumentation

---

## Phase 4: Import-Automatisierung

Funktionen:

- Link-Vorschau / Metadaten auslesen
- E-Mail-Import von Suchagenten
- Dublettenprüfung
- halbautomatischer Import
- später API/Scraping-Anbindung

---

## Phase 5: KI & Analyse

Funktionen:

- Exposé auslesen
- Risiken erkennen
- Mietpreis schätzen
- Lagebewertung
- automatische Zusammenfassung
- Vorschlag für Anfrage-Nachricht
- Verhandlungspreis berechnen

---

## 16. Prioritäten

### Muss sofort rein

- Immobilienliste als Tabelle
- Manuelles Hinzufügen
- Link speichern
- Bewertungsrechner
- Status
- Kontaktiert ja/nein
- Antwortstatus
- Nachfassdatum
- Verworfen ja/nein
- Notizen
- Direktlink zum Inserat

### Sollte schnell danach rein

- Kontaktverlauf
- Aufgaben
- Besichtigung
- Dokumente
- Filter
- Score
- Zieltracking

### Kann später kommen

- Scraping
- API-Anbindungen
- KI-Auswertung
- E-Mail-Import
- Mobile App
- Kalenderintegration

---

## 17. Empfohlene MVP-Navigation

Links im Menü:

1. Dashboard
2. Immobilien
3. Aufgaben
4. Besichtigungen
5. Dokumente
6. Ziele
7. Einstellungen

Keine überladene Navigation. Fokus auf schnelle Nutzung.

---

## 18. Leitlinie für Design

Die App soll:

- hell
- modern
- ruhig
- tabellenorientiert
- schnell bedienbar
- nicht überladen
- mit klaren Status-Badges arbeiten
- grüne Akzente für positive Werte nutzen
- rote Akzente für negative Werte nutzen
- gelbe/orange Hinweise für offene Aufgaben nutzen

Wichtig: Die Webversion ist die Hauptarbeitsfläche. Mobile ist ergänzend für unterwegs, Besichtigungen und schnelle Notizen.

---

## 19. Beispiel-Workflow

1. Nutzer findet Inserat auf ImmoScout24.
2. Nutzer kopiert Link.
3. Nutzer klickt in der App auf „Immobilie hinzufügen“.
4. Nutzer fügt Link ein.
5. App speichert Quelle und Link.
6. Nutzer ergänzt Kaufpreis, Fläche, Miete, Hausgeld.
7. App berechnet Rendite, KGV, Cashflow und Score.
8. Immobilie erscheint in der zentralen Liste.
9. Nutzer markiert Immobilie als „Interessant“.
10. Nutzer sendet Anfrage und dokumentiert „kontaktiert am“.
11. App setzt Antwortstatus auf „Antwort ausstehend“.
12. Nutzer setzt Nachfassdatum.
13. Nachfassaktion erscheint im Dashboard.
14. Bei Antwort wird Besichtigung angelegt.
15. Nach Besichtigung werden Dokumente und Notizen ergänzt.
16. Nutzer entscheidet: weiter verfolgen, Angebot, verwerfen oder kaufen.

---

## 20. Ziel

Die App soll ein persönliches Immobilien-Investment-Cockpit werden.

Sie soll nicht perfekt starten, sondern schnell helfen:

- Chancen nicht übersehen
- Immobilien einheitlich bewerten
- Kontakte sauber dokumentieren
- Nachfassaktionen nicht vergessen
- Entscheidungen nachvollziehbar treffen
- das Ziel von drei Eigentumswohnungen bis 2029 systematisch verfolgen

