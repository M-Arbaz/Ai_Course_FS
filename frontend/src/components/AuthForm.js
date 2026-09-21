"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const { login, resendSignupOtp, signup, verifyLogin, verifySignup } = useAuth();
  const [step, setStep] = useState("details");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submitDetails(event) {
    event.preventDefault();
    setError(""); setNotice(""); setLoading(true);
    const data = new FormData(event.currentTarget);
    const details = { name: data.get("name") || undefined, email: data.get("email"), password: data.get("password") };
    try {
      const response = isSignup ? await signup(details) : await login(details);
      setEmail(response.email || details.email);
      setNotice(response.message);
      setStep("otp");
    } catch (err) {
      setError(err.message);
      if (err.code === 'EMAIL_NOT_VERIFIED') { setEmail(details.email); setStep('verify-account'); }
    } finally { setLoading(false); }
  }

  async function submitOtp(event) {
    event.preventDefault();
    setError(""); setNotice(""); setLoading(true);
    const otp = new FormData(event.currentTarget).get("otp");
    try {
      if (isSignup || step === 'verify-account') {
        const response = await verifySignup({ email, otp });
        setNotice(response.message);
        setStep("verified");
      } else {
        await verifyLogin({ email, otp });
        router.push("/dashboard");
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function resendCode() {
    setError(""); setNotice(""); setLoading(true);
    try { const response = await resendSignupOtp(email); setNotice(response.message); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="auth-page">
      <section className="auth-aside">
        <div><span className="eyebrow">Secure learning account</span><h1>{isSignup ? "Your AI learning journey starts here." : "Welcome back to your learning space."}</h1><p>Every account is email verified, and every login is protected with a one-time security code.</p></div>
        <div className="auth-quote"><strong>“</strong><p>Don&apos;t just watch AI change the world. Learn how to use it.</p></div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          {step === "details" && <>
            <span className="eyebrow">{isSignup ? "Create an account" : "Secure student login"}</span>
            <h2>{isSignup ? "Start learning" : "Continue your progress"}</h2>
            <p>{isSignup ? "Create your account, then verify your email." : "Enter your password. We will email you a login code."}</p>
            <form onSubmit={submitDetails}>
              {isSignup && <label>Full name<input name="name" type="text" placeholder="Your full name" minLength="2" maxLength="120" autoComplete="name" required /></label>}
              <label>Email address<input name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></label>
              <label>Password<span className="password-field"><input name="password" type={showPassword ? "text" : "password"} placeholder="8+ characters, letters and numbers" minLength="8" maxLength="72" autoComplete={isSignup ? "new-password" : "current-password"} required /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button></span></label>
              {error && <div className="form-error" role="alert">{error}</div>}
              <button className="button button-primary button-full" type="submit" disabled={loading}>{loading ? "Please wait…" : isSignup ? "Create account" : "Continue securely"}</button>
            </form>
            {!isSignup && <Link className="forgot-link" href="/forgot-password">Forgot password?</Link>}
          </>}

          {(step === "otp" || step === "verify-account") && <>
            <span className="eyebrow">Email verification</span><h2>Enter your 6-digit code</h2><p>We sent a one-time code to <strong>{email}</strong>. It expires in 10 minutes.</p>
            {notice && <div className="form-notice" role="status">{notice}</div>}
            <form onSubmit={submitOtp}><label>Verification code<input className="otp-input" name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" placeholder="000000" autoComplete="one-time-code" required /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary button-full" type="submit" disabled={loading}>{loading ? "Verifying…" : step === "otp" && !isSignup ? "Verify and log in" : "Verify account"}</button></form>
            {(isSignup || step === 'verify-account') && <button className="resend-button" type="button" onClick={resendCode} disabled={loading}>Send a new code</button>}
            <button className="back-button" type="button" onClick={() => { setStep("details"); setError(""); setNotice(""); }}>← Change email or password</button>
          </>}

          {step === "verified" && <div className="success-state"><span>✓</span><h2>Email verified</h2><p>Your account is ready. Log in with your password and the secure code sent to your email.</p><Link className="button button-primary button-full" href="/login">Go to login</Link></div>}
          {step === "details" && <p className="auth-switch">{isSignup ? "Already have an account?" : "New to AI Course?"} <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Create account"}</Link></p>}
        </div>
      </section>
    </main>
  );
}
