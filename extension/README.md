# ImmoFinder Chrome-Erweiterung

Übernimmt das geöffnete Inserat (ImmoScout24, Kleinanzeigen, Immowelt, Immonet) mit einem Klick in den ImmoFinder-Wizard — inklusive Titel, Preis, Fläche, Zimmer und Adresse. Da DU die Seite ganz normal im Browser ansiehst, greift hier kein Bot-Schutz.

## Installation (einmalig, ~1 Minute)

1. Chrome öffnen → Adresszeile: `chrome://extensions`
2. Rechts oben **Entwicklermodus** aktivieren
3. **„Entpackte Erweiterung laden"** → diesen Ordner (`extension/`) auswählen
4. Fertig. Optional: In den Erweiterungs-Einstellungen (Details → Erweiterungsoptionen) die App-URL anpassen — Standard ist `https://immobilien-investments.vercel.app` (die Live-App).

## Benutzung

1. Inserat auf einem der Portale öffnen
2. Unten rechts erscheint der grüne Button **„🏠 In ImmoFinder übernehmen"**
3. Klick → ImmoFinder öffnet sich in einem neuen Tab mit vorbefülltem Wizard
4. Fehlende Angaben (Miete, Hausgeld) kurz ergänzen → speichern

## Wenn ein Portal sein Layout ändert

Die Extraktion nutzt primär strukturierte Daten (JSON-LD/OpenGraph), die selten brechen. Portal-spezifische Selektoren liegen je Portal in einer eigenen Datei unter `sites/` und sind leicht anzupassen.
