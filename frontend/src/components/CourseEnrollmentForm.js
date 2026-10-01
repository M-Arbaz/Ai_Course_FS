"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CourseEnrollmentForm({
    slug,
}) {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let active = true;

        const loadEnrollmentPage = async () => {
            try {
                setLoading(true);
                setError("");

                const authResponse = await fetch(
                    `${api()}/api/auth/me`,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                if (!active) return;

                if (authResponse.status === 401) {
                    const nextPath =
                        `/courses/${slug}/enroll`;

                    router.replace(
                        `/login?next=${encodeURIComponent(
                            nextPath
                        )}`
                    );

                    return;
                }

                const authData =
                    await authResponse
                        .json()
                        .catch(() => ({}));

                if (
                    !authResponse.ok ||
                    !authData?.authenticated
                ) {
                    setError(
                        authData?.message ||
                        "Unable to verify your account."
                    );
                    return;
                }

                setUser(authData.user);

                const enrollmentResponse =
                    await fetch(
                        `${api()}/api/courses/${encodeURIComponent(
                            slug
                        )}/enrollment`,
                        {
                            method: "GET",
                            credentials: "include",
                            cache: "no-store",
                        }
                    );

                const enrollmentData =
                    await enrollmentResponse
                        .json()
                        .catch(() => ({}));

                if (!active) return;

                if (!enrollmentResponse.ok) {
                    setError(
                        enrollmentData?.message ||
                        "Unable to load enrollment information."
                    );
                    return;
                }

                setCourse(enrollmentData.course);
                setEnrollment(
                    enrollmentData.enrolled
                        ? enrollmentData.enrollment
                        : null
                );
            } catch (error) {
                console.error(
                    "Enrollment page error:",
                    error
                );

                if (active) {
                    setError(
                        "Unable to load enrollment information."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadEnrollmentPage();

        return () => {
            active = false;
        };
    }, [router, slug]);

    const handleEnroll = async (event) => {
        event.preventDefault();

        if (submitting || enrollment) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setMessage("");

            const response = await fetch(
                `${api()}/api/courses/${encodeURIComponent(
                    slug
                )}/enroll`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                }
            );

            const data = await response
                .json()
                .catch(() => ({}));

            if (response.status === 401) {
                router.replace(
                    `/login?next=${encodeURIComponent(
                        `/courses/${slug}/enroll`
                    )}`
                );
                return;
            }

            if (!response.ok) {
                setError(
                    data?.message ||
                    "Unable to complete enrollment."
                );
                return;
            }

            setCourse(
                data?.course || course
            );

            setEnrollment(
                data?.enrollment || {
                    status: "active",
                }
            );

            setMessage(
                data?.alreadyEnrolled
                    ? "You are already enrolled in this course."
                    : "Enrollment completed successfully."
            );
        } catch (error) {
            console.error(
                "Course enrollment error:",
                error
            );

            setError(
                "Unable to complete enrollment. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-2xl rounded-[30px] border border-purple-100 bg-[#fbfaff] p-10 text-center shadow-xl dark:border-purple-900/50 dark:bg-[#21172f]">
                <p className="font-black text-purple-600 dark:text-purple-300">
                    Loading enrollment...
                </p>
            </div>
        );
    }

    if (error && !course) {
        return (
            <div className="mx-auto max-w-2xl rounded-[30px] border border-red-100 bg-red-50 p-8 text-center dark:border-red-900/40 dark:bg-red-950/30">
                <p className="font-bold text-red-600 dark:text-red-300">
                    {error}
                </p>
            </div>
        );
    }

    const fullName = [
        user?.firstName,
        user?.lastName,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <section className="mx-auto max-w-2xl">
            <div className="overflow-hidden rounded-[32px] border border-purple-100 bg-white shadow-xl shadow-purple-100/40 dark:border-purple-900/50 dark:bg-[#21172f] dark:shadow-none">
                <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-500 px-7 py-8 text-white sm:px-9">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-100">
                        Course Enrollment
                    </p>

                    <h1 className="mt-3 text-3xl font-black">
                        {course?.title ||
                            "Enroll in Course"}
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-purple-100">
                        Confirm your details to start
                        learning.
                    </p>
                </div>

                <div className="p-7 sm:p-9">
                    {message && (
                        <div className="mb-6 rounded-2xl bg-green-50 px-5 py-4 text-sm font-bold text-green-700 dark:bg-green-950/30 dark:text-green-300">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-bold text-red-600 dark:bg-red-950/30 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {enrollment ? (
                        <div>
                            <div className="rounded-[24px] bg-[#f8f5ff] p-6 dark:bg-[#2b2038]">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-300 text-xl font-black text-[#21172f]">
                                    ✓
                                </div>

                                <h2 className="mt-5 text-2xl font-black">
                                    You&apos;re enrolled
                                </h2>

                                <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                                    Your enrollment in{" "}
                                    <strong>
                                        {course?.title}
                                    </strong>{" "}
                                    is active.
                                </p>
                            </div>

                            <Link
                                href={`/courses/${slug}#curriculum`}
                                className="mt-6 inline-flex rounded-full bg-[#8B5CF6] px-7 py-3.5 font-black text-[#21172f] transition hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                Go to Course Curriculum →
                            </Link>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleEnroll}
                        >
                            <div className="grid gap-5">
                                <div>
                                    <label className="mb-2 block text-sm font-black">
                                        Student Name
                                    </label>

                                    <input
                                        type="text"
                                        value={fullName}
                                        readOnly
                                        className="w-full cursor-default rounded-2xl border border-purple-100 bg-[#f8f5ff] px-4 py-3 font-semibold outline-none dark:border-purple-900/50 dark:bg-[#2b2038]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-black">
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        value={
                                            user?.email ||
                                            ""
                                        }
                                        readOnly
                                        className="w-full cursor-default rounded-2xl border border-purple-100 bg-[#f8f5ff] px-4 py-3 font-semibold outline-none dark:border-purple-900/50 dark:bg-[#2b2038]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-black">
                                        Course
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            course?.title ||
                                            ""
                                        }
                                        readOnly
                                        className="w-full cursor-default rounded-2xl border border-purple-100 bg-[#f8f5ff] px-4 py-3 font-semibold outline-none dark:border-purple-900/50 dark:bg-[#2b2038]"
                                    />
                                </div>
                            </div>

                            <p className="mt-5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Enrollment is linked
                                securely to your signed-in
                                account.
                            </p>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-7 w-full rounded-2xl bg-purple-600 px-6 py-4 font-black text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting
                                    ? "Enrolling..."
                                    : "Confirm Enrollment"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}