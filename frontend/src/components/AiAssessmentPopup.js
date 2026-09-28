"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../lib/api";

const COMPLETED_KEY = "aiAssessmentCompleted";
const SHOW_COUNT_KEY = "aiAssessmentShowCount";
const SESSION_SHOWN_KEY = "aiAssessmentShownThisSession";

const questions = [
    {
        key: "usage",
        title: "How often do you use AI tools?",
        subtitle: "Think about tools like ChatGPT, Gemini, Claude or other AI apps.",
        type: "single",
        options: [
            { value: "never", label: "Never", icon: "🌱", text: "I am just getting started" },
            { value: "sometimes", label: "Sometimes", icon: "✨", text: "Only when I need them" },
            { value: "weekly", label: "Every Week", icon: "🚀", text: "AI is part of my routine" },
            { value: "daily", label: "Every Day", icon: "⚡", text: "I use AI regularly" },
        ],
    },

    {
        key: "toolsUsed",
        title: "Which AI tools have you already used?",
        subtitle: "Select all that apply.",
        type: "multiple",
        options: [
            { value: "chatgpt", label: "ChatGPT", icon: "💬" },
            { value: "gemini", label: "Gemini", icon: "✨" },
            { value: "claude", label: "Claude", icon: "🧠" },
            { value: "perplexity", label: "Perplexity", icon: "🔎" },
            { value: "canva-ai", label: "Canva AI", icon: "🎨" },
            { value: "midjourney", label: "Midjourney", icon: "🖼️" },
            { value: "cursor", label: "Cursor", icon: "💻" },
            { value: "github-copilot", label: "GitHub Copilot", icon: "👨‍💻" },
            { value: "n8n", label: "Automation Tools", icon: "⚙️" },
            { value: "none", label: "None Yet", icon: "🌱" },
        ],
    },

    {
        key: "confidence",
        title: "How confident are you with AI?",
        subtitle: "Choose the option that best describes you.",
        type: "single",
        options: [
            { value: "beginner", label: "Beginner", icon: "🌱", text: "I need guidance" },
            { value: "basic", label: "Basic", icon: "🙂", text: "I know the basics" },
            { value: "comfortable", label: "Comfortable", icon: "🚀", text: "I can use AI independently" },
            { value: "very-confident", label: "Very Confident", icon: "⚡", text: "AI is already part of my workflow" },
        ],
    },

    {
        key: "interest",
        title: "What do you most want to learn with AI?",
        subtitle: "We will use this to personalize your course recommendations.",
        type: "single",
        options: [
            { value: "content-productivity", label: "Content & Productivity", icon: "✍️" },
            { value: "image-design", label: "Images & Graphic Design", icon: "🎨" },
            { value: "video", label: "AI Video Creation", icon: "🎬" },
            { value: "coding", label: "Coding & Development", icon: "💻" },
            { value: "marketing", label: "SEO & Marketing", icon: "📈" },
            { value: "data-research", label: "Data & Research", icon: "📊" },
            { value: "business-automation", label: "Business & Automation", icon: "⚙️" },
        ],
    },

    {
        key: "prompting",
        title: "How good are you at writing AI prompts?",
        subtitle: "A good prompt helps AI understand exactly what you need.",
        type: "single",
        options: [
            { value: "no-idea", label: "No Idea Yet", icon: "🤔", text: "I normally just type a simple question" },
            { value: "basic", label: "Basic", icon: "🌱", text: "I can write simple instructions" },
            { value: "good", label: "Good", icon: "🚀", text: "I add context and clear instructions" },
            { value: "advanced", label: "Advanced", icon: "⚡", text: "I build detailed reusable prompts" },
        ],
    },

    {
        key: "projects",
        title: "Have you completed a project using AI?",
        subtitle: "This helps us understand your practical experience.",
        type: "single",
        options: [
            { value: "never", label: "Not Yet", icon: "🌱", text: "I haven't completed one yet" },
            { value: "small-tasks", label: "Small Tasks", icon: "✨", text: "I use AI for individual tasks" },
            { value: "complete-projects", label: "Complete Projects", icon: "🚀", text: "I have built full projects with AI" },
            { value: "automated-workflows", label: "Automated Workflows", icon: "⚡", text: "I automate multi-step work" },
        ],
    },

    {
        key: "goal",
        title: "What is your main goal with AI?",
        subtitle: "One last question before we calculate your AI level.",
        type: "single",
        options: [
            { value: "job-skills", label: "Improve Job Skills", icon: "💼" },
            { value: "freelancing", label: "Start / Grow Freelancing", icon: "🌍" },
            { value: "business", label: "Grow My Business", icon: "📈" },
            { value: "content-creation", label: "Create Better Content", icon: "🎥" },
            { value: "study", label: "Study & Research", icon: "📚" },
            { value: "productivity", label: "Save Time & Be Productive", icon: "⚡" },
        ],
    },
];

const initialAnswers = {
    usage: "",
    toolsUsed: [],
    confidence: "",
    interest: "",
    prompting: "",
    projects: "",
    goal: "",
};

export default function AiAssessmentPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [screen, setScreen] = useState("intro");
    const [questionIndex, setQuestionIndex] = useState(0);

    const [answers, setAnswers] = useState(initialAnswers);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    // -----------------------------------------
    // SHOW AFTER 2% SCROLL
    // Max 5 appearances
    // Never show again after successful test
    // Only once in the same browser session
    // -----------------------------------------

    useEffect(() => {
        const completed =
            localStorage.getItem(COMPLETED_KEY) === "true";

        const alreadyShownThisSession =
            sessionStorage.getItem(SESSION_SHOWN_KEY) === "true";

        const currentShowCount =
            Number(localStorage.getItem(SHOW_COUNT_KEY) || 0);

        if (completed || alreadyShownThisSession || currentShowCount >= 5) {
            return;
        }

        const handleScroll = () => {
            const documentHeight =
                document.documentElement.scrollHeight - window.innerHeight;

            if (documentHeight <= 0) {
                return;
            }

            const scrollPercent =
                (window.scrollY / documentHeight) * 100;

            if (scrollPercent >= 2) {
                setIsOpen(true);

                sessionStorage.setItem(
                    SESSION_SHOWN_KEY,
                    "true"
                );

                localStorage.setItem(
                    SHOW_COUNT_KEY,
                    String(currentShowCount + 1)
                );

                window.removeEventListener("scroll", handleScroll);
            }
        };

        window.addEventListener("scroll", handleScroll, {
            passive: true,
        });

        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // -----------------------------------------
    // ESC + body scroll lock
    // -----------------------------------------

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    const currentQuestion = questions[questionIndex];

    const progress =
        ((questionIndex + 1) / questions.length) * 100;

    const selectSingleOption = (value) => {
        setAnswers((previous) => ({
            ...previous,
            [currentQuestion.key]: value,
        }));
    };

    const toggleMultipleOption = (value) => {
        setAnswers((previous) => {
            const current = previous.toolsUsed || [];

            if (value === "none") {
                return {
                    ...previous,
                    toolsUsed: ["none"],
                };
            }

            const withoutNone = current.filter(
                (item) => item !== "none"
            );

            const exists = withoutNone.includes(value);

            return {
                ...previous,
                toolsUsed: exists
                    ? withoutNone.filter((item) => item !== value)
                    : [...withoutNone, value],
            };
        });
    };

    const questionHasAnswer = () => {
        if (!currentQuestion) {
            return false;
        }

        const value = answers[currentQuestion.key];

        if (currentQuestion.type === "multiple") {
            return Array.isArray(value) && value.length > 0;
        }

        return Boolean(value);
    };

    const nextQuestion = () => {
        if (!questionHasAnswer()) {
            return;
        }

        if (questionIndex < questions.length - 1) {
            setQuestionIndex((previous) => previous + 1);
            return;
        }

        setScreen("lead");
    };

    const goBack = () => {
        setError("");

        if (screen === "lead") {
            setScreen("questions");
            setQuestionIndex(questions.length - 1);
            return;
        }

        if (screen === "questions") {
            if (questionIndex === 0) {
                setScreen("intro");
            } else {
                setQuestionIndex((previous) => previous - 1);
            }
        }
    };

    const submitAssessment = async (event) => {
        event.preventDefault();

        setError("");

        const cleanEmail = email.trim();

        if (!cleanEmail) {
            setError("Please enter your email address.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            setSubmitting(true);

            const response = await fetch(
                `${api()}/api/ai-assessment`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: cleanEmail,
                        answers,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to complete assessment."
                );
            }

            setResult(data);
            setScreen("result");

            // Assessment successfully completed.
            // Never show popup again on this browser.
            localStorage.setItem(COMPLETED_KEY, "true");
        } catch (err) {
            console.error("AI assessment submit error:", err);

            setError(
                err.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="AI Readiness Test"
        >
            <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-purple-100 bg-white shadow-2xl">

                {/* decorative backgrounds */}

                <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-purple-200/40 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-20 h-52 w-52 rounded-full bg-lime-200/40 blur-3xl" />
                <div className="pointer-events-none absolute right-20 top-20 h-32 w-32 rounded-full bg-pink-200/30 blur-3xl" />

                {/* Close */}

                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl font-medium text-slate-500 shadow-sm transition hover:scale-105 hover:bg-slate-50 hover:text-slate-900"
                    aria-label="Close AI assessment"
                >
                    ×
                </button>

                <div className="relative z-10 p-5 sm:p-8 md:p-10">

                    {/* INTRO */}

                    {screen === "intro" && (
                        <div className="py-5 text-center sm:py-8">

                            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-purple-100 via-pink-100 to-lime-100 text-4xl shadow-sm">
                                ✨
                            </div>

                            <div className="mb-4 inline-flex rounded-full bg-purple-100 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.15em] text-purple-700">
                                Free AI Readiness Test
                            </div>

                            <h2 className="mx-auto max-w-xl text-3xl font-black leading-tight text-[#21172f] sm:text-4xl">
                                How AI-Ready Are You?
                            </h2>

                            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                                Take a quick AI skills test, discover your current
                                level and get courses recommended specifically for
                                your goals.
                            </p>

                            <div className="mx-auto mt-7 grid max-w-lg grid-cols-3 gap-2 sm:gap-3">

                                <div className="rounded-2xl bg-purple-50 p-3">
                                    <div className="text-xl">⏱️</div>
                                    <p className="mt-1 text-xs font-bold text-[#21172f]">
                                        1 Minute
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-lime-50 p-3">
                                    <div className="text-xl">🎯</div>
                                    <p className="mt-1 text-xs font-bold text-[#21172f]">
                                        AI Score
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-pink-50 p-3">
                                    <div className="text-xl">🚀</div>
                                    <p className="mt-1 text-xs font-bold text-[#21172f]">
                                        Course Match
                                    </p>
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() => setScreen("questions")}
                                className="mt-8 inline-flex min-h-14 w-full max-w-sm items-center justify-center rounded-2xl bg-[#8B5CF6] px-8 py-4 text-base font-extrabold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-purple-700"
                            >
                                Start My AI Test
                                <span className="ml-2">→</span>
                            </button>

                            <p className="mt-4 text-xs text-slate-400">
                                7 quick questions • Personalized result
                            </p>
                        </div>
                    )}

                    {/* QUESTIONS */}

                    {screen === "questions" && currentQuestion && (
                        <div>

                            <div className="pr-12">

                                <div className="flex items-center justify-between gap-4">

                                    <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-purple-600">
                                        AI Readiness Test
                                    </span>

                                    <span className="text-xs font-bold text-slate-400">
                                        {questionIndex + 1} / {questions.length}
                                    </span>

                                </div>

                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-purple-100">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#A3E635] transition-all duration-300"
                                        style={{
                                            width: `${progress}%`,
                                        }}
                                    />
                                </div>

                            </div>

                            <div className="mt-8">

                                <h2 className="text-2xl font-black leading-tight text-[#21172f] sm:text-3xl">
                                    {currentQuestion.title}
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                                    {currentQuestion.subtitle}
                                </p>

                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">

                                {currentQuestion.options.map((option) => {
                                    const selected =
                                        currentQuestion.type === "multiple"
                                            ? answers.toolsUsed.includes(option.value)
                                            : answers[currentQuestion.key] ===
                                            option.value;

                                    return (
                                        <button
                                            type="button"
                                            key={option.value}
                                            onClick={() =>
                                                currentQuestion.type === "multiple"
                                                    ? toggleMultipleOption(option.value)
                                                    : selectSingleOption(option.value)
                                            }
                                            className={`relative flex min-h-[92px] items-center gap-4 rounded-[20px] border-2 p-4 text-left transition ${selected
                                                    ? "border-purple-500 bg-purple-50 shadow-sm"
                                                    : "border-slate-100 bg-white hover:border-purple-200 hover:bg-purple-50/40"
                                                }`}
                                        >

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 text-2xl">
                                                {option.icon}
                                            </div>

                                            <div>
                                                <div className="font-extrabold text-[#21172f]">
                                                    {option.label}
                                                </div>

                                                {option.text && (
                                                    <div className="mt-1 text-xs leading-5 text-slate-500">
                                                        {option.text}
                                                    </div>
                                                )}
                                            </div>

                                            {selected && (
                                                <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-black text-white">
                                                    ✓
                                                </div>
                                            )}

                                        </button>
                                    );
                                })}

                            </div>

                            <div className="mt-8 flex items-center justify-between gap-3">

                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="rounded-xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-100"
                                >
                                    ← Back
                                </button>

                                <button
                                    type="button"
                                    disabled={!questionHasAnswer()}
                                    onClick={nextQuestion}
                                    className="min-w-32 rounded-2xl bg-[#8B5CF6] px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-purple-100 transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {questionIndex === questions.length - 1
                                        ? "See My Result →"
                                        : "Next →"}
                                </button>

                            </div>

                        </div>
                    )}

                    {/* EMAIL / LEAD SCREEN */}

                    {screen === "lead" && (
                        <div className="py-3 sm:py-6">

                            <button
                                type="button"
                                onClick={goBack}
                                className="mb-6 text-sm font-bold text-slate-500 hover:text-purple-600"
                            >
                                ← Back
                            </button>

                            <div className="mx-auto max-w-lg text-center">

                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-100 text-3xl">
                                    🎯
                                </div>

                                <div className="mt-5 inline-flex rounded-full bg-lime-100 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-lime-800">
                                    Assessment Complete
                                </div>

                                <h2 className="mt-4 text-3xl font-black text-[#21172f]">
                                    Your AI Level Is Ready
                                </h2>

                                <p className="mt-3 leading-7 text-slate-600">
                                    Enter your email to unlock your AI score,
                                    current level and personalized course recommendations.
                                </p>

                            </div>

                            <form
                                onSubmit={submitAssessment}
                                className="mx-auto mt-7 max-w-lg"
                            >

                                <label className="block text-sm font-bold text-[#21172f]">
                                    Your Name
                                    <span className="ml-1 font-normal text-slate-400">
                                        (optional)
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="Enter your name"
                                    className="mt-2 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 text-[#21172f] outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:bg-white"
                                />

                                <label className="mt-5 block text-sm font-bold text-[#21172f]">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="you@example.com"
                                    className="mt-2 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 text-[#21172f] outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:bg-white"
                                />

                                {error && (
                                    <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#8B5CF6] px-6 py-4 font-extrabold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-700 disabled:cursor-wait disabled:opacity-60"
                                >
                                    {submitting
                                        ? "Calculating Your AI Level..."
                                        : "Show My AI Score & Courses →"}
                                </button>

                                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                                    Your answers help us personalize your recommendations.
                                </p>

                            </form>

                        </div>
                    )}

                    {/* RESULT */}

                    {screen === "result" && result && (
                        <div className="py-3 sm:py-5">

                            <div className="text-center">

                                <div className="mx-auto flex h-24 w-24 flex-col items-center justify-center rounded-full bg-gradient-to-br from-purple-100 via-pink-100 to-lime-100 shadow-sm">
                                    <span className="text-3xl font-black text-purple-700">
                                        {result.score}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        / 100
                                    </span>
                                </div>

                                <div className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-purple-600">
                                    Your AI Level
                                </div>

                                <h2 className="mt-2 text-3xl font-black text-[#21172f] sm:text-4xl">
                                    {result.level}
                                </h2>

                                <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
                                    Based on your experience, interests and goals,
                                    these courses are a strong match for your next step.
                                </p>

                            </div>

                            <div className="mt-8">

                                <div className="mb-4 flex items-center gap-2">
                                    <span className="text-xl">🚀</span>
                                    <h3 className="text-lg font-black text-[#21172f]">
                                        Recommended For You
                                    </h3>
                                </div>

                                <div className="space-y-3">

                                    {result.recommendedCourses?.map(
                                        (course, index) => (
                                            <div
                                                key={course.id}
                                                className="rounded-[20px] border border-purple-100 bg-gradient-to-r from-white to-purple-50/60 p-4 sm:p-5"
                                            >

                                                <div className="flex items-start gap-4">

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#A3E635] text-sm font-black text-[#21172f]">
                                                        {index + 1}
                                                    </div>

                                                    <div className="min-w-0 flex-1">

                                                        <h4 className="font-extrabold text-[#21172f]">
                                                            {course.title}
                                                        </h4>

                                                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                                                            {course.duration && (
                                                                <span>⏱ {course.duration}</span>
                                                            )}

                                                            {course.level && (
                                                                <span>🎯 {course.level}</span>
                                                            )}
                                                        </div>

                                                        {course.description && (
                                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                                                                {course.description}
                                                            </p>
                                                        )}

                                                        <Link
                                                            href={`/courses/${course.slug}`}
                                                            onClick={() => setIsOpen(false)}
                                                            className="mt-3 inline-flex text-sm font-extrabold text-purple-600 hover:text-purple-800"
                                                        >
                                                            View Course →
                                                        </Link>

                                                    </div>

                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="mt-7 w-full rounded-2xl border-2 border-purple-100 px-6 py-3.5 text-sm font-extrabold text-purple-700 transition hover:bg-purple-50"
                            >
                                Continue Exploring Website
                            </button>

                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}