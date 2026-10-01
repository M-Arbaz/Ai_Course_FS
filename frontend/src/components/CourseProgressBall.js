"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import api from "@/lib/api";

export default function CourseProgressBall({
    courseSlug,
    courseTitle,
}) {
    const router = useRouter();

    const [viewerState, setViewerState] =
        useState("loading");

    const [progressData, setProgressData] =
        useState(null);

    const [open, setOpen] =
        useState(false);

    const loadProgress =
        useCallback(async () => {
            try {
                setViewerState("loading");

                // =========================
                // CHECK LOGIN
                // =========================

                const meResponse =
                    await fetch(
                        `${api()}/api/auth/me`,
                        {
                            credentials:
                                "include",
                            cache:
                                "no-store",
                        }
                    );

                if (
                    meResponse.status ===
                    401
                ) {
                    setProgressData(
                        null
                    );

                    setViewerState(
                        "guest"
                    );

                    return;
                }

                if (
                    !meResponse.ok
                ) {
                    throw new Error(
                        "Unable to check login."
                    );
                }

                // =========================
                // CHECK ENROLLMENT
                // + LOAD PROGRESS
                // =========================

                const progressResponse =
                    await fetch(
                        `${api()}/api/learning/courses/${encodeURIComponent(
                            courseSlug
                        )}/progress`,
                        {
                            credentials:
                                "include",
                            cache:
                                "no-store",
                        }
                    );

                const data =
                    await progressResponse
                        .json()
                        .catch(
                            () => null
                        );

                if (
                    progressResponse.status ===
                    401
                ) {
                    setProgressData(
                        null
                    );

                    setViewerState(
                        "guest"
                    );

                    return;
                }

                if (
                    progressResponse.status ===
                    403 &&
                    data?.code ===
                    "ENROLLMENT_REQUIRED"
                ) {
                    setProgressData(
                        null
                    );

                    setViewerState(
                        "not_enrolled"
                    );

                    return;
                }

                if (
                    !progressResponse.ok
                ) {
                    throw new Error(
                        data?.message ||
                        "Unable to load progress."
                    );
                }

                setProgressData(data);

                setViewerState(
                    "enrolled"
                );
            } catch (error) {
                console.error(
                    "Course progress ball error:",
                    error
                );

                setViewerState(
                    "error"
                );
            }
        }, [courseSlug]);

    useEffect(() => {
        loadProgress();
    }, [loadProgress]);

    // =========================
    // MODULES
    // =========================

    const modules =
        Array.isArray(
            progressData?.modules
        )
            ? progressData.modules
            : [];

    // =========================
    // AVERAGE MODULE PROGRESS
    // =========================

    const averageProgress =
        useMemo(() => {
            if (
                viewerState !==
                "enrolled" ||
                modules.length === 0
            ) {
                return 0;
            }

            const total =
                modules.reduce(
                    (
                        sum,
                        module
                    ) => {
                        const value =
                            Number(
                                module.progressPercentage
                            ) || 0;

                        return (
                            sum +
                            value
                        );
                    },
                    0
                );

            return Math.round(
                total /
                modules.length
            );
        }, [
            modules,
            viewerState,
        ]);

    const safePercentage =
        Math.max(
            0,
            Math.min(
                100,
                averageProgress
            )
        );

    // =========================
    // BALL CLICK
    // =========================

    function handleBallClick() {
        if (
            viewerState ===
            "loading"
        ) {
            return;
        }

        if (
            viewerState ===
            "guest"
        ) {
            const returnPath =
                `/courses/${courseSlug}`;

            router.push(
                `/login?next=${encodeURIComponent(
                    returnPath
                )}`
            );

            return;
        }

        if (
            viewerState ===
            "not_enrolled"
        ) {
            router.push(
                `/courses/${courseSlug}/enroll`
            );

            return;
        }

        if (
            viewerState ===
            "error"
        ) {
            loadProgress();

            return;
        }

        if (
            viewerState ===
            "enrolled"
        ) {
            setOpen(
                (current) =>
                    !current
            );
        }
    }

    function getStatusLabel(
        status
    ) {
        switch (status) {
            case "completed":
                return "Completed";

            case "in_progress":
                return "In Progress";

            case "available":
                return "Ready";

            case "locked":
                return "Locked";

            case "coming_soon":
                return "Coming Soon";

            default:
                return "";
        }
    }

    function getStatusIcon(
        status
    ) {
        switch (status) {
            case "completed":
                return "✓";

            case "in_progress":
                return "●";

            case "available":
                return "→";

            case "locked":
                return "🔒";

            default:
                return "•";
        }
    }

    const ballText =
        viewerState ===
            "loading"
            ? "..."
            : viewerState ===
                "enrolled"
                ? `${safePercentage}%`
                : viewerState ===
                    "error"
                    ? "!"
                    : "0%";

    return (
        <div className="fixed right-3 top-1/2 z-[70] -translate-y-1/2 sm:right-6">

            {/* =========================
                PROGRESS PANEL
            ========================= */}

            {open &&
                viewerState ===
                "enrolled" && (
                    <div className="absolute right-[calc(100%+14px)] top-1/2 w-[320px] max-w-[calc(100vw-110px)] -translate-y-1/2 overflow-hidden rounded-[26px] border border-purple-100 bg-white shadow-2xl dark:border-white/10 dark:bg-[#17121f]">

                        {/* HEADER */}

                        <div className="border-b border-purple-100 px-5 py-5 dark:border-white/10">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-purple-600 dark:text-purple-400">
                                        Your
                                        Progress
                                    </p>

                                    <h3 className="mt-1 text-lg font-black text-[#21172f] dark:text-white">
                                        {
                                            courseTitle
                                        }
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpen(
                                            false
                                        )
                                    }
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-50 text-sm font-black text-purple-700 transition hover:bg-purple-100 dark:bg-white/10 dark:text-purple-300"
                                    aria-label="Close progress"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="mt-4 flex items-end justify-between">
                                <div>
                                    <span className="text-3xl font-black text-[#21172f] dark:text-white">
                                        {
                                            safePercentage
                                        }
                                        %
                                    </span>

                                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        Overall
                                        progress
                                    </p>
                                </div>

                                <span className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-black text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                                    {
                                        modules.length
                                    }{" "}
                                    Modules
                                </span>
                            </div>
                        </div>

                        {/* MODULES */}

                        <div className="max-h-[360px] space-y-4 overflow-y-auto px-5 py-5">
                            {modules.map(
                                (
                                    module
                                ) => {
                                    const percentage =
                                        Math.max(
                                            0,
                                            Math.min(
                                                100,
                                                Number(
                                                    module.progressPercentage
                                                ) ||
                                                0
                                            )
                                        );

                                    return (
                                        <div
                                            key={
                                                module.id
                                            }
                                        >
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs">
                                                            {getStatusIcon(
                                                                module.status
                                                            )}
                                                        </span>

                                                        <p className="truncate text-sm font-black text-[#21172f] dark:text-white">
                                                            {
                                                                module.name
                                                            }
                                                        </p>
                                                    </div>

                                                    <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                                        {getStatusLabel(
                                                            module.status
                                                        )}
                                                    </p>
                                                </div>

                                                <span className="shrink-0 text-sm font-black text-purple-700 dark:text-purple-300">
                                                    {
                                                        percentage
                                                    }
                                                    %
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-purple-100 dark:bg-white/10">
                                                <div
                                                    className="h-full rounded-full bg-purple-600 transition-all duration-500"
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>

                        {/* CONTINUE */}

                        <div className="border-t border-purple-100 p-4 dark:border-white/10">
                            {progressData
                                ?.progress
                                ?.completed ? (
                                <div className="rounded-2xl bg-lime-100 px-4 py-3 text-center text-sm font-black text-lime-800 dark:bg-lime-500/10 dark:text-lime-300">
                                    ✓ Course
                                    Completed
                                </div>
                            ) : progressData
                                ?.currentLesson
                                ?.path ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            progressData
                                                .currentLesson
                                                .path
                                        )
                                    }
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#A3E635] px-5 py-3.5 text-sm font-black text-[#21172f] transition hover:-translate-y-0.5 hover:shadow-lg"
                                >
                                    Continue
                                    Learning
                                    <span>
                                        →
                                    </span>
                                </button>
                            ) : null}
                        </div>
                    </div>
                )}

            {/* =========================
                LABEL + BALL
            ========================= */}

            <div className="flex flex-col items-center">

                <span className="mb-2 rounded-full border border-purple-100 bg-white/95 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-purple-700 shadow-md backdrop-blur dark:border-white/10 dark:bg-[#21172f]/95 dark:text-purple-300 sm:text-[10px]">
                    Your Progress
                </span>

                <button
                    type="button"
                    onClick={
                        handleBallClick
                    }
                    aria-label="Your course progress"
                    aria-expanded={
                        viewerState ===
                            "enrolled"
                            ? open
                            : undefined
                    }
                    className="group relative flex h-[68px] w-[68px] items-center justify-center rounded-full p-[5px] shadow-xl transition duration-300 hover:scale-105 hover:shadow-2xl sm:h-[78px] sm:w-[78px]"
                    style={{
                        background:
                            viewerState ===
                                "enrolled"
                                ? `conic-gradient(#9333ea ${safePercentage *
                                3.6
                                }deg, #e9d5ff 0deg)`
                                : "linear-gradient(135deg, #9333ea, #c026d3)",
                    }}
                >
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-base font-black text-[#21172f] dark:bg-[#21172f] dark:text-white sm:text-lg">
                        {
                            ballText
                        }
                    </span>

                    {viewerState ===
                        "loading" && (
                            <span className="absolute inset-0 animate-pulse rounded-full border-2 border-purple-300" />
                        )}
                </button>

                {viewerState ===
                    "guest" && (
                        <span className="mt-2 rounded-full bg-[#21172f] px-2.5 py-1 text-[9px] font-bold text-white shadow">
                            Login
                        </span>
                    )}

                {viewerState ===
                    "not_enrolled" && (
                        <span className="mt-2 rounded-full bg-[#A3E635] px-2.5 py-1 text-[9px] font-black text-[#21172f] shadow">
                            Enroll
                        </span>
                    )}
            </div>
        </div>
    );
}