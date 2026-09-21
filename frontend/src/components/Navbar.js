"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { siteConfig } from "@/data/site";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, ready, logout } = useAuth();
  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Main navigation">
        <Link className="brand" href="/" onClick={() => setOpen(false)}><span className="brand-mark">{siteConfig.shortName}</span><span>{siteConfig.name}</span></Link>
        <button className="menu-button" type="button" aria-expanded={open} aria-label="Toggle navigation" onClick={() => setOpen((value) => !value)}><span /><span /></button>
        <div className={`nav-links ${open ? "is-open" : ""}`}>
          <Link href="/courses" onClick={() => setOpen(false)}>Courses</Link>
          <Link href="/#how-it-works" onClick={() => setOpen(false)}>How it works</Link>
          {ready && user ? <><Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link><button className="button button-ghost button-small" type="button" onClick={async () => { await logout(); setOpen(false); }}>Log out</button></> : <><Link href="/login" onClick={() => setOpen(false)}>Log in</Link><Link className="button button-primary button-small" href="/signup" onClick={() => setOpen(false)}>Start learning</Link></>}
        </div>
      </nav>
    </header>
  );
}
