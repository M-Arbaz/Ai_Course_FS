import Link from "next/link";
import { notFound } from "next/navigation";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const themeMap = {
    purple: {
        gradient: "from-purple-100 via-pink-50 to-blue-100",
        badge: "bg-purple-600",
    },

    lime: {
        gradient: "from-lime-100 via-yellow-50 to-purple-100",
        badge: "bg-lime-500",
    },

    blue: {
        gradient: "from-blue-100 via-purple-50 to-pink-100",
        badge: "bg-blue-500",
    },

    cyan: {
        gradient: "from-cyan-100 via-blue-50 to-purple-100",
        badge: "bg-cyan-500",
    },

    pink: {
        gradient:
            "from-pink-100 via-purple-50 to-orange-50 dark:from-[#3a1d30] dark:via-[#2b1d3d] dark:to-[#3a261a]",
        badge: "bg-pink-500",
    },

    fuchsia: {
        gradient: "from-fuchsia-100 via-blue-50 to-green-50",
        badge: "bg-fuchsia-500",
    },

    green: {
        gradient: "from-green-100 via-blue-50 to-purple-100",
        badge: "bg-green-500",
    },

    emerald: {
        gradient: "from-emerald-100 via-cyan-50 to-purple-100",
        badge: "bg-emerald-500",
    },

    yellow: {
        gradient: "from-yellow-100 via-lime-50 to-purple-100",
        badge: "bg-yellow-500",
    },

    orange: {
        gradient: "from-orange-100 via-pink-50 to-purple-100",
        badge: "bg-orange-500",
    },

    violet: {
        gradient: "from-violet-100 via-blue-50 to-pink-100",
        badge: "bg-violet-500",
    },

    indigo: {
        gradient: "from-indigo-100 via-purple-50 to-green-50",
        badge: "bg-indigo-500",
    },
};
async function getCourse(slug) {
    try {
        const response = await fetch(
            `${api()}/api/courses/${encodeURIComponent(slug)}`,
            {
                cache: "no-store",
            }
        );

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch course: ${response.status}`);
        }

        const data = await response.json();

        return data.course;
    } catch (error) {
        console.error("Course fetch error:", error);
        throw error;
    }
}

export default async function CourseDetailPage({ params }) {
    const { slug } = await params;

    const course = await getCourse(slug);

    if (!course) {
        notFound();
    }

    const theme = themeMap[course.theme] || themeMap.purple;

    const tools = Array.isArray(course.tools)
        ? course.tools
        : [];

    const outcomes = Array.isArray(course.outcomes)
        ? course.outcomes
        : [];
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white text-[#21172f]">

                {/* HERO */}
                <section className="px-4 pt-8 sm:px-6 lg:px-8">
                    <div
                        className={`mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-gradient-to-br ${theme.gradient}`}
                    >
                        <div className="grid gap-10 px-6 py-12 md:px-12 md:py-16 lg:grid-cols-[1.35fr_.65fr] lg:items-center">

                            <div>
                                <Link
                                    href="/courses"
                                    className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-purple-700 transition hover:gap-3"
                                >
                                    ← Back to Courses
                                </Link>

                                <div>
                                    <span
                                        className={`inline-flex rounded-full ${theme.badge} px-4 py-2 text-xs font-bold uppercase tracking-wider text-white`}
                                    >
                                        {course.type}
                                    </span>
                                </div>

                                <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                                    {course.title}
                                </h1>

                                <p className="mt-6 max-w-3xl text-base leading-8 text-slate-700 sm:text-lg">
                                    {course.description}
                                </p>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <div className="rounded-2xl bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
                                        <p className="text-xs font-semibold uppercase text-slate-500">
                                            Duration
                                        </p>
                                        <p className="mt-1 font-bold">{course.duration}</p>
                                    </div>

                                    <div className="rounded-2xl bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
                                        <p className="text-xs font-semibold uppercase text-slate-500">
                                            Level
                                        </p>
                                        <p className="mt-1 font-bold">{course.level}</p>
                                    </div>

                                    <div className="rounded-2xl bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
                                        <p className="text-xs font-semibold uppercase text-slate-500">
                                            Includes
                                        </p>
                                        <p className="mt-1 font-bold">
                                            {course.toolsCount || `${tools.length} AI Tools`}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-9 flex flex-wrap gap-4">
                                    <Link
                                        href="/contact"
                                        className="rounded-full bg-[#21172f] px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-xl"
                                    >
                                        Enroll Now
                                    </Link>

                                    <a
                                        href="#curriculum"
                                        className="rounded-full border border-purple-200 bg-white px-7 py-4 text-sm font-bold text-purple-700 transition hover:bg-purple-50"
                                    >
                                        View Curriculum
                                    </a>
                                </div>
                            </div>

                            {/* HERO CARD */}
                            <div className="relative">
                                <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-[#A3E635]/70 blur-2xl" />
                                <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-pink-300/70 blur-2xl" />

                                <div className="relative rounded-[30px] border border-white/70 bg-white/80 p-7 shadow-xl backdrop-blur-xl">
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-2xl text-white">
                                        ✦
                                    </div>

                                    <p className="text-sm font-bold uppercase tracking-widest text-purple-600">
                                        Course Experience
                                    </p>

                                    <h2 className="mt-3 text-2xl font-black">
                                        Learn AI by actually using it.
                                    </h2>

                                    <p className="mt-4 leading-7 text-slate-600">
                                        Practical learning focused on real AI tools and useful
                                        workflows instead of only theory.
                                    </p>

                                    <div className="mt-7 space-y-3">
                                        {[
                                            "Hands-on learning",
                                            "Practical AI tools",
                                            "Beginner-friendly guidance",
                                            "Real-world workflows",
                                        ].map((item) => (
                                            <div
                                                key={item}
                                                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3"
                                            >
                                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lime-200 text-xs font-black">
                                                    ✓
                                                </span>
                                                <span className="text-sm font-semibold">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* OVERVIEW */}
                <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-2">

                        <div>
                            <span className="text-sm font-bold uppercase tracking-[0.18em] text-purple-600">
                                Course Overview
                            </span>

                            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                                Build practical AI skills that you can actually use.
                            </h2>

                            <p className="mt-6 leading-8 text-slate-600">
                                This course introduces you to modern AI tools through a practical,
                                easy-to-follow learning experience. You will explore how different
                                tools can support creativity, productivity and professional
                                workflows.
                            </p>

                            <p className="mt-4 leading-8 text-slate-600">
                                The focus is on helping you become comfortable with AI and
                                understand where each tool fits into real-world work.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {[
                                {
                                    icon: "⚡",
                                    title: "Practical Learning",
                                    text: "Learn through practical AI workflows.",
                                    bg: "bg-purple-100",
                                },
                                {
                                    icon: "🎯",
                                    title: "Focused Skills",
                                    text: "Understand where and how to use each tool.",
                                    bg: "bg-lime-100",
                                },
                                {
                                    icon: "✨",
                                    title: "Creative Work",
                                    text: "Use AI to improve creative productivity.",
                                    bg: "bg-pink-100",
                                },
                                {
                                    icon: "🚀",
                                    title: "Future Ready",
                                    text: "Develop skills for AI-powered work.",
                                    bg: "bg-blue-100",
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className={`${item.bg} rounded-[26px] p-6`}
                                >
                                    <div className="text-3xl">{item.icon}</div>
                                    <h3 className="mt-5 text-lg font-black">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>

                {/* CURRICULUM */}
                <section
                    id="curriculum"
                    className="bg-[#faf9ff] px-4 py-20 sm:px-6 lg:px-8"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-3xl text-center">
                            <span className="text-sm font-bold uppercase tracking-[0.18em] text-purple-600">
                                Course Curriculum
                            </span>

                            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                                Tools you&apos;ll explore
                            </h2>

                            <p className="mt-4 leading-7 text-slate-600">
                                Get hands-on exposure to a carefully selected collection of AI
                                tools.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {tools.map((tool, index) => (
                                <div
                                    key={tool}
                                    className="group rounded-[24px] border border-purple-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-sm font-black text-purple-700">
                                            {String(index + 1).padStart(2, "0")}
                                        </div>

                                        <h3 className="font-bold">{tool}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* OUTCOMES */}
                {outcomes.length > 0 && (
                    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                        <div className="overflow-hidden rounded-[32px] bg-[#21172f] p-7 text-white sm:p-10 lg:p-14">
                            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">

                                <div>
                                    <span className="inline-flex rounded-full bg-purple-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-purple-200">
                                        Learning Outcomes
                                    </span>

                                    <h2 className="mt-5 text-3xl font-black sm:text-4xl">
                                        What you&apos;ll learn
                                    </h2>

                                    <p className="mt-5 max-w-lg leading-7 text-slate-300">
                                        By the end of this course, you&apos;ll understand how to use AI more
                                        confidently across practical tasks and workflows.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {outcomes.map((outcome) => (
                                        <div
                                            key={outcome}
                                            className="flex gap-4 rounded-[22px] bg-white/10 p-5 backdrop-blur"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A3E635] font-black text-[#21172f]">
                                                ✓
                                            </div>

                                            <p className="font-semibold leading-6 text-slate-100">
                                                {outcome}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>
                    </section>
                )}

                {/* WHO IS IT FOR */}
                <section className="px-4 pb-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <span className="text-sm font-bold uppercase tracking-[0.18em] text-purple-600">
                                Who Is This For?
                            </span>

                            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                                Made for curious learners
                            </h2>
                        </div>

                        <div className="mt-10 grid gap-5 md:grid-cols-3">
                            <div className="rounded-[28px] bg-purple-100 p-7">
                                <div className="text-3xl">🎓</div>
                                <h3 className="mt-5 text-xl font-black">Students</h3>
                                <p className="mt-3 leading-7 text-slate-600">
                                    Build practical AI skills for study, projects and future
                                    careers.
                                </p>
                            </div>

                            <div className="rounded-[28px] bg-lime-100 p-7">
                                <div className="text-3xl">💼</div>
                                <h3 className="mt-5 text-xl font-black">Professionals</h3>
                                <p className="mt-3 leading-7 text-slate-600">
                                    Improve productivity and bring AI into everyday professional
                                    workflows.
                                </p>
                            </div>

                            <div className="rounded-[28px] bg-pink-100 p-7">
                                <div className="text-3xl">🚀</div>
                                <h3 className="mt-5 text-xl font-black">
                                    Entrepreneurs
                                </h3>
                                <p className="mt-3 leading-7 text-slate-600">
                                    Discover AI tools that can support content, business and
                                    growth.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="px-4 pb-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl rounded-[32px] bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-500 px-6 py-12 text-center text-white sm:px-10 sm:py-16">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-100">
                            Start Learning
                        </p>

                        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black sm:text-5xl">
                            Ready to start your AI learning journey?
                        </h2>

                        <p className="mx-auto mt-5 max-w-2xl text-purple-100">
                            Join the course and start building practical AI skills with modern
                            tools.
                        </p>

                        <Link
                            href="/contact"
                            className="mt-8 inline-flex rounded-full bg-[#A3E635] px-8 py-4 text-sm font-black text-[#21172f] transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            Enroll in This Course
                        </Link>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}