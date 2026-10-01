"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import api from "@/lib/api";

export default function CourseContinueButton({
    courseSlug,
}) {
    const router = useRouter();

    const [loading, setLoading] =
        useState(false);

    async function handleContinue() {
        if (loading) {
            return;
        }

        try {
            setLoading(true);

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
                meResponse.status === 401
            ) {
                router.push(
                    `/login?next=${encodeURIComponent(
                        `/courses/${courseSlug}`
                    )}`
                );

                return;
            }

            if (!meResponse.ok) {
                throw new Error(
                    "Unable to check login."
                );
            }

            // =========================
            // CHECK ENROLLMENT
            // + GET CURRENT LESSON
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
                    .catch(() => null);

            if (
                progressResponse.status ===
                403 &&
                data?.code ===
                "ENROLLMENT_REQUIRED"
            ) {
                router.push(
                    `/courses/${courseSlug}/enroll`
                );

                return;
            }

            if (
                progressResponse.status ===
                401
            ) {
                router.push(
                    `/login?next=${encodeURIComponent(
                        `/courses/${courseSlug}`
                    )}`
                );

                return;
            }

            if (!progressResponse.ok) {
                throw new Error(
                    data?.message ||
                    "Unable to load course progress."
                );
            }

            // =========================
            // CONTINUE CURRENT LESSON
            // =========================

            if (
                data?.currentLesson?.path
            ) {
                router.push(
                    data.currentLesson.path
                );

                return;
            }

            // =========================
            // COURSE ALREADY COMPLETE
            // =========================

            if (
                data?.progress?.completed
            ) {
                router.push(
                    `/courses/${courseSlug}#curriculum`
                );

                return;
            }

            // fallback
            router.push(
                `/courses/${courseSlug}#curriculum`
            );
        } catch (error) {
            console.error(
                "Continue learning error:",
                error
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleContinue}
            disabled={loading}
            className="rounded-full bg-[#A3E635] px-7 py-4 text-sm font-black text-[#21172f] transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-wait disabled:opacity-70"
        >
            {loading
                ? "Loading..."
                : "Continue Learning →"}
        </button>
    );
}