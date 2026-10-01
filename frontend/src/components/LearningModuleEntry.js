"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LearningModuleEntry({
    courseSlug,
    toolSlug,
}) {
    const router = useRouter();

    const [error, setError] =
        useState("");

    useEffect(() => {
        let active = true;

        const loadModule = async () => {
            try {
                const currentPath =
                    `/courses/${courseSlug}/${toolSlug}`;

                const response = await fetch(
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

                if (!active) {
                    return;
                }

                if (response.status === 401) {
                    router.replace(
                        `/login?next=${encodeURIComponent(
                            currentPath
                        )}`
                    );

                    return;
                }

                const data = await response
                    .json()
                    .catch(() => ({}));

                if (
                    response.status === 403 &&
                    data?.code ===
                    "COURSE_ENROLLMENT_REQUIRED"
                ) {
                    router.replace(
                        `/courses/${courseSlug}/enroll`
                    );

                    return;
                }

                if (!response.ok) {
                    setError(
                        data?.message ||
                        "Unable to open this learning module."
                    );

                    return;
                }

                const moduleData =
                    data?.module;

                // Current unlocked/incomplete lesson
                if (
                    moduleData?.currentLesson
                        ?.slug
                ) {
                    router.replace(
                        `/courses/${courseSlug}/${toolSlug}/${moduleData.currentLesson.slug}`
                    );

                    return;
                }

                // Module already completed:
                // open final lesson for review.
                if (
                    moduleData?.completed &&
                    Array.isArray(
                        moduleData.lessons
                    ) &&
                    moduleData.lessons.length > 0
                ) {
                    const lastLesson =
                        moduleData.lessons[
                        moduleData.lessons.length -
                        1
                        ];

                    router.replace(
                        `/courses/${courseSlug}/${toolSlug}/${lastLesson.slug}`
                    );

                    return;
                }

                setError(
                    "No learning lesson is available in this module yet."
                );
            } catch (error) {
                console.error(
                    "Module entry error:",
                    error
                );

                if (active) {
                    setError(
                        "Unable to open this learning module right now."
                    );
                }
            }
        };

        loadModule();

        return () => {
            active = false;
        };
    }, [
        courseSlug,
        toolSlug,
        router,
    ]);

    if (error) {
        return (
            <main className="min-h-[70vh] bg-[#fbfaff] px-4 py-16 dark:bg-[#17111f]">
                <div className="mx-auto max-w-xl rounded-[30px] border border-purple-100 bg-white p-9 text-center shadow-lg dark:border-purple-900/40 dark:bg-[#21172f]">
                    <h1 className="text-2xl font-black text-[#21172f] dark:text-white">
                        Module unavailable
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

    return (
        <main className="min-h-[70vh] bg-[#fbfaff] px-4 py-16 dark:bg-[#17111f]">
            <div className="mx-auto max-w-xl rounded-[30px] border border-purple-100 bg-white p-10 text-center shadow-sm dark:border-purple-900/40 dark:bg-[#21172f]">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />

                <p className="mt-4 font-black text-purple-600 dark:text-purple-300">
                    Opening your lesson...
                </p>
            </div>
        </main>
    );
} 
