"use client";

import {
    useEffect,
    useState,
} from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";

export default function AccountPage() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [loading, setLoading] =
        useState(true);

    const [loggingOut, setLoggingOut] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        let active = true;

        const loadAccount = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${api()}/api/auth/me`,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                if (!active) return;

                if (
                    response.status === 401
                ) {
                    router.replace("/login");
                    return;
                }

                const data =
                    await response.json();

                if (!response.ok) {
                    setError(
                        data?.message ||
                        "Unable to load your account."
                    );

                    return;
                }

                if (
                    !data?.authenticated ||
                    !data?.user
                ) {
                    router.replace("/login");
                    return;
                }

                setUser(data.user);
            } catch (error) {
                console.error(
                    "Account load error:",
                    error
                );

                if (active) {
                    setError(
                        "Unable to connect to the server."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadAccount();

        return () => {
            active = false;
        };
    }, [router]);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            setError("");

            const response = await fetch(
                `${api()}/api/auth/logout`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                setError(
                    data?.message ||
                    "Unable to logout."
                );

                return;
            }

            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error(
                "Logout error:",
                error
            );

            setError(
                "Unable to logout. Please try again."
            );
        } finally {
            setLoggingOut(false);
        }
    };

    const initial =
        user?.firstName
            ?.charAt(0)
            .toUpperCase() || "U";

    return (
        <>
            <Navbar />

            <main className="min-h-[70vh] overflow-hidden bg-white">
                <section className="relative overflow-hidden border-b border-purple-100">
                    <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-purple-200/60 blur-3xl" />

                    <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-lime-200/60 blur-3xl" />

                    <div className="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-pink-100 blur-3xl" />

                    <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
                        <div className="inline-flex rounded-full border border-purple-100 bg-white px-4 py-2 text-sm font-bold text-purple-600 shadow-sm">
                            My Account
                        </div>

                        <h1 className="mt-5 text-4xl font-black tracking-tight text-[#21172f] md:text-5xl">
                            Welcome back
                            {user?.firstName
                                ? `, ${user.firstName}`
                                : ""}
                            .
                        </h1>

                        <p className="mt-4 max-w-2xl leading-7 text-slate-500">
                            Manage your AI Academy
                            account and profile
                            information.
                        </p>
                    </div>
                </section>

                <section className="py-16">
                    <div className="mx-auto max-w-5xl px-6 lg:px-8">
                        {loading && (
                            <div className="rounded-[30px] border border-purple-100 bg-[#fbfaff] p-10 text-center shadow-sm">
                                <p className="font-bold text-purple-600">
                                    Loading your
                                    account...
                                </p>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                                {error}
                            </div>
                        )}

                        {!loading && user && (
                            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
                                <div className="rounded-[30px] bg-gradient-to-br from-[#ede9fe] via-[#fce7f3] to-[#dbeafe] p-8">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-purple-600 text-4xl font-black text-white shadow-lg shadow-purple-200">
                                        {initial}
                                    </div>

                                    <h2 className="mt-6 text-2xl font-black text-[#21172f]">
                                        {user.firstName}{" "}
                                        {user.lastName}
                                    </h2>

                                    <p className="mt-2 break-all text-sm font-medium text-slate-500">
                                        {user.email}
                                    </p>

                                    <div className="mt-5">
                                        {user.emailVerified ? (
                                            <span className="inline-flex rounded-full bg-[#a3e635] px-4 py-2 text-xs font-black text-[#304500]">
                                                ✓ Email Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex rounded-full bg-yellow-100 px-4 py-2 text-xs font-black text-yellow-700">
                                                Email Not Verified
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-[30px] border border-purple-100 bg-white p-7 shadow-xl shadow-purple-100/40 md:p-9">
                                    <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-500">
                                        Profile Information
                                    </p>

                                    <h2 className="mt-3 text-3xl font-black text-[#21172f]">
                                        Account Details
                                    </h2>

                                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                                        <div className="rounded-2xl bg-[#f8f5ff] p-5">
                                            <p className="text-xs font-black uppercase tracking-wider text-purple-500">
                                                First Name
                                            </p>

                                            <p className="mt-2 font-bold text-[#21172f]">
                                                {user.firstName ||
                                                    "—"}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-[#efffd5] p-5">
                                            <p className="text-xs font-black uppercase tracking-wider text-[#719b18]">
                                                Last Name
                                            </p>

                                            <p className="mt-2 font-bold text-[#21172f]">
                                                {user.lastName ||
                                                    "—"}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-[#edf6ff] p-5 sm:col-span-2">
                                            <p className="text-xs font-black uppercase tracking-wider text-blue-500">
                                                Email Address
                                            </p>

                                            <p className="mt-2 break-all font-bold text-[#21172f]">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 border-t border-purple-100 pt-7">
                                        <button
                                            type="button"
                                            onClick={
                                                handleLogout
                                            }
                                            disabled={
                                                loggingOut
                                            }
                                            className="rounded-2xl bg-purple-600 px-6 py-3 font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {loggingOut
                                                ? "Signing Out..."
                                                : "Logout"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}