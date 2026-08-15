import { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import { authApi, saveSession } from "../api";

export default function AuthPanel({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    try { const session = await authApi[mode](form); saveSession(session); onAuthenticated(session.user); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  };
  return <div className="auth-page"><form className="auth-card" onSubmit={submit}>
    <p className="eyebrow">SECURE WORKSPACE</p><h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1><p className="auth-copy">Manage your students from anywhere with your private MongoDB workspace.</p>
    {error && <div className="error-message" role="alert">{error}</div>}
    {mode === "register" && <Input label="Full name" name="name" value={form.name} onChange={update} placeholder="Your name" />}
    <Input label="Email" name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" />
    <Input label="Password" name="password" type="password" value={form.password} onChange={update} placeholder="At least 8 characters" />
    <Button type="submit" className="primary-button" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</Button>
    <button type="button" className="auth-switch" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Need an account? Create one" : "Already have an account? Sign in"}</button>
  </form></div>;
}
