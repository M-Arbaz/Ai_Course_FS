"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function ForgotPasswordPage() {
  const { forgotPassword, resetPassword } = useAuth();
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(event) {
    event.preventDefault(); setError(""); setLoading(true);
    const value = new FormData(event.currentTarget).get("email");
    try { const data = await forgotPassword(value); setEmail(value); setNotice(data.message); setStep("reset"); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function updatePassword(event) {
    event.preventDefault(); setError(""); setLoading(true);
    const data = new FormData(event.currentTarget);
    const password = data.get("password");
    if (password !== data.get("confirmPassword")) { setError("Passwords do not match."); setLoading(false); return; }
    try { const response = await resetPassword({ email, otp: data.get("otp"), password }); setNotice(response.message); setStep("complete"); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return <main className="simple-auth-page"><section className="auth-card">
    {step === "request" && <><span className="eyebrow">Account recovery</span><h2>Forgot your password?</h2><p>Enter your verified email and we will send a secure reset code.</p><form onSubmit={requestCode}><label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>{error && <div className="form-error">{error}</div>}<button className="button button-primary button-full" disabled={loading}>{loading ? "Sending…" : "Send reset code"}</button></form><p className="auth-switch"><Link href="/login">← Back to login</Link></p></>}
    {step === "reset" && <><span className="eyebrow">Reset password</span><h2>Create a new password</h2><p>{notice}</p><form onSubmit={updatePassword}><label>6-digit reset code<input className="otp-input" name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" autoComplete="one-time-code" required /></label><label>New password<input name="password" type="password" minLength="8" maxLength="72" autoComplete="new-password" required /></label><label>Confirm new password<input name="confirmPassword" type="password" minLength="8" maxLength="72" autoComplete="new-password" required /></label>{error && <div className="form-error">{error}</div>}<button className="button button-primary button-full" disabled={loading}>{loading ? "Updating…" : "Update password"}</button></form></>}
    {step === "complete" && <div className="success-state"><span>✓</span><h2>Password updated</h2><p>{notice}</p><Link className="button button-primary button-full" href="/login">Log in securely</Link></div>}
  </section></main>;
}
