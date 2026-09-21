"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function DashboardPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  useEffect(() => { if (ready && !user) router.replace("/login"); }, [ready, user, router]);
  if (!ready || !user) return <main className="dashboard-loading">Loading your dashboard…</main>;
  return (
    <main className="dashboard-page">
      <section className="dashboard-head section-shell"><div><span className="eyebrow">Student dashboard</span><h1>Good to see you, {user.name.split(" ")[0]}.</h1><p>Continue where you left off or explore your next AI skill.</p></div><div className="streak-card"><strong>4</strong><span>day learning streak</span></div></section>
      <section className="section-shell dashboard-grid">
        <div className="dashboard-main">
          <div className="dash-section-title"><div><h2>Continue learning</h2><p>Your active course</p></div><span>36% complete</span></div>
          <article className="continue-card"><div className="continue-visual"><span>Day 10</span><strong>AI</strong></div><div className="continue-copy"><span className="course-label">28 Days AI Challenge</span><h3>Research smarter with AI assistants</h3><p>Learn how to find, compare and verify information with a repeatable research workflow.</p><div className="progress-track"><span /></div><div className="continue-actions"><Link className="button button-primary" href="/courses/28-days-ai-challenge">Continue lesson</Link><span>12 min</span></div></div></article>
          <div className="dash-section-title"><div><h2>Your weekly activity</h2><p>Minutes spent learning</p></div><span>96 minutes</span></div>
          <div className="activity-chart" aria-label="Weekly activity chart">{[["M", 45], ["T", 75], ["W", 32], ["T", 88], ["F", 62], ["S", 18], ["S", 8]].map(([day, height], index) => <div key={`${day}-${index}`}><span style={{ height: `${height}%` }} /><small>{day}</small></div>)}</div>
        </div>
        <aside className="dashboard-side"><div className="stat-card"><span>Progress overview</span><div className="stat-ring">36<small>%</small></div><p>10 of 28 days completed</p></div><div className="next-card"><span className="eyebrow">Up next</span><h3>Create visual concepts</h3><p>Turn a written idea into a clear visual direction.</p><Link className="text-link" href="/courses">View lesson →</Link></div></aside>
      </section>
    </main>
  );
}
