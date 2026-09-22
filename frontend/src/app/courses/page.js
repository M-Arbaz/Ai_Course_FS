"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import backendApi from "@/lib/api";
const courses = [
    {
        type: "Complete Program",
        title: "28 Days AI Challenge",
        description:
            "A complete learning journey covering 28 AI tools across 8 major categories.",
        tools: "28 Tools",
        color: "bg-[#eee5ff]",
        badge: "bg-purple-600 text-white",
    },
    {
        type: "Fast Track",
        title: "15 AI Tools",
        description:
            "A focused program featuring 15 essential tools for practical AI skills.",
        tools: "15 Tools",
        color: "bg-[#edffc9]",
        badge: "bg-[#a3e635] text-[#263800]",
    },
    {
        type: "Video Generation",
        title: "Video Generation - A",
        description: "Sora, Opus Clip, Runway and Pika Labs.",
        tools: "4 Tools",
        color: "bg-[#ffe5ef]",
        badge: "bg-pink-500 text-white",
    },
    {
        type: "Video Generation",
        title: "Video Generation - B",
        description: "Klap, Invideo, Luma Dream and Kling AI.",
        tools: "4 Tools",
        color: "bg-[#ffe9f2]",
        badge: "bg-pink-500 text-white",
    },
    {
        type: "Graphic Designing",
        title: "Graphic Designing - A",
        description:
            "Nano Banana, Midjourney, Stable Diffusion and Canva AI.",
        tools: "4 Tools",
        color: "bg-[#e0f4ff]",
        badge: "bg-sky-500 text-white",
    },
    {
        type: "Graphic Designing",
        title: "Graphic Designing - B",
        description: "FluxAI, Figma AI, Ideogram and Dora.",
        tools: "4 Tools",
        color: "bg-[#e5f6ff]",
        badge: "bg-sky-500 text-white",
    },
    {
        type: "AI Coding",
        title: "AI Coding - A",
        description: "Banana, Cursor, GitHub Copilot and Windsurf.",
        tools: "4 Tools",
        color: "bg-[#efffd8]",
        badge: "bg-lime-500 text-[#263800]",
    },
    {
        type: "AI Coding",
        title: "AI Coding - B",
        description: "Replit, Codeium, Tabnine and ChatGPT.",
        tools: "4 Tools",
        color: "bg-[#f0ffd9]",
        badge: "bg-lime-500 text-[#263800]",
    },
    {
        type: "Marketing",
        title: "SEO & Marketing",
        description: "SemrushAI, Surfer AI, AlbertAI and MarketMuse.",
        tools: "4 Tools",
        color: "bg-[#fff1d8]",
        badge: "bg-orange-400 text-white",
    },
    {
        type: "Data",
        title: "Data & Analytics",
        description: "Julius, Polymer, Akkio and Hex.",
        tools: "4 Tools",
        color: "bg-[#e8e5ff]",
        badge: "bg-indigo-500 text-white",
    },
    {
        type: "Sales",
        title: "Sales AI",
        description: "Apollo.io, Reige AI, Humantic AI and Outplay.",
        tools: "4 Tools",
        color: "bg-[#ffe5ea]",
        badge: "bg-rose-500 text-white",
    },
    {
        type: "Business",
        title: "Business AI",
        description: "Notion, Fireflies, Zapier and Panda AI.",
        tools: "4 Tools",
        color: "bg-[#e1f9ed]",
        badge: "bg-emerald-500 text-white",
    },
    {
        type: "Writing",
        title: "AI Writing",
        description: "Jasper, Copy.ai, Anyword and Writesonic.",
        tools: "4 Tools",
        color: "bg-[#f1e5ff]",
        badge: "bg-violet-500 text-white",
    },
    {
        type: "AI Chatbots",
        title: "AI Chatbot - A",
        description: "ChatGPT, Claude, Gemini and Grok.",
        tools: "4 Tools",
        color: "bg-[#e2f4ff]",
        badge: "bg-blue-500 text-white",
    },
    {
        type: "AI Chatbots",
        title: "AI Chatbot - B",
        description: "Perplexity Pro, Poe, Microsoft Copilot and DeepSeek.",
        tools: "4 Tools",
        color: "bg-[#eee7ff]",
        badge: "bg-purple-500 text-white",
    },
];
const filters = [
    "All Courses",
    "Programs",
    "Video",
    "Design",
    "Coding",
    "Marketing",
    "Data",
    "Business",
    "Sales",
    "Writing",
    "Chatbots",
];
const api = backendApi();
const filterMap = {
    Programs: ["Complete Program", "Fast Track"],
    Video: ["Video Generation"],
    Design: ["Graphic Designing"],
    Coding: ["AI Coding"],
    Marketing: ["Marketing"],
    Data: ["Data"],
    Business: ["Business"],
    Sales: ["Sales"],
    Writing: ["Writing"],
    Chatbots: ["AI Chatbots"],
};
export default function CoursesPage() {
    const [activeFilter, setActiveFilter] = useState("All Courses");

    const filteredCourses =
        activeFilter === "All Courses"
            ? courses
            : courses.filter((course) =>
                filterMap[activeFilter]?.includes(course.type)
            );
    // Tset variable ad
    return (
        <>
            <Navbar />
            <p>
                {api}
            </p>
            <main className="min-h-screen bg-white">
                <section className="soft-grid relative overflow-hidden border-b border-purple-100">
                    <div className="absolute -left-20 top-5 h-72 w-72 rounded-full bg-purple-200/60 blur-3xl" />
                    <div className="absolute right-0 top-16 h-72 w-72 rounded-full bg-lime-200/50 blur-3xl" />

                    <div className="relative mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
                        <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-purple-600 shadow-sm">
                            ✨ Learn Something New
                        </span>

                        <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-black tracking-tight text-[#21172f] md:text-6xl">
                            Explore our
                            <span className="text-purple-600"> AI Courses.</span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                            From complete AI challenges to focused skill courses, choose the
                            learning path that fits your goals.
                        </p>

                        <div className="mt-10 flex flex-wrap justify-center gap-2">
                            {filters.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setActiveFilter(item)}
                                    className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${activeFilter === item
                                        ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                                        : "border border-purple-100 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600"
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mb-10 flex items-end justify-between gap-5">
                            <div>
                                <p className="font-bold text-purple-600">All Programs</p>

                                <h2 className="mt-2 text-3xl font-black text-[#21172f]">
                                    Find your next AI skill.
                                </h2>
                            </div>
                            <p className="hidden text-sm text-slate-400 sm:block">
                                {filteredCourses.length}{" "}
                                {filteredCourses.length === 1 ? "course" : "courses"} available
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredCourses.map((course) => (
                                <article
                                    key={course.title}
                                    className={`${course.color} group rounded-[28px] p-7 transition duration-300 hover:-translate-y-2 hover:shadow-xl`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span
                                            className={`${course.badge} rounded-full px-3 py-1.5 text-xs font-bold`}
                                        >
                                            {course.type}
                                        </span>

                                        <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-500">
                                            {course.tools}
                                        </span>
                                    </div>

                                    <div className="mt-14">
                                        <h3 className="text-2xl font-black text-[#292032]">
                                            {course.title}
                                        </h3>

                                        <p className="mt-4 min-h-[56px] text-sm leading-7 text-slate-600">
                                            {course.description}
                                        </p>
                                    </div>

                                    <button className="mt-8 flex w-full items-center justify-between rounded-2xl bg-white/75 px-5 py-4 font-bold text-[#31243d] transition group-hover:bg-white">
                                        View Course
                                        <span>→</span>
                                    </button>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}