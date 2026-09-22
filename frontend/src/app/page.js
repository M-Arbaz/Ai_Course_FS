import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = [
    {
        icon: "✦",
        title: "AI Assistants",
        text: "ChatGPT, Claude, Gemini, Perplexity and more.",
        bg: "bg-[#f1e9ff]",
        iconBg: "bg-purple-600",
    },
    {
        icon: "▶",
        title: "Video Generation",
        text: "Sora, Runway, Pika, Kling, Luma and more.",
        bg: "bg-[#ffe8f2]",
        iconBg: "bg-pink-500",
    },
    {
        icon: "✺",
        title: "Graphic Designing",
        text: "Midjourney, Canva AI, Ideogram, Flux and more.",
        bg: "bg-[#e4f3ff]",
        iconBg: "bg-sky-500",
    },
    {
        icon: "</>",
        title: "AI Coding",
        text: "Cursor, Copilot, Replit, Windsurf and more.",
        bg: "bg-[#efffd4]",
        iconBg: "bg-lime-500",
    },
    {
        icon: "↗",
        title: "SEO & Marketing",
        text: "Use AI for smarter content, SEO and campaigns.",
        bg: "bg-[#fff3d9]",
        iconBg: "bg-orange-400",
    },
    {
        icon: "▥",
        title: "Data & Analytics",
        text: "Analyze data and discover useful insights with AI.",
        bg: "bg-[#ebe8ff]",
        iconBg: "bg-indigo-500",
    },
    {
        icon: "⚡",
        title: "Business AI",
        text: "Automate workflows and everyday business tasks.",
        bg: "bg-[#ddfaee]",
        iconBg: "bg-emerald-500",
    },
    {
        icon: "◎",
        title: "Sales AI",
        text: "Prospecting, lead generation and AI-powered sales.",
        bg: "bg-[#ffe5ec]",
        iconBg: "bg-rose-500",
    },
];

const featuredCourses = [
    {
        tag: "Complete Program",
        title: "28 Days AI Challenge",
        description:
            "Master 28 powerful AI tools across assistants, video, design, coding, marketing, analytics, business and sales.",
        info: "28 AI Tools",
        bg: "bg-[#efe7ff]",
        badge: "bg-purple-600 text-white",
    },
    {
        tag: "Fast Track",
        title: "15 AI Tools",
        description:
            "A focused learning path covering the most useful AI tools for modern digital work.",
        info: "15 AI Tools",
        bg: "bg-[#eaffcb]",
        badge: "bg-[#a3e635] text-[#243500]",
    },
    {
        tag: "Video",
        title: "Video Generation - A",
        description:
            "Learn Sora, Opus Clip, Runway and Pika Labs through practical workflows.",
        info: "4 Tools",
        bg: "bg-[#ffe7f1]",
        badge: "bg-pink-500 text-white",
    },
    {
        tag: "Design",
        title: "Graphic Designing - A",
        description:
            "Create modern graphics using Nano Banana, Midjourney, Stable Diffusion and Canva AI.",
        info: "4 Tools",
        bg: "bg-[#e2f4ff]",
        badge: "bg-sky-500 text-white",
    },
    {
        tag: "Coding",
        title: "AI Coding - A",
        description:
            "Code smarter using Banana, Cursor, GitHub Copilot and Windsurf.",
        info: "4 Tools",
        bg: "bg-[#efffd9]",
        badge: "bg-lime-500 text-[#253300]",
    },
    {
        tag: "Business",
        title: "Business AI",
        description:
            "Use Notion, Fireflies, Zapier and Panda AI to improve business productivity.",
        info: "4 Tools",
        bg: "bg-[#e6e2ff]",
        badge: "bg-indigo-500 text-white",
    },
];

export default function Home() {
    return (
        <>
            <Navbar />

            <main className="overflow-hidden bg-white">
                {/* HERO */}
                <section className="soft-grid relative overflow-hidden">
                    <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-purple-200/50 blur-3xl" />
                    <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-lime-200/50 blur-3xl" />
                    <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-pink-100/80 blur-3xl" />

                    <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-bold text-purple-600 shadow-sm">
                                <span>✨</span>
                                Practical AI Learning
                            </div>

                            <h1 className="mt-7 max-w-2xl text-5xl font-black leading-[1.05] tracking-[-0.04em] text-[#21172f] sm:text-6xl lg:text-[72px]">
                                Learn AI.
                                <span className="block text-purple-600">Create Smarter.</span>
                                <span className="relative inline-block">
                                    Grow Faster.
                                    <span className="absolute -bottom-1 left-1 h-3 w-full -rotate-1 rounded-full bg-[#a3e635]/60 -z-10" />
                                </span>
                            </h1>

                            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
                                Learn today's most powerful AI tools through practical courses
                                built for real skills, real work and real results.
                            </p>

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/courses"
                                    className="inline-flex items-center justify-center rounded-full bg-purple-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-1 hover:bg-purple-700"
                                >
                                    Explore All Courses →
                                </Link>

                                <a
                                    href="#featured"
                                    className="inline-flex items-center justify-center rounded-full bg-[#a3e635] px-7 py-4 text-sm font-bold text-[#273700] shadow-lg shadow-lime-100 transition hover:-translate-y-1"
                                >
                                    Start Learning
                                </a>
                            </div>

                            <div className="mt-9 flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
                                <span className="rounded-full bg-purple-50 px-4 py-2">
                                    ✓ Beginner Friendly
                                </span>
                                <span className="rounded-full bg-lime-50 px-4 py-2">
                                    ✓ Practical Skills
                                </span>
                                <span className="rounded-full bg-sky-50 px-4 py-2">
                                    ✓ Modern AI Tools
                                </span>
                            </div>
                        </div>

                        {/* HERO BENTO */}
                        <div className="relative mx-auto w-full max-w-xl">
                            <div className="absolute -left-6 top-16 h-28 w-28 rounded-full bg-purple-300/40 blur-2xl" />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 rounded-[32px] bg-[#eee5ff] p-7 shadow-xl shadow-purple-100">
                                    <div className="flex items-center justify-between">
                                        <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-purple-600">
                                            AI ASSISTANTS
                                        </span>

                                        <div className="flex -space-x-2">
                                            {["C", "G", "P"].map((item) => (
                                                <div
                                                    key={item}
                                                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#eee5ff] bg-white text-xs font-black text-purple-600"
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <h3 className="mt-8 text-3xl font-black text-[#312047]">
                                        Work smarter with AI.
                                    </h3>

                                    <p className="mt-3 max-w-sm text-sm leading-6 text-[#6f5c85]">
                                        Learn ChatGPT, Claude, Gemini and Perplexity for everyday
                                        work, research and productivity.
                                    </p>
                                </div>

                                <div className="rounded-[28px] bg-[#eaffbf] p-6 shadow-lg shadow-lime-100">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#a3e635] font-black text-[#273500]">
                                        &lt;/&gt;
                                    </div>

                                    <p className="mt-8 text-xs font-black uppercase tracking-wider text-[#66851c]">
                                        AI Coding
                                    </p>

                                    <h4 className="mt-2 text-xl font-black text-[#263315]">
                                        Build faster.
                                    </h4>
                                </div>

                                <div className="rounded-[28px] bg-[#ffe4ef] p-6 shadow-lg shadow-pink-100">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500 font-bold text-white">
                                        ▶
                                    </div>

                                    <p className="mt-8 text-xs font-black uppercase tracking-wider text-pink-500">
                                        AI Video
                                    </p>

                                    <h4 className="mt-2 text-xl font-black text-[#512535]">
                                        Create anything.
                                    </h4>
                                </div>

                                <div className="col-span-2 flex items-center justify-between rounded-[28px] bg-[#ddf3ff] p-6 shadow-lg shadow-sky-100">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-wider text-sky-500">
                                            Learning Paths
                                        </p>
                                        <h4 className="mt-2 text-2xl font-black text-[#17334a]">
                                            Learn at your own pace.
                                        </h4>
                                    </div>

                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                                        ↗
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* LEARNING PATHS */}
                <section className="py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-purple-500">
                                Choose Your Path
                            </span>

                            <h2 className="mt-4 text-4xl font-black tracking-tight text-[#21172f] md:text-5xl">
                                Learn AI your way.
                            </h2>

                            <p className="mt-5 text-slate-500">
                                Choose a complete journey, a fast-track program or focus on one
                                specific AI skill.
                            </p>
                        </div>

                        <div className="mt-14 grid gap-6 lg:grid-cols-3">
                            <div className="group rounded-[30px] bg-[#eee5ff] p-8 transition hover:-translate-y-2">
                                <span className="rounded-full bg-purple-600 px-4 py-2 text-xs font-bold text-white">
                                    COMPLETE JOURNEY
                                </span>

                                <div className="mt-12 text-6xl font-black text-purple-600">
                                    28
                                </div>

                                <h3 className="mt-2 text-2xl font-black text-[#332146]">
                                    Days AI Challenge
                                </h3>

                                <p className="mt-4 leading-7 text-[#756384]">
                                    Explore 28 different AI tools across the most useful
                                    categories.
                                </p>

                                <Link
                                    href="/courses"
                                    className="mt-8 inline-flex font-bold text-purple-700"
                                >
                                    Explore program →
                                </Link>
                            </div>

                            <div className="group rounded-[30px] bg-[#edffc9] p-8 transition hover:-translate-y-2">
                                <span className="rounded-full bg-[#a3e635] px-4 py-2 text-xs font-bold text-[#314300]">
                                    FAST TRACK
                                </span>

                                <div className="mt-12 text-6xl font-black text-[#82b11a]">
                                    15
                                </div>

                                <h3 className="mt-2 text-2xl font-black text-[#293714]">
                                    Essential AI Tools
                                </h3>

                                <p className="mt-4 leading-7 text-[#69764e]">
                                    Learn the core AI platforms that matter most for modern work.
                                </p>

                                <Link
                                    href="/courses"
                                    className="mt-8 inline-flex font-bold text-[#557b00]"
                                >
                                    Explore program →
                                </Link>
                            </div>

                            <div className="group rounded-[30px] bg-[#ffe7f0] p-8 transition hover:-translate-y-2">
                                <span className="rounded-full bg-pink-500 px-4 py-2 text-xs font-bold text-white">
                                    SKILL BASED
                                </span>

                                <div className="mt-12 text-6xl font-black text-pink-500">13+</div>

                                <h3 className="mt-2 text-2xl font-black text-[#4c2634]">
                                    Single Courses
                                </h3>

                                <p className="mt-4 leading-7 text-[#84646f]">
                                    Focus on video, design, coding, sales, marketing, data and
                                    more.
                                </p>

                                <Link
                                    href="/courses"
                                    className="mt-8 inline-flex font-bold text-pink-600"
                                >
                                    View all courses →
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CATEGORIES */}
                <section id="categories" className="bg-[#fbfaff] py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-500">
                                    Explore Skills
                                </p>

                                <h2 className="mt-4 text-4xl font-black tracking-tight text-[#21172f] md:text-5xl">
                                    Learn what excites you.
                                </h2>
                            </div>

                            <Link
                                href="/courses"
                                className="font-bold text-purple-600 hover:text-purple-800"
                            >
                                Browse all courses →
                            </Link>
                        </div>

                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {categories.map((item) => (
                                <Link
                                    href="/courses"
                                    key={item.title}
                                    className={`${item.bg} group rounded-[26px] p-6 transition duration-300 hover:-translate-y-2 hover:shadow-xl`}
                                >
                                    <div
                                        className={`${item.iconBg} flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black text-white shadow-sm`}
                                    >
                                        {item.icon}
                                    </div>

                                    <h3 className="mt-8 text-xl font-black text-[#262030]">
                                        {item.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                        {item.text}
                                    </p>

                                    <div className="mt-7 font-bold text-[#30253d] transition group-hover:translate-x-1">
                                        Explore →
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FEATURED */}
                <section id="featured" className="py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-500">
                                Featured Courses
                            </p>

                            <h2 className="mt-4 text-4xl font-black tracking-tight text-[#21172f] md:text-5xl">
                                Start with something amazing.
                            </h2>
                        </div>

                        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {featuredCourses.map((course) => (
                                <article
                                    key={course.title}
                                    className={`${course.bg} rounded-[28px] p-7 transition duration-300 hover:-translate-y-2 hover:shadow-xl`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`${course.badge} rounded-full px-3 py-1.5 text-xs font-bold`}
                                        >
                                            {course.tag}
                                        </span>

                                        <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-500">
                                            {course.info}
                                        </span>
                                    </div>

                                    <div className="mt-14">
                                        <h3 className="text-2xl font-black text-[#282031]">
                                            {course.title}
                                        </h3>

                                        <p className="mt-4 min-h-[84px] text-sm leading-7 text-slate-600">
                                            {course.description}
                                        </p>
                                    </div>

                                    <Link
                                        href="/courses"
                                        className="mt-7 inline-flex items-center font-bold text-[#312540]"
                                    >
                                        View course →
                                    </Link>
                                </article>
                            ))}
                        </div>

                        <div className="mt-10 text-center">
                            <Link
                                href="/courses"
                                className="inline-flex rounded-full border-2 border-purple-200 px-7 py-3.5 font-bold text-purple-600 transition hover:bg-purple-50"
                            >
                                View All Courses
                            </Link>
                        </div>
                    </div>
                </section>

                {/* WHY US */}
                <section id="why-us" className="bg-[#f5f1ff] py-24">
                    <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-8">
                        <div>
                            <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-purple-600 shadow-sm">
                                Why Learn With Us
                            </span>

                            <h2 className="mt-7 max-w-xl text-4xl font-black leading-tight tracking-tight text-[#21172f] md:text-5xl">
                                Less theory.
                                <span className="text-purple-600"> More doing.</span>
                            </h2>

                            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                                Our learning experience is built around practical AI tools and
                                real workflows you can immediately use in work, study,
                                freelancing, creativity and business.
                            </p>

                            <Link
                                href="/courses"
                                className="mt-8 inline-flex rounded-full bg-[#a3e635] px-7 py-4 font-bold text-[#2b3a00]"
                            >
                                Find Your Course →
                            </Link>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {[
                                ["01", "Practical Learning", "Learn by actually using AI tools."],
                                [
                                    "02",
                                    "Modern Skills",
                                    "Focus on tools shaping today's digital world.",
                                ],
                                [
                                    "03",
                                    "Simple Learning",
                                    "Clear learning paths without unnecessary complexity.",
                                ],
                                [
                                    "04",
                                    "Career Ready",
                                    "Build skills useful for real projects and work.",
                                ],
                            ].map(([number, title, text], index) => (
                                <div
                                    key={title}
                                    className={`rounded-[25px] p-6 ${index === 0
                                            ? "bg-white"
                                            : index === 1
                                                ? "bg-[#e9ffd0]"
                                                : index === 2
                                                    ? "bg-[#dff3ff]"
                                                    : "bg-[#ffe4ef]"
                                        }`}
                                >
                                    <span className="text-xs font-black text-purple-500">
                                        {number}
                                    </span>

                                    <h3 className="mt-8 text-lg font-black text-[#282031]">
                                        {title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section className="py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="text-center">
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-500">
                                Simple Learning Journey
                            </p>

                            <h2 className="mt-4 text-4xl font-black text-[#21172f] md:text-5xl">
                                Four steps. Big progress.
                            </h2>
                        </div>

                        <div className="mt-14 grid gap-4 md:grid-cols-4">
                            {[
                                ["01", "Choose", "Pick a course that matches your goals."],
                                ["02", "Learn", "Understand tools through simple lessons."],
                                ["03", "Practice", "Use AI on practical tasks and projects."],
                                ["04", "Grow", "Turn your new skills into real results."],
                            ].map(([num, title, text], index) => (
                                <div
                                    key={title}
                                    className="relative rounded-[26px] border border-purple-100 bg-white p-7 shadow-sm"
                                >
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-black ${index === 0
                                                ? "bg-purple-100 text-purple-600"
                                                : index === 1
                                                    ? "bg-lime-100 text-lime-700"
                                                    : index === 2
                                                        ? "bg-sky-100 text-sky-600"
                                                        : "bg-pink-100 text-pink-600"
                                            }`}
                                    >
                                        {num}
                                    </div>

                                    <h3 className="mt-8 text-xl font-black text-[#282031]">
                                        {title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="px-6 pb-24 lg:px-8">
                    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[38px] bg-purple-600 px-6 py-16 text-center md:py-20">
                        <div className="absolute -left-14 -top-14 h-44 w-44 rounded-full bg-[#a3e635] opacity-90" />
                        <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-pink-300 opacity-60" />
                        <div className="absolute right-40 top-8 h-20 w-20 rounded-full bg-sky-300 opacity-60" />

                        <div className="relative z-10 mx-auto max-w-3xl">
                            <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
                                Your AI Journey Starts Here
                            </span>

                            <h2 className="mt-7 text-4xl font-black leading-tight text-white md:text-6xl">
                                Ready to make AI your new superpower?
                            </h2>

                            <p className="mx-auto mt-6 max-w-xl leading-7 text-purple-100">
                                Explore our learning paths and start building practical AI
                                skills today.
                            </p>

                            <Link
                                href="/courses"
                                className="mt-9 inline-flex rounded-full bg-[#a3e635] px-8 py-4 font-black text-[#283900] transition hover:scale-105"
                            >
                                Explore Courses →
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}