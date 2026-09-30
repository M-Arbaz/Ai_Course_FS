"use client";

import { Scale } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_KEY = "ai-academy-theme";
const THEME_EVENT = "ai-academy-theme-change";

export default function ThemeToggle() {
    const [theme, setTheme] = useState("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const syncTheme = () => {
            const currentTheme =
                document.documentElement.classList.contains("dark")
                    ? "dark"
                    : "light";

            setTheme(currentTheme);
        };

        syncTheme();
        setMounted(true);

        window.addEventListener(THEME_EVENT, syncTheme);

        return () => {
            window.removeEventListener(THEME_EVENT, syncTheme);
        };
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "light" ? "dark" : "light";

        document.documentElement.classList.toggle(
            "dark",
            nextTheme === "dark"
        );

        setTheme(nextTheme);

        try {
            localStorage.setItem(THEME_KEY, nextTheme);
        } catch (error) {
            // Theme still works if browser storage is unavailable.
        }

        window.dispatchEvent(new Event(THEME_EVENT));
    };

    if (!mounted) {
        return (
            <div
                className="h-10 w-[76px] shrink-0 rounded-full border border-slate-200 bg-slate-100 dark:border-white/15 dark:bg-[#21172f]"
                aria-hidden="true"
            />
        );
    }

    const isDark = theme === "dark";

    return (
        <button
            style={{ Scale: "0.9" }}
            type="button"
            onClick={toggleTheme}
            aria-label={
                isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            aria-pressed={isDark}
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
            <span
                className={`absolute top-1 h-8 w-8 rounded-full shadow-md transition-transform duration-300 ease-out ${isDark
                    ? "translate-x-[34px] bg-purple-500"
                    : "translate-x-0 bg-white"
                    }`}
            />

            <span
                className={`relative z-10 flex h-8 w-8 items-center justify-center transition-colors duration-300 ${isDark
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
                    aria-hidden="true"
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

            <span
                className={`relative z-10 ml-[2px] flex h-8 w-8 items-center justify-center transition-colors duration-300 ${isDark
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
                    aria-hidden="true"
                >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                </svg>
            </span>
        </button>
    );
}