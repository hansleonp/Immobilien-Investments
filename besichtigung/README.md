# Besichtigungs-Checkliste

Schlanke Mobile-First-PWA für Immobilienbesichtigungen: Besichtigung erfassen → Zustand bewerten → Risiken dokumentieren → Score berechnen → Kaufentscheidung vorbereiten.

## Features

- **Übersicht** — offene Besichtigungen, Ø Score, Red-Flag-Objekte, beste Wohnung
- **Wizard** mit 10 Bereichen: Objekt, Lage, Gebäude, Wohnung, Schimmel & Feuchte, Technik & Energie, WEG & Unterlagen, Mieter, Fragenliste, Ergebnisbericht
- **Gewichtetes Scoring** (8 Kategorien, 100 Punkte) mit automatischem Red-Flag-System — kritische Flags blockieren die grüne Empfehlung
- **Fotos & Notizen** an jedem Kriterium (Kamera direkt aus der App)
- **Eigene Kriterien** pro Bereich hinzufügen, umbenennen, ausblenden (Einstellungen)
- **Vergleich** von 2–4 Objekten nebeneinander
- **Local-first**: Änderungen landen sofort in localStorage und syncen im Hintergrund zu Supabase — funktioniert auch bei schlechtem Empfang in der Wohnung
- **PWA**: installierbar auf dem iPhone (Safari → Teilen → „Zum Home-Bildschirm")

## Stack

Vite · React 19 · TypeScript · Supabase (Auth, Postgres mit RLS, Storage) · vite-plugin-pwa

## Entwicklung

```bash
npm install
npm run dev        # http://localhost:5183
npm run build      # Produktions-Build inkl. Service Worker
```

Supabase-Zugangsdaten liegen in `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Der Anon-Key ist ein öffentlicher Client-Key; alle Tabellen sind durch Row Level Security geschützt (Migration: `0008_inspections.sql` im Hauptrepo).

## Deploy

Vercel: Repo importieren, Framework „Vite" wird automatisch erkannt. SPA-Rewrites liegen in `vercel.json`.
