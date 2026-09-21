import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import { categories, courses } from "@/data/site";

export default function Home() {
  return (
    <main>
      <section className="hero section-shell">
        <div className="hero-copy">
          <span className="eyebrow">Learn AI by doing</span>
          <h1>Turn curiosity into practical AI skills.</h1>
          <p>Short, structured lessons that help you use today&apos;s most useful AI tools for study, content, work and business—without the technical overwhelm.</p>
          <div className="hero-actions"><Link className="button button-primary" href="/signup">Start learning free</Link><Link className="button button-secondary" href="/courses">Explore courses</Link></div>
          <div className="trust-row"><span>Practical projects</span><span>Clear voice lessons</span><span>Learn at your pace</span></div>
        </div>
        <div className="hero-visual" aria-label="AI learning dashboard preview">
          <div className="glow glow-one" /><div className="glow glow-two" />
          <div className="learning-panel">
            <div className="panel-header"><div><small>Your learning path</small><strong>28 Days AI Challenge</strong></div><span className="progress-pill">36%</span></div>
            <div className="progress-track"><span /></div>
            <div className="lesson-list"><div className="lesson-row is-complete"><b>01</b><span>Write your first powerful prompt</span><i>Done</i></div><div className="lesson-row is-active"><b>02</b><span>Research with AI assistants</span><i>12 min</i></div><div className="lesson-row"><b>03</b><span>Create visual concepts</span><i>18 min</i></div></div>
          </div>
          <div className="floating-note note-one"><strong>84</strong><span>practical lessons</span></div><div className="floating-note note-two"><strong>8</strong><span>skill categories</span></div>
        </div>
      </section>
      <section className="category-strip" aria-label="Course categories"><div className="marquee-track">{[...categories, ...categories].map((category, index) => <span key={`${category}-${index}`}>{category}</span>)}</div></section>
      <section className="section-shell section-block">
        <div className="section-heading"><div><span className="eyebrow">Choose your path</span><h2>Courses built for real progress</h2></div><Link className="text-link" href="/courses">See all courses <span>→</span></Link></div>
        <div className="course-grid">{courses.map((course) => <CourseCard course={course} key={course.slug} />)}</div>
      </section>
      <section className="section-shell section-block" id="how-it-works"><div className="split-section"><div><span className="eyebrow">A simpler way to learn</span><h2>Small lessons. Useful practice. Visible progress.</h2><p className="lead-copy">Each module takes you from a clear explanation to a guided task, so you finish with something useful—not just another watched video.</p></div><div className="steps"><div className="step"><span>01</span><div><h3>Watch</h3><p>Learn one focused skill through a short, clear video.</p></div></div><div className="step"><span>02</span><div><h3>Practice</h3><p>Follow a practical activity with ready-to-use resources.</p></div></div><div className="step"><span>03</span><div><h3>Build</h3><p>Turn the skill into a project you can reuse and improve.</p></div></div></div></div></section>
      <section className="section-shell final-cta"><div><span className="eyebrow">Your next skill starts here</span><h2>Learn the AI tools shaping modern work.</h2></div><Link className="button button-light" href="/signup">Create your free account</Link></section>
    </main>
  );
}
