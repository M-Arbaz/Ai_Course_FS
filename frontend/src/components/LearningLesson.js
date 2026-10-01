"use client";

import Link from "next/link";
import {
    ArrowLeft,
    BookOpen,
    Check,
    ChevronLeft,
    ChevronRight,
    Circle,
    LockKeyhole,
    Play,
    RotateCcw,
    Trophy,
} from "lucide-react";
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LearningLesson({
    courseSlug,
    toolSlug,
    lessonSlug,
}) {
    const router = useRouter();

    const [moduleData, setModuleData] =
        useState(null);

    const [lessonData, setLessonData] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [lockedData, setLockedData] =
        useState(null);

    // ==========================================
    // QUIZ STATE
    // ==========================================

    const [quizOpen, setQuizOpen] =
        useState(false);

    const [quizLoading, setQuizLoading] =
        useState(false);

    const [quiz, setQuiz] =
        useState(null);

    const [answers, setAnswers] =
        useState({});

    const [quizSubmitting, setQuizSubmitting] =
        useState(false);

    const [quizResult, setQuizResult] =
        useState(null);

    const [quizError, setQuizError] =
        useState("");

    const currentPath =
        `/courses/${courseSlug}/${toolSlug}/${lessonSlug}`;

    // ==========================================
    // LOAD LEARNING DATA
    // ==========================================

    const loadLearningData = useCallback(
        async () => {
            try {
                setLoading(true);
                setError("");
                setLockedData(null);

                const moduleResponse =
                    await fetch(
                        `${api()}/api/learning/courses/${encodeURIComponent(
                            courseSlug
                        )}/tools/${encodeURIComponent(
                            toolSlug
                        )}`,
                        {
                            credentials: "include",
                            cache: "no-store",
                        }
                    );

                if (
                    moduleResponse.status ===
                    401
                ) {
                    router.replace(
                        `/login?next=${encodeURIComponent(
                            currentPath
                        )}`
                    );

                    return;
                }

                const moduleJson =
                    await moduleResponse
                        .json()
                        .catch(() => ({}));

                if (
                    moduleResponse.status ===
                    403 &&
                    moduleJson?.code ===
                    "COURSE_ENROLLMENT_REQUIRED"
                ) {
                    router.replace(
                        `/courses/${courseSlug}/enroll`
                    );

                    return;
                }

                if (!moduleResponse.ok) {
                    setError(
                        moduleJson?.message ||
                        "Unable to load this learning module."
                    );

                    return;
                }

                setModuleData(moduleJson);

                const lessonResponse =
                    await fetch(
                        `${api()}/api/learning/courses/${encodeURIComponent(
                            courseSlug
                        )}/tools/${encodeURIComponent(
                            toolSlug
                        )}/lessons/${encodeURIComponent(
                            lessonSlug
                        )}`,
                        {
                            credentials: "include",
                            cache: "no-store",
                        }
                    );

                if (
                    lessonResponse.status ===
                    401
                ) {
                    router.replace(
                        `/login?next=${encodeURIComponent(
                            currentPath
                        )}`
                    );

                    return;
                }

                const lessonJson =
                    await lessonResponse
                        .json()
                        .catch(() => ({}));

                if (
                    lessonResponse.status ===
                    403 &&
                    lessonJson?.code ===
                    "COURSE_ENROLLMENT_REQUIRED"
                ) {
                    router.replace(
                        `/courses/${courseSlug}/enroll`
                    );

                    return;
                }

                if (
                    lessonResponse.status ===
                    403 &&
                    lessonJson?.code ===
                    "LESSON_LOCKED"
                ) {
                    setLockedData(lessonJson);
                    setLessonData(null);
                    return;
                }

                if (!lessonResponse.ok) {
                    setError(
                        lessonJson?.message ||
                        "Unable to load this lesson."
                    );

                    return;
                }

                setLessonData(lessonJson);
            } catch (error) {
                console.error(
                    "Learning page error:",
                    error
                );

                setError(
                    "Unable to load this lesson right now."
                );
            } finally {
                setLoading(false);
            }
        },
        [
            courseSlug,
            toolSlug,
            lessonSlug,
            currentPath,
            router,
        ]
    );

    useEffect(() => {
        loadLearningData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseSlug, toolSlug, lessonSlug]);

    // ==========================================
    // CURRENT LESSON / NAVIGATION
    // ==========================================

    const lessons =
        moduleData?.module?.lessons || [];

    const currentLessonIndex =
        useMemo(
            () =>
                lessons.findIndex(
                    (lesson) =>
                        lesson.slug ===
                        lessonSlug
                ),
            [lessons, lessonSlug]
        );

    const previousLesson =
        currentLessonIndex > 0
            ? lessons[
            currentLessonIndex - 1
            ]
            : null;

    const nextLesson =
        currentLessonIndex >= 0 &&
            currentLessonIndex <
            lessons.length - 1
            ? lessons[
            currentLessonIndex + 1
            ]
            : null;

    const currentLessonStatus =
        currentLessonIndex >= 0
            ? lessons[currentLessonIndex]
                ?.status
            : null;

    // ==========================================
    // QUIZ LOAD
    // ==========================================

    const handleOpenQuiz = async () => {
        try {
            setQuizOpen(true);
            setQuizLoading(true);
            setQuizError("");
            setQuizResult(null);
            setAnswers({});

            const response = await fetch(
                `${api()}/api/learning/courses/${encodeURIComponent(
                    courseSlug
                )}/tools/${encodeURIComponent(
                    toolSlug
                )}/lessons/${encodeURIComponent(
                    lessonSlug
                )}/quiz`,
                {
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data = await response
                .json()
                .catch(() => ({}));

            if (response.status === 401) {
                router.replace(
                    `/login?next=${encodeURIComponent(
                        currentPath
                    )}`
                );
                return;
            }

            if (!response.ok) {
                setQuizError(
                    data?.message ||
                    "Unable to load this quiz."
                );
                return;
            }

            setQuiz(data.quiz);
        } catch (error) {
            console.error(
                "Quiz load error:",
                error
            );

            setQuizError(
                "Unable to load this quiz."
            );
        } finally {
            setQuizLoading(false);
        }
    };

    // ==========================================
    // QUIZ ANSWER
    // ==========================================

    const handleAnswer = (
        questionId,
        optionId
    ) => {
        if (quizResult) {
            return;
        }

        setAnswers((current) => ({
            ...current,
            [questionId]: optionId,
        }));
    };

    // ==========================================
    // QUIZ SUBMIT
    // ==========================================

    const handleQuizSubmit = async (
        event
    ) => {
        event.preventDefault();

        if (
            !quiz ||
            quizSubmitting
        ) {
            return;
        }

        if (
            Object.keys(answers).length !==
            quiz.questions.length
        ) {
            setQuizError(
                "Please answer every question before submitting."
            );
            return;
        }

        try {
            setQuizSubmitting(true);
            setQuizError("");

            const submittedAnswers =
                quiz.questions.map(
                    (question) => ({
                        questionId:
                            question.id,
                        optionId:
                            answers[
                            question.id
                            ],
                    })
                );

            const response = await fetch(
                `${api()}/api/learning/courses/${encodeURIComponent(
                    courseSlug
                )}/tools/${encodeURIComponent(
                    toolSlug
                )}/lessons/${encodeURIComponent(
                    lessonSlug
                )}/quiz/submit`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        answers:
                            submittedAnswers,
                    }),
                }
            );

            const data = await response
                .json()
                .catch(() => ({}));

            if (!response.ok) {
                setQuizError(
                    data?.message ||
                    "Unable to submit this quiz."
                );
                return;
            }

            setQuizResult(data);

            if (data?.result?.passed) {
                await loadLearningData();
            }
        } catch (error) {
            console.error(
                "Quiz submit error:",
                error
            );

            setQuizError(
                "Unable to submit this quiz."
            );
        } finally {
            setQuizSubmitting(false);
        }
    };

    const handleRetryQuiz = () => {
        setAnswers({});
        setQuizResult(null);
        setQuizError("");
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <main className="min-h-[75vh] bg-[#fbfaff] px-4 py-16 dark:bg-[#17111f]">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-[30px] border border-purple-100 bg-white p-10 text-center shadow-sm dark:border-purple-900/40 dark:bg-[#21172f]">
                        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />

                        <p className="mt-4 font-black text-purple-600 dark:text-purple-300">
                            Loading your lesson...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    // ==========================================
    // GENERAL ERROR
    // ==========================================

    if (error) {
        return (
            <main className="min-h-[75vh] bg-[#fbfaff] px-4 py-16 dark:bg-[#17111f]">
                <div className="mx-auto max-w-2xl rounded-[30px] border border-red-100 bg-white p-10 text-center shadow-lg dark:border-red-900/40 dark:bg-[#21172f]">
                    <h1 className="text-2xl font-black">
                        Unable to load lesson
                    </h1>

                    <p className="mt-3 text-slate-500 dark:text-slate-300">
                        {error}
                    </p>

                    <Link
                        href={`/courses/${courseSlug}`}
                        className="mt-6 inline-flex rounded-full bg-purple-600 px-6 py-3 font-black text-white"
                    >
                        Back to Course
                    </Link>
                </div>
            </main>
        );
    }

    // ==========================================
    // LOCKED DIRECT URL
    // ==========================================

    if (lockedData) {
        const required =
            lockedData.requiredPreviousLesson;

        return (
            <main className="min-h-[75vh] bg-[#fbfaff] px-4 py-16 dark:bg-[#17111f]">
                <div className="mx-auto max-w-2xl rounded-[32px] border border-purple-100 bg-white p-10 text-center shadow-xl dark:border-purple-900/40 dark:bg-[#21172f]">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
                        <LockKeyhole
                            size={28}
                        />
                    </div>

                    <h1 className="mt-6 text-3xl font-black">
                        Lesson Locked
                    </h1>

                    <p className="mt-3 leading-7 text-slate-500 dark:text-slate-300">
                        {lockedData.message}
                    </p>

                    {required && (
                        <Link
                            href={`/courses/${courseSlug}/${required.toolSlug}/${required.lessonSlug}`}
                            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#A3E635] px-7 py-3.5 font-black text-[#21172f]"
                        >
                            <ChevronLeft
                                size={18}
                            />
                            Continue{" "}
                            {required.title}
                        </Link>
                    )}
                </div>
            </main>
        );
    }

    const course =
        lessonData?.course;

    const tool =
        lessonData?.tool;

    const lesson =
        lessonData?.lesson;

    const module = moduleData?.module;

    if (
        !course ||
        !tool ||
        !lesson ||
        !module
    ) {
        return null;
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <main className="min-h-screen bg-[#fbfaff] text-[#21172f] dark:bg-[#17111f] dark:text-white">
            {/* TOP COURSE BAR */}
            <section className="border-b border-purple-100 bg-white dark:border-purple-900/40 dark:bg-[#1d1528]">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
                    <div>
                        <Link
                            href={`/courses/${courseSlug}`}
                            className="inline-flex items-center gap-2 text-sm font-black text-purple-600 transition hover:gap-3 dark:text-purple-300"
                        >
                            <ArrowLeft
                                size={16}
                            />
                            Back to{" "}
                            {course.title}
                        </Link>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="font-black">
                                {tool.name}
                            </span>

                            <span className="text-slate-300 dark:text-slate-600">
                                /
                            </span>

                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                {lesson.title}
                            </span>
                        </div>
                    </div>

                    <div className="min-w-[190px]">
                        <div className="flex items-center justify-between gap-4 text-xs font-black">
                            <span>
                                Module Progress
                            </span>

                            <span className="text-purple-600 dark:text-purple-300">
                                {
                                    module.progressPercentage
                                }
                                %
                            </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-purple-100 dark:bg-purple-950/60">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 transition-all duration-500"
                                style={{
                                    width: `${module.progressPercentage}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
                {/* ==================================
                    LESSON SIDEBAR
                ================================== */}

                <aside className="self-start rounded-[28px] border border-purple-100 bg-white p-5 shadow-sm dark:border-purple-900/40 dark:bg-[#21172f] lg:sticky lg:top-28">
                    <div className="rounded-[22px] bg-gradient-to-br from-purple-600 to-fuchsia-500 p-5 text-white">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-100">
                            Module
                        </p>

                        <h2 className="mt-2 text-2xl font-black">
                            {module.name}
                        </h2>

                        <div className="mt-5 flex items-center justify-between text-sm font-bold">
                            <span>
                                {
                                    module.completedLessons
                                }{" "}
                                of{" "}
                                {
                                    module.totalLessons
                                }{" "}
                                lessons
                            </span>

                            <span>
                                {
                                    module.progressPercentage
                                }
                                %
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 space-y-2">
                        {lessons.map(
                            (
                                sidebarLesson,
                                index
                            ) => {
                                const isCurrent =
                                    sidebarLesson.slug ===
                                    lessonSlug;

                                const isLocked =
                                    sidebarLesson.status ===
                                    "locked";

                                const isCompleted =
                                    sidebarLesson.status ===
                                    "completed";

                                const itemClasses = `flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${isCurrent
                                    ? "border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-950/40"
                                    : isLocked
                                        ? "cursor-not-allowed border-transparent bg-slate-50 opacity-60 dark:bg-white/5"
                                        : "border-transparent hover:border-purple-100 hover:bg-purple-50/70 dark:hover:border-purple-900/50 dark:hover:bg-white/5"
                                    }`;

                                const content =
                                    <>
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isCompleted
                                                ? "bg-lime-300 text-[#21172f]"
                                                : isCurrent
                                                    ? "bg-purple-600 text-white"
                                                    : isLocked
                                                        ? "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                                                        : "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300"
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <Check
                                                    size={
                                                        17
                                                    }
                                                    strokeWidth={
                                                        3
                                                    }
                                                />
                                            ) : isLocked ? (
                                                <LockKeyhole
                                                    size={
                                                        16
                                                    }
                                                />
                                            ) : isCurrent ? (
                                                <Play
                                                    size={
                                                        16
                                                    }
                                                    fill="currentColor"
                                                />
                                            ) : (
                                                <Circle
                                                    size={
                                                        15
                                                    }
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-black uppercase tracking-wider text-purple-500">
                                                Lesson{" "}
                                                {index +
                                                    1}
                                            </p>

                                            <p className="mt-1 text-sm font-black leading-5">
                                                {
                                                    sidebarLesson.title
                                                }
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-slate-400">
                                                {isCompleted
                                                    ? "Completed"
                                                    : sidebarLesson.status ===
                                                        "in_progress"
                                                        ? "In Progress"
                                                        : sidebarLesson.status ===
                                                            "available"
                                                            ? "Available"
                                                            : "Locked"}
                                            </p>
                                        </div>
                                    </>;

                                if (isLocked) {
                                    return (
                                        <div
                                            key={
                                                sidebarLesson.id
                                            }
                                            className={
                                                itemClasses
                                            }
                                        >
                                            {
                                                content
                                            }
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={
                                            sidebarLesson.id
                                        }
                                        href={`/courses/${courseSlug}/${toolSlug}/${sidebarLesson.slug}`}
                                        className={
                                            itemClasses
                                        }
                                    >
                                        {
                                            content
                                        }
                                    </Link>
                                );
                            }
                        )}
                    </div>
                </aside>

                {/* ==================================
                    MAIN LESSON
                ================================== */}

                <div className="min-w-0">
                    <article className="overflow-hidden rounded-[30px] border border-purple-100 bg-white shadow-sm dark:border-purple-900/40 dark:bg-[#21172f]">
                        {/* LESSON HEADER */}

                        <div className="border-b border-purple-100 px-6 py-7 dark:border-purple-900/40 sm:px-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
                                    Lesson{" "}
                                    {lesson.sortOrder}
                                </span>

                                {currentLessonStatus ===
                                    "completed" && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1.5 text-xs font-black text-lime-800 dark:bg-lime-900/30 dark:text-lime-300">
                                            <Check
                                                size={14}
                                                strokeWidth={
                                                    3
                                                }
                                            />
                                            Completed
                                        </span>
                                    )}
                            </div>

                            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                                {lesson.title}
                            </h1>

                            {lesson.summary && (
                                <p className="mt-4 max-w-3xl leading-7 text-slate-500 dark:text-slate-300">
                                    {
                                        lesson.summary
                                    }
                                </p>
                            )}
                        </div>

                        {/* VIDEO */}

                        <div className="p-6 sm:p-8">
                            {lesson.videoUrl ? (
                                <div className="overflow-hidden rounded-[26px] bg-black">
                                    <video
                                        src={
                                            lesson.videoUrl
                                        }
                                        controls
                                        className="aspect-video w-full"
                                    />
                                </div>
                            ) : (
                                <div className="flex aspect-video w-full flex-col items-center justify-center rounded-[26px] border border-dashed border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-6 text-center dark:border-purple-800 dark:from-[#2d203b] dark:via-[#291c31] dark:to-[#192334]">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-300/30">
                                        <Play
                                            size={26}
                                            fill="currentColor"
                                        />
                                    </div>

                                    <h2 className="mt-5 text-xl font-black">
                                        Lesson Video
                                    </h2>

                                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-300">
                                        Video will
                                        appear here
                                        once it is
                                        added to this
                                        lesson.
                                    </p>
                                </div>
                            )}

                            {/* CONTENT */}

                            <div className="mt-8 rounded-[24px] bg-[#f8f5ff] p-6 dark:bg-[#2b2038] sm:p-8">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white">
                                        <BookOpen
                                            size={19}
                                        />
                                    </div>

                                    <h2 className="text-xl font-black">
                                        Lesson
                                        Notes
                                    </h2>
                                </div>

                                {lesson.content ? (
                                    <div className="mt-5 whitespace-pre-wrap leading-8 text-slate-700 dark:text-slate-200">
                                        {
                                            lesson.content
                                        }
                                    </div>
                                ) : (
                                    <p className="mt-5 leading-7 text-slate-500 dark:text-slate-300">
                                        Lesson
                                        content and
                                        supporting
                                        notes will be
                                        added here.
                                    </p>
                                )}
                            </div>

                            {/* QUIZ CTA */}

                            {lessonData.quiz && (
                                <div className="mt-8 rounded-[26px] border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-lime-50 p-6 dark:border-purple-900/50 dark:from-[#2a1c38] dark:via-[#21172f] dark:to-[#24301c] sm:p-8">
                                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-500">
                                                Knowledge
                                                Check
                                            </p>

                                            <h2 className="mt-2 text-2xl font-black">
                                                {
                                                    lessonData
                                                        .quiz
                                                        .title
                                                }
                                            </h2>

                                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
                                                Pass
                                                with{" "}
                                                <strong>
                                                    {
                                                        lessonData
                                                            .quiz
                                                            .passPercentage
                                                    }
                                                    %
                                                </strong>{" "}
                                                or
                                                higher
                                                to
                                                unlock
                                                the
                                                next
                                                lesson.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={
                                                handleOpenQuiz
                                            }
                                            className="shrink-0 rounded-full bg-[#A3E635] px-7 py-3.5 font-black text-[#21172f] transition hover:-translate-y-0.5 hover:shadow-lg"
                                        >
                                            {currentLessonStatus ===
                                                "completed"
                                                ? "Retake Quiz"
                                                : "Take Quiz"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </article>

                    {/* ==================================
                        QUIZ PANEL
                    ================================== */}

                    {quizOpen && (
                        <section className="mt-7 rounded-[30px] border border-purple-100 bg-white p-6 shadow-sm dark:border-purple-900/40 dark:bg-[#21172f] sm:p-8">
                            {quizLoading ? (
                                <div className="py-10 text-center">
                                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />

                                    <p className="mt-4 font-bold text-slate-500 dark:text-slate-300">
                                        Loading
                                        quiz...
                                    </p>
                                </div>
                            ) : quizError &&
                                !quiz ? (
                                <div className="rounded-2xl bg-red-50 p-5 font-bold text-red-600 dark:bg-red-950/30 dark:text-red-300">
                                    {
                                        quizError
                                    }
                                </div>
                            ) : quiz ? (
                                <>
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-500">
                                                Lesson
                                                Quiz
                                            </p>

                                            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                                                {
                                                    quiz.title
                                                }
                                            </h2>

                                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                                                {
                                                    quiz.questionCount
                                                }{" "}
                                                questions
                                                · Pass
                                                mark{" "}
                                                {
                                                    quiz.passPercentage
                                                }
                                                %
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuizOpen(
                                                    false
                                                )
                                            }
                                            className="rounded-full border border-purple-200 px-4 py-2 text-sm font-black text-purple-600 transition hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/40"
                                        >
                                            Close
                                        </button>
                                    </div>

                                    {quizResult ? (
                                        <div
                                            className={`mt-7 rounded-[26px] p-7 text-center ${quizResult
                                                ?.result
                                                ?.passed
                                                ? "bg-lime-50 dark:bg-lime-950/20"
                                                : "bg-pink-50 dark:bg-pink-950/20"
                                                }`}
                                        >
                                            <div
                                                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${quizResult
                                                    ?.result
                                                    ?.passed
                                                    ? "bg-lime-300 text-[#21172f]"
                                                    : "bg-pink-500 text-white"
                                                    }`}
                                            >
                                                {quizResult
                                                    ?.result
                                                    ?.passed ? (
                                                    <Trophy
                                                        size={
                                                            28
                                                        }
                                                    />
                                                ) : (
                                                    <RotateCcw
                                                        size={
                                                            26
                                                        }
                                                    />
                                                )}
                                            </div>

                                            <h3 className="mt-5 text-3xl font-black">
                                                {quizResult
                                                    ?.result
                                                    ?.passed
                                                    ? "Quiz Passed!"
                                                    : "Not Passed Yet"}
                                            </h3>

                                            <p className="mt-3 text-lg font-black text-purple-600 dark:text-purple-300">
                                                {
                                                    quizResult
                                                        ?.result
                                                        ?.scorePercentage
                                                }
                                                %
                                            </p>

                                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                                                {
                                                    quizResult
                                                        ?.result
                                                        ?.correctAnswers
                                                }{" "}
                                                of{" "}
                                                {
                                                    quizResult
                                                        ?.result
                                                        ?.totalQuestions
                                                }{" "}
                                                correct
                                            </p>

                                            {quizResult
                                                ?.result
                                                ?.passed ? (
                                                quizResult.nextLesson && (
                                                    <Link
                                                        href={`/courses/${courseSlug}/${quizResult.nextLesson.toolSlug}/${quizResult.nextLesson.lessonSlug}`}
                                                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#A3E635] px-7 py-3.5 font-black text-[#21172f]"
                                                    >
                                                        Continue
                                                        to
                                                        Next
                                                        Lesson
                                                        <ChevronRight
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    </Link>
                                                )
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleRetryQuiz
                                                    }
                                                    className="mt-6 rounded-full bg-purple-600 px-7 py-3.5 font-black text-white transition hover:bg-purple-700"
                                                >
                                                    Try
                                                    Again
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <form
                                            onSubmit={
                                                handleQuizSubmit
                                            }
                                            className="mt-8 space-y-6"
                                        >
                                            {quiz.questions.map(
                                                (
                                                    question,
                                                    questionIndex
                                                ) => (
                                                    <div
                                                        key={
                                                            question.id
                                                        }
                                                        className="rounded-[24px] bg-[#f8f5ff] p-5 dark:bg-[#2b2038] sm:p-6"
                                                    >
                                                        <p className="text-xs font-black uppercase tracking-wider text-purple-500">
                                                            Question{" "}
                                                            {questionIndex +
                                                                1}
                                                        </p>

                                                        <h3 className="mt-2 text-lg font-black leading-7">
                                                            {
                                                                question.question
                                                            }
                                                        </h3>

                                                        <div className="mt-5 grid gap-3">
                                                            {question.options.map(
                                                                (
                                                                    option
                                                                ) => {
                                                                    const selected =
                                                                        Number(
                                                                            answers[
                                                                            question
                                                                                .id
                                                                            ]
                                                                        ) ===
                                                                        Number(
                                                                            option.id
                                                                        );

                                                                    return (
                                                                        <button
                                                                            key={
                                                                                option.id
                                                                            }
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleAnswer(
                                                                                    question.id,
                                                                                    option.id
                                                                                )
                                                                            }
                                                                            className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left font-semibold transition ${selected
                                                                                ? "border-purple-500 bg-purple-100 text-purple-900 dark:border-purple-400 dark:bg-purple-900/40 dark:text-white"
                                                                                : "border-purple-100 bg-white hover:border-purple-300 dark:border-purple-900/50 dark:bg-[#21172f] dark:hover:border-purple-700"
                                                                                }`}
                                                                        >
                                                                            <span
                                                                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected
                                                                                    ? "border-purple-600 bg-purple-600"
                                                                                    : "border-slate-300 dark:border-slate-600"
                                                                                    }`}
                                                                            >
                                                                                {selected && (
                                                                                    <span className="h-2 w-2 rounded-full bg-white" />
                                                                                )}
                                                                            </span>

                                                                            {
                                                                                option.text
                                                                            }
                                                                        </button>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                            {quizError && (
                                                <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-bold text-red-600 dark:bg-red-950/30 dark:text-red-300">
                                                    {
                                                        quizError
                                                    }
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={
                                                    quizSubmitting
                                                }
                                                className="w-full rounded-2xl bg-purple-600 px-6 py-4 font-black text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {quizSubmitting
                                                    ? "Checking Answers..."
                                                    : "Submit Quiz"}
                                            </button>
                                        </form>
                                    )}
                                </>
                            ) : null}
                        </section>
                    )}

                    {/* ==================================
                        PREVIOUS / NEXT
                    ================================== */}

                    <div className="mt-7 flex flex-col justify-between gap-4 sm:flex-row">
                        {previousLesson ? (
                            <Link
                                href={`/courses/${courseSlug}/${toolSlug}/${previousLesson.slug}`}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-200 bg-white px-5 py-3.5 font-black text-purple-600 transition hover:bg-purple-50 dark:border-purple-800 dark:bg-[#21172f] dark:text-purple-300 dark:hover:bg-purple-950/40"
                            >
                                <ChevronLeft
                                    size={18}
                                />
                                Previous
                                Lesson
                            </Link>
                        ) : (
                            <div />
                        )}

                        {nextLesson ? (
                            nextLesson.status ===
                                "locked" ? (
                                <div className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3.5 font-black text-slate-400 dark:bg-white/5 dark:text-slate-500">
                                    <LockKeyhole
                                        size={17}
                                    />
                                    Next
                                    Lesson
                                    Locked
                                </div>
                            ) : (
                                <Link
                                    href={`/courses/${courseSlug}/${toolSlug}/${nextLesson.slug}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#21172f] px-5 py-3.5 font-black text-white transition hover:-translate-y-0.5 dark:bg-[#A3E635] dark:text-[#21172f]"
                                >
                                    Next
                                    Lesson
                                    <ChevronRight
                                        size={18}
                                    />
                                </Link>
                            )
                        ) : module.completed ? (
                            <div className="inline-flex items-center gap-2 rounded-2xl bg-lime-100 px-5 py-3.5 font-black text-lime-800 dark:bg-lime-950/30 dark:text-lime-300">
                                <Trophy
                                    size={18}
                                />
                                Module
                                Completed
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>
        </main>
    );
}