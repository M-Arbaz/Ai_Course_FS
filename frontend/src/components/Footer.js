import Link from "next/link";
import { siteConfig } from "@/data/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div><div className="brand footer-brand"><span className="brand-mark">{siteConfig.shortName}</span><span>{siteConfig.name}</span></div><p>{siteConfig.tagline}</p></div>
        <div><strong>Learn</strong><Link href="/courses">All courses</Link><Link href="/signup">Create account</Link></div>
        <div><strong>Support</strong><a href={`mailto:${siteConfig.supportEmail}`}>Contact</a><Link href="/">FAQ</Link></div>
        <div><strong>Legal</strong><Link href="/">Privacy</Link><Link href="/">Terms</Link></div>
      </div>
      <div className="footer-bottom">© 2026 {siteConfig.name}. Learn responsibly.</div>
    </footer>
  );
}

