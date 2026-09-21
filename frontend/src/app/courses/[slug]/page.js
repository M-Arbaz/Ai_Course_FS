import Link from "next/link";
import { notFound } from "next/navigation";
import { courses } from "@/data/site";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);
  return course ? { title: course.title, description: course.description } : {};
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);
  if (!course) notFound();
  return (
    <main className="page-main">
      <section className={`course-detail-hero accent-${course.accent}`}>
        <div className="section-shell detail-grid">
          <div><Link className="back-link" href="/courses">← All courses</Link><span className="course-label">{course.label}</span><h1>{course.title}</h1><p>{course.description}</p><div className="detail-meta"><span>{course.duration}</span><span>{course.lessons} lessons</span><span>{course.level}</span></div></div>
          <aside className="enroll-card"><span>One-time course access</span><strong>{course.price}</strong><p>Create your secure student account to continue to enrollment and save your learning progress.</p><Link className="button button-primary button-full" href="/signup">Create account to enroll</Link><small>Payment integration will connect in the next phase.</small></aside>
        </div>
      </section>
      <section className="section-shell detail-content">
        <div><span className="eyebrow">What you will learn</span><h2>Practical outcomes</h2><div className="outcome-grid">{course.outcomes.map((outcome) => <div className="outcome" key={outcome}><span>✓</span><p>{outcome}</p></div>)}</div></div>
        <div><span className="eyebrow">Course curriculum</span><h2>Inside the program</h2><div className="module-list">{course.modules.map((module, index) => <div className="module" key={module}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{module}</h3><p>Short videos, guided practice and downloadable resources.</p></div><b>{index + 3} lessons</b></div>)}</div></div>
      </section>
    </main>
  );
}
