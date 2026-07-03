/**
 * ImmoFinder — Gmail-Suchagenten-Import via Google Apps Script
 * ============================================================
 * Durchsucht das Gmail-Postfach nach Suchagenten-Mails der Portale,
 * extrahiert die Inserats-Links und schickt sie an den ImmoFinder-Webhook.
 * Umgeht Gmails Weiterleitungs-Bestätigung komplett (läuft im eigenen Konto).
 *
 * EINRICHTUNG (einmalig, ~3 Minuten):
 *  1. https://script.google.com  →  "Neues Projekt"
 *  2. Diesen kompletten Code einfügen (vorhandenen Inhalt ersetzen)
 *  3. Oben "immoFinderSync" auswählen  →  "Ausführen"
 *     → Google fragt nach Berechtigung (Gmail lesen + externe Anfragen)
 *       → "Erweitert" → "…zulassen". Das ist DEIN Skript in DEINEM Konto.
 *  4. Links im Menü das Wecker-Symbol "Trigger"  →  "Trigger hinzufügen"
 *       Funktion: immoFinderSync
 *       Ereignisquelle: Zeitgesteuert
 *       Typ: Minutenintervall  →  "Alle 15 Minuten"
 *       → Speichern
 *  Fertig. Neue Portal-Mails landen ab jetzt automatisch im ImmoFinder-Posteingang.
 */

// Fester Webhook inkl. Secret (dein persönlicher Endpunkt):
const WEBHOOK_URL =
  "https://immobilien-investments.vercel.app/api/email-inbound?secret=bef2fd05cf95d02ff35098b828c7e293cf9c0b5b47e0842d";

// Gmail-Label, mit dem bereits verarbeitete Mails markiert werden (verhindert Doppel-Versand):
const LABEL_NAME = "ImmoFinder-verarbeitet";

// Nur Suchagenten-/Benachrichtigungs-Mails der Portale, die noch nicht verarbeitet wurden:
const SEARCH_QUERY =
  "newer_than:14d " +
  "(from:immowelt.de OR from:immobilienscout24.de OR from:kleinanzeigen.de OR from:immonet.de) " +
  "-label:" + LABEL_NAME;

function immoFinderSync() {
  const label =
    GmailApp.getUserLabelByName(LABEL_NAME) || GmailApp.createLabel(LABEL_NAME);

  const threads = GmailApp.search(SEARCH_QUERY, 0, 50);
  Logger.log("Gefundene Threads: " + threads.length);

  for (const thread of threads) {
    let ok = true;
    for (const msg of thread.getMessages()) {
      try {
        const payload = {
          subject: msg.getSubject(),
          html: msg.getBody(),        // HTML-Inhalt (enthält die Inserats-Links)
          text: msg.getPlainBody(),
        };
        const res = UrlFetchApp.fetch(WEBHOOK_URL, {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify(payload),
          muteHttpExceptions: true,
        });
        if (res.getResponseCode() >= 300) {
          ok = false;
          Logger.log("Webhook-Fehler " + res.getResponseCode() + ": " + res.getContentText());
        }
      } catch (e) {
        ok = false;
        Logger.log("Fehler: " + e);
      }
    }
    // Thread nur markieren, wenn alle Nachrichten erfolgreich übertragen wurden
    if (ok) thread.addLabel(label);
  }
}
