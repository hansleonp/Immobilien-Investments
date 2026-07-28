import { useState, type FormEvent } from "react";
import { useStore } from "../lib/store";

export default function Login() {
  const { signIn } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await signIn(email.trim(), password);
    if (err) setError("Anmeldung fehlgeschlagen. Bitte Zugangsdaten prüfen.");
    setBusy(false);
  };

  return (
    <form className="login" onSubmit={submit}>
      <h1>Besichtigungen</h1>
      <p>Erfassen. Bewerten. Entscheiden.</p>
      <input
        className="field"
        type="email"
        placeholder="E-Mail"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="field"
        type="password"
        placeholder="Passwort"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <div className="error">{error}</div>}
      <button className="btn large block" type="submit" disabled={busy}>
        {busy ? "Anmelden…" : "Anmelden"}
      </button>
      <p className="fineprint" style={{ marginTop: 16 }}>
        Gleicher Login wie in der Immobilien-App (Supabase).
      </p>
    </form>
  );
}
