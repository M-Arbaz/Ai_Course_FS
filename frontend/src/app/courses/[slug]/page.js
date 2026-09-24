import Link from "next/link";
import { notFound } from "next/navigation";
import api from "@/lib/api";

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
        gradient: "from-pink-100 via-purple-50 to-orange-50",
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
// const courseDetails = {
//     "28-days-ai-challenge": {
//         title: "28 Days AI Challenge",
//         type: "Complete Program",
//         duration: "28 Days",
//         level: "Beginner to Advanced",
//         toolsCount: "25+ AI Tools",
//         description:
//             "A complete AI learning journey designed to help you explore, understand, and practically use today's most powerful AI tools.",
//         gradient: "from-purple-100 via-pink-50 to-blue-100",
//         badge: "bg-purple-600",
//         tools: [
//             "ChatGPT",
//             "Claude",
//             "Gemini",
//             "Perplexity AI",
//             "Sora",
//             "Runway",
//             "Nano Banana",
//             "Midjourney",
//             "Lexica",
//             "Ideogram",
//             "Cursor",
//             "GitHub Copilot",
//             "AdCreative.ai",
//             "Ocoya",
//             "Albert.ai",
//             "Canva AI",
//             "SciSpace",
//             "Nanonets",
//             "Elicit",
//             "Notion AI",
//             "Fireflies AI",
//             "CrewAI",
//             "n8n",
//             "Dora",
//             "Relume",
//             "Speak",
//             "Apollo AI",
//             "Humantic AI",
//         ],
//         outcomes: [
//             "Use leading AI assistants effectively",
//             "Create AI-generated images and videos",
//             "Build faster with AI coding tools",
//             "Use AI for marketing and business workflows",
//             "Automate repetitive tasks using modern AI tools",
//             "Understand practical AI use cases for real-world work",
//         ],
//     },

//     "15-ai-tools-program": {
//         title: "15 AI Tools Program",
//         type: "Fast Track Program",
//         duration: "15 Sessions",
//         level: "Beginner Friendly",
//         toolsCount: "15 AI Tools",
//         description:
//             "A focused fast-track program covering essential AI tools for productivity, creativity, coding, business and marketing.",
//         gradient: "from-lime-100 via-yellow-50 to-purple-100",
//         badge: "bg-lime-500",
//         tools: [
//             "ChatGPT",
//             "Claude",
//             "Gemini",
//             "Perplexity AI",
//             "Sora",
//             "Runway",
//             "Midjourney",
//             "Ideogram",
//             "Cursor",
//             "GitHub Copilot",
//             "Canva AI",
//             "n8n",
//             "Notion AI",
//             "Fireflies AI",
//             "Apollo AI",
//         ],
//         outcomes: [
//             "Understand the most useful AI tools",
//             "Improve daily productivity with AI",
//             "Create professional visual content",
//             "Use AI-assisted coding tools",
//             "Automate common business tasks",
//             "Build confidence using modern AI platforms",
//         ],
//     },

//     "video-generation-a": {
//         title: "Video Generation - A",
//         type: "Video Generation",
//         duration: "Short Course",
//         level: "Beginner Friendly",
//         toolsCount: "4 Tools",
//         description:
//             "Learn how to create engaging AI-generated video content using popular video generation and editing platforms.",
//         gradient: "from-blue-100 via-purple-50 to-pink-100",
//         badge: "bg-blue-500",
//         tools: ["Sora", "Opus Clip", "Runway", "Pika Labs"],
//         outcomes: [
//             "Generate videos from prompts",
//             "Create short-form social media content",
//             "Edit and repurpose video with AI",
//             "Understand AI video workflows",
//         ],
//     },

//     "video-generation-b": {
//         title: "Video Generation - B",
//         type: "Video Generation",
//         duration: "Short Course",
//         level: "Beginner Friendly",
//         toolsCount: "4 Tools",
//         description:
//             "Explore another powerful collection of AI video tools for content creation, storytelling and professional video workflows.",
//         gradient: "from-cyan-100 via-blue-50 to-purple-100",
//         badge: "bg-cyan-500",
//         tools: ["Klap", "Invideo", "Luma Dream", "Kling AI"],
//         outcomes: [
//             "Generate creative AI videos",
//             "Turn content into short clips",
//             "Create marketing videos faster",
//             "Explore modern AI video workflows",
//         ],
//     },

//     "graphic-designing-a": {
//         title: "Graphic Designing - A",
//         type: "Graphic Designing",
//         duration: "Short Course",
//         level: "Beginner Friendly",
//         toolsCount: "4 Tools",
//         description:
//             "Learn AI-powered graphic design and image generation using modern creative tools.",
//         gradient: "from-pink-100 via-purple-50 to-orange-50",
//         badge: "bg-pink-500",
//         tools: [
//             "Nano Banana",
//             "MidJourney",
//             "Stable Diffusion",
//             "Canva AI",
//         ],
//         outcomes: [
//             "Generate professional AI images",
//             "Create social media graphics",
//             "Understand prompt-based design",
//             "Improve creative workflows with AI",
//         ],
//     },

//     "graphic-designing-b": {
//         title: "Graphic Designing - B",
//         type: "Graphic Designing",
//         duration: "Short Course",
//         level: "Beginner Friendly",
//         toolsCount: "4 Tools",
//         description:
//             "Explore advanced AI design tools for visual creation, interface design and creative websites.",
//         gradient: "from-fuchsia-100 via-blue-50 to-green-50",
//         badge: "bg-fuchsia-500",
//         tools: ["FluxAI", "Figma AI", "Ideogram", "Dora"],
//         outcomes: [
//             "Create AI-assisted designs",
//             "Generate branded visual content",
//             "Use AI within UI design workflows",
//             "Build creative visual experiences",
//         ],
//     },

//     "ai-coding-a": {
//         title: "AI Coding - A",
//         type: "AI Coding",
//         duration: "Short Course",
//         level: "Beginner to Intermediate",
//         toolsCount: "4 Tools",
//         description:
//             "Learn how AI coding assistants can help you write, understand, debug and improve code faster.",
//         gradient: "from-green-100 via-blue-50 to-purple-100",
//         badge: "bg-green-500",
//         tools: ["Banana", "Cursor", "GitHub Copilot", "Wind Surf"],
//         outcomes: [
//             "Write code with AI assistance",
//             "Debug problems faster",
//             "Understand unfamiliar code",
//             "Improve developer productivity",
//         ],
//     },

//     "ai-coding-b": {
//         title: "AI Coding - B",
//         type: "AI Coding",
//         duration: "Short Course",
//         level: "Beginner to Intermediate",
//         toolsCount: "4 Tools",
//         description:
//             "Build and improve software using another powerful set of AI development platforms.",
//         gradient: "from-emerald-100 via-cyan-50 to-purple-100",
//         badge: "bg-emerald-500",
//         tools: ["Replit", "Codeium", "Tabnine", "ChatGPT"],
//         outcomes: [
//             "Build applications faster",
//             "Generate and explain code",
//             "Use AI inside development workflows",
//             "Improve coding productivity",
//         ],
//     },

//     "seo-marketing": {
//         title: "SEO & Marketing",
//         type: "SEO & Marketing",
//         duration: "Short Course",
//         level: "Beginner Friendly",
//         toolsCount: "4 Tools",
//         description:
//             "Use AI to improve SEO research, content strategy and digital marketing workflows.",
//         gradient: "from-yellow-100 via-lime-50 to-purple-100",
//         badge: "bg-yellow-500",
//         tools: ["SemrushAI", "Surfer AI", "AlbertAI", "Market Muse"],
//         outcomes: [
//             "Research SEO opportunities",
//             "Improve content planning",
//             "Use AI for digital marketing",
//             "Analyze and optimize content",
//         ],
//     },

//     "data-analytics": {
//         title: "Data & Analytics",
//         type: "Data & Analytics",
//         duration: "Short Course",
//         level: "Beginner Friendly",
//         toolsCount: "4 Tools",
//         description:
//             "Learn how AI-powered analytics tools can make data exploration and insights easier.",
//         gradient: "from-blue-100 via-cyan-50 to-lime-50",
//         badge: "bg-blue-600",
//         tools: ["Julius", "Polymer", "Akkio", "Hex"],
//         outcomes: [
//             "Explore data using AI",
//             "Generate useful insights",
//             "Create analytics workflows",
//             "Communicate findings more effectively",
//         ],
//     },

//     "sales-ai": {
//         title: "Sales AI",
//         type: "Sales AI",
//         duration: "Short Course",
//         level: "Beginner Friendly",
//         toolsCount: "4 Tools",
//         description:
//             "Discover AI tools that support prospecting, outreach and modern sales workflows.",
//         gradient: "from-orange-100 via-pink-50 to-purple-100",
//         badge: "bg-orange-500",
//         tools: ["Apollo io", "Reige AI", "Humantic AI", "Outplay"],
//         outcomes: [
//             "Improve sales prospecting",
//             "Use AI for personalized outreach",
//             "Support lead research",
//             "Streamline sales workflows",
//         ],
//     },

//     "business-ai": {
//         title: "Business AI",
//         type: "Business AI",
//         duration: "Short Course",
//         level: "Beginner Friendly",
//         toolsCount: "4 Tools",
//         description:
//             "Learn practical AI tools for productivity, meetings, automation and business operations.",
//         gradient: "from-purple-100 via-green-50 to-blue-100",
//         badge: "bg-purple-600",
//         tools: ["Notion", "Fireflies", "Zapier", "Panda AI"],
//         outcomes: [
//             "Improve business productivity",
//             "Automate repetitive workflows",
//             "Capture and organize meeting insights",
//             "Use AI for everyday business tasks",
//         ],
//     },

//     "ai-writing": {
//         title: "AI Writing",
//         type: "AI Writing",
//         duration: "Short Course",
//         level: "Beginner Friendly",
//         toolsCount: "4 Tools",
//         description:
//             "Create marketing, business and digital content faster using modern AI writing platforms.",
//         gradient: "from-pink-100 via-yellow-50 to-purple-100",
//         badge: "bg-pink-500",
//         tools: ["Jasper", "Copy.ai", "Anyword", "Writesonic"],
//         outcomes: [
//             "Generate content ideas",
//             "Draft marketing copy",
//             "Improve writing workflows",
//             "Create content efficiently with AI",
//         ],
//     },

//     "ai-chatbot-a": {
//         title: "AI Chatbot - A",
//         type: "AI Chatbots",
//         duration: "Short Course",
//         level: "Beginner Friendly",
//         toolsCount: "4 Tools",
//         description:
//             "Learn to use leading conversational AI assistants effectively for work, learning and productivity.",
//         gradient: "from-violet-100 via-blue-50 to-pink-100",
//         badge: "bg-violet-500",
//         tools: ["ChatGPT", "Claude", "Gemini", "Grok"],
//         outcomes: [
//             "Write better AI prompts",
//             "Compare chatbot capabilities",
//             "Use AI for research and productivity",
//             "Build practical chatbot workflows",
//         ],
//     },

//     "ai-chatbot-b": {
//         title: "AI Chatbot - B",
//         type: "AI Chatbots",
//         duration: "Short Course",
//         level: "Beginner Friendly",
//         toolsCount: "4 Tools",
//         description:
//             "Explore additional AI assistants for research, productivity, problem-solving and everyday work.",
//         gradient: "from-indigo-100 via-purple-50 to-green-50",
//         badge: "bg-indigo-500",
//         tools: [
//             "Perplexity Pro",
//             "Poe",
//             "Microsoft Copilot",
//             "DeepSeek",
//         ],
//         outcomes: [
//             "Explore different AI assistants",
//             "Improve online research",
//             "Use AI for professional tasks",
//             "Choose suitable tools for different workflows",
//         ],
//     },
// };

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
    );
}