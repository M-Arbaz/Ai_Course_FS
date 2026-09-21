import Link from "next/link";

export default function CourseCard({ course }) {
  return (
    <article className={`course-card accent-${course.accent}`}>
      <div className="course-card-top"><span className="course-label">{course.label}</span><span className="course-level">{course.level}</span></div>
      <div className="course-orbit" aria-hidden="true"><span>{course.lessons}</span><small>lessons</small></div>
      <h3>{course.title}</h3><p>{course.description}</p>
      <div className="course-meta"><span>{course.duration}</span><span>{course.lessons} lessons</span><strong>{course.price}</strong></div>
      <Link className="text-link" href={`/courses/${course.slug}`}>View course <span aria-hidden="true">→</span></Link>
    </article>
  );
}
