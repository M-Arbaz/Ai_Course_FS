"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    apiRequest('/auth/me')
      .then((data) => { if (active) setUser(data.user); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  const value = useMemo(() => ({
    user,
    ready,
    signup: (details) => apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify(details) }),
    verifySignup: (details) => apiRequest('/auth/verify-signup', { method: 'POST', body: JSON.stringify(details) }),
    resendSignupOtp: (email) => apiRequest('/auth/resend-signup-otp', { method: 'POST', body: JSON.stringify({ email }) }),
    login: (details) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(details) }),
    verifyLogin: async (details) => {
      const data = await apiRequest('/auth/verify-login', { method: 'POST', body: JSON.stringify(details) });
      setUser(data.user);
      return data;
    },
    forgotPassword: (email) => apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (details) => apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify(details) }),
    logout: async () => {
      try { await apiRequest('/auth/logout', { method: 'POST' }); }
      finally { setUser(null); }
    },
  }), [user, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
