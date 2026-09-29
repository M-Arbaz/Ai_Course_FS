"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function UserLogin() {
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let active = true;

        const checkUser = async () => {
            try {
                const response = await fetch(
                    `${api()}/api/auth/me`,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                if (!active) return;

                if (!response.ok) {
                    setUser(null);
                    return;
                }

                const data = await response.json();

                if (
                    data?.authenticated &&
                    data?.user
                ) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error(
                    "Navbar auth check error:",
                    error
                );

                if (active) {
                    setUser(null);
                }
            } finally {
                if (active) {
                    setChecking(false);
                }
            }
        };

        checkUser();

        return () => {
            active = false;
        };
    }, []);

    if (checking) {
        return (
            <span className="inline-flex items-center">
                ...
            </span>
        );
    }

    if (!user) {
        return (
            <Link href="/login">
                Login / Signup
            </Link>
        );
    }

    const initial =
        user.firstName
            ?.charAt(0)
            .toUpperCase() || "U";

    return (
        <Link
            href="/account"
            className="inline-flex items-center gap-2"
        >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-xs font-black text-purple-700">
                {initial}
            </span>

            <span>
                {user.firstName || "Account"}
            </span>
        </Link>
    );
}