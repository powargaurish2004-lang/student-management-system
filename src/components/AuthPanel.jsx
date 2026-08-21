import { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import { authApi, saveSession } from "../api";

export default function AuthPanel({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({ name: "", email: "", password: "", adminCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const session = await authApi[mode]({ ...form, role });
      saveSession(session);
      onAuthenticated(session.user);
    }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  };
  return <div className="auth-page"><form className={`auth-card ${role}-auth`} onSubmit={submit}>
    <p className="eyebrow">{role === "admin" ? "ADMIN CONSOLE" : "STUDENT WORKSPACE"}</p><h1>{role === "admin" ? mode === "login" ? "Admin sign in" : "Create admin account" : mode === "login" ? "Welcome back" : "Create user account"}</h1><p className="auth-copy">{role === "admin" ? "Review and manage student records from the administration console." : "Manage your students from anywhere with your private workspace."}</p>
    <div className="role-switch" aria-label="Choose account type">
      <button type="button" className={role === "user" ? "active" : ""} onClick={() => { setRole("user"); setError(""); }}>User</button>
      <button type="button" className={role === "admin" ? "active" : ""} onClick={() => { setRole("admin"); setError(""); }}>Admin</button>
    </div>
    {error && <div className="error-message" role="alert">{error}</div>}
    {mode === "register" && <Input label="Full name" name="name" value={form.name} onChange={update} placeholder="Your name" />}
    <Input label="Email" name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" />
    <Input label="Password" name="password" type="password" value={form.password} onChange={update} placeholder="At least 8 characters" />
    {role === "admin" && mode === "register" && <Input label="Admin signup code" name="adminCode" type="password" value={form.adminCode} onChange={update} placeholder="Enter the invite code" />}
    <Button type="submit" className="primary-button" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</Button>
    <button type="button" className="auth-switch" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? `Need an ${role} account? Create one` : "Already have an account? Sign in"}</button>
  </form></div>;
}
