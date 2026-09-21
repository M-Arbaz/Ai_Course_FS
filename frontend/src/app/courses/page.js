import CourseCard from "@/components/CourseCard";
import { categories, courses } from "@/data/site";

export const metadata = { title: "Courses" };

export default function CoursesPage() {
  return (
    <main className="page-main">
      <section className="page-hero section-shell">
        <span className="eyebrow">Course library</span>
        <h1>Build the AI skills you actually need.</h1>
        <p>Start with a complete learning path or choose a focused course for one specific skill.</p>
      </section>
      <section className="section-shell course-browser">
        <div className="category-pills"><span className="active">All courses</span>{categories.map((category) => <span key={category}>{category}</span>)}</div>
        <div className="course-grid">{courses.map((course) => <CourseCard course={course} key={course.slug} />)}</div>
      </section>
    </main>
  );
}

