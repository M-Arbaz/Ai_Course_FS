"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "ai-academy-theme";

export default function ThemeToggle() {
    const [theme, setTheme] = useState("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_KEY);

        // Default theme = light
        const initialTheme = savedTheme === "dark" ? "dark" : "light";

        setTheme(initialTheme);

        document.documentElement.classList.toggle(
            "dark",
            initialTheme === "dark"
        );

        setMounted(true);
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "light" ? "dark" : "light";

        setTheme(nextTheme);

        document.documentElement.classList.toggle(
            "dark",
            nextTheme === "dark"
        );

        localStorage.setItem(THEME_KEY, nextTheme);
    };

    if (!mounted) {
        return (
            <div
                className="h-10 w-[76px] rounded-full border border-slate-200 bg-slate-100"
                aria-hidden="true"
            />
        );
    }

    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={
                isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            title={
                isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            className={`relative flex h-10 w-[76px] shrink-0 items-center rounded-full border p-1 shadow-sm transition-all duration-300 ${isDark
                    ? "border-purple-500/30 bg-[#21172f]"
                    : "border-slate-200 bg-slate-100"
                }`}
        >
            {/* Moving active circle */}
            <span
                className={`absolute top-1 h-8 w-8 rounded-full shadow-md transition-all duration-300 ease-out ${isDark
                        ? "translate-x-[34px] bg-purple-500"
                        : "translate-x-0 bg-white"
                    }`}
            />

            {/* Sun */}
            <span
                className={`relative z-10 flex h-8 w-8 items-center justify-center transition-all duration-300 ${isDark
                        ? "text-slate-500"
                        : "text-amber-500"
                    }`}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-[18px] w-[18px]"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.42 1.42" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                </svg>
            </span>

            {/* Moon */}
            <span
                className={`relative z-10 ml-[2px] flex h-8 w-8 items-center justify-center transition-all duration-300 ${isDark
                        ? "text-white"
                        : "text-slate-400"
                    }`}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-[17px] w-[17px]"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                </svg>
            </span>
        </button>
    );
}