"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const languages = [
    { code: "en", label: "English", short: "EN" },
    { code: "fr", label: "French", short: "FR" },
    { code: "es", label: "Spanish", short: "ES" },
    { code: "zh-CN", label: "Chinese", short: "ZH" },
    { code: "ur", label: "Urdu", short: "UR" },
    { code: "fa", label: "Persian", short: "FA" },
    { code: "ar", label: "Arabic", short: "AR" },
];

export default function WebsiteTranslator() {
    const pathname = usePathname();

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(languages[0]);
    const [ready, setReady] = useState(false);

    const dropdownRef = useRef(null);
    const intervalRef = useRef(null);

    // Get hidden GTranslate select
    const getTranslateSelect = () => {
        return document.querySelector(
            "#gtranslate-wrapper select"
        );
    };

    // Wait until GTranslate generates select
    const waitForSelect = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        let attempts = 0;

        intervalRef.current = setInterval(() => {
            attempts++;

            const select = getTranslateSelect();

            if (select) {
                setReady(true);

                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            }

            if (attempts >= 50) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            }
        }, 100);
    };

    // Initialize / reinitialize GTranslate
    const loadGTranslate = () => {
        const wrapper = document.getElementById(
            "gtranslate-wrapper"
        );

        if (!wrapper) return;

        window.gtranslateSettings = {
            default_language: "en",
            languages: [
                "en",
                "fr",
                "es",
                "zh-CN",
                "ur",
                "fa",
                "ar",
            ],
            wrapper_selector: "#gtranslate-wrapper",
        };

        const existingSelect = getTranslateSelect();

        // Already working
        if (existingSelect) {
            setReady(true);
            return;
        }

        setReady(false);

        // Remove old script because Next.js page navigation
        // does not automatically execute it again
        const oldScript =
            document.getElementById("gtranslate-script");

        if (oldScript) {
            oldScript.remove();
        }

        wrapper.innerHTML = "";

        const script = document.createElement("script");

        script.id = "gtranslate-script";
        script.src =
            "https://cdn.gtranslate.net/widgets/latest/dropdown.js";

        script.async = true;

        script.onload = () => {
            waitForSelect();
        };

        document.body.appendChild(script);
    };

    // First load
    useEffect(() => {
        const savedLanguage =
            localStorage.getItem("selected-language");

        if (savedLanguage) {
            const found = languages.find(
                (language) =>
                    language.code === savedLanguage
            );

            if (found) {
                setSelected(found);
            }
        }

        const timer = setTimeout(() => {
            loadGTranslate();
        }, 200);

        return () => {
            clearTimeout(timer);

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Fix after Next.js page change
    useEffect(() => {
        setOpen(false);

        const timer = setTimeout(() => {
            const select = getTranslateSelect();

            if (select) {
                setReady(true);
            } else {
                loadGTranslate();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [pathname]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    // Apply language
    const applyLanguage = (select, language) => {
        const options = Array.from(select.options);

        const option = options.find(
            (item) =>
                item.value === language.code ||
                item.value.endsWith(
                    `|${language.code}`
                )
        );

        if (!option) {
            console.log(
                "Language not found:",
                language.code
            );
            return;
        }

        select.value = option.value;

        select.dispatchEvent(
            new Event("change", {
                bubbles: true,
            })
        );
    };

    // Language click
    const changeLanguage = (language) => {
        setSelected(language);
        setOpen(false);

        localStorage.setItem(
            "selected-language",
            language.code
        );

        const select = getTranslateSelect();

        // GTranslate available
        if (select) {
            applyLanguage(select, language);
            return;
        }

        // GTranslate disappeared after route change
        loadGTranslate();

        let attempts = 0;

        const interval = setInterval(() => {
            attempts++;

            const newSelect = getTranslateSelect();

            if (newSelect) {
                clearInterval(interval);
                applyLanguage(newSelect, language);
            }

            if (attempts >= 50) {
                clearInterval(interval);
            }
        }, 100);
    };

    return (
        <div
            ref={dropdownRef}
            className="relative z-[99999]"
        >
            {/* Main button */}
            <button
                type="button"
                onClick={() =>
                    setOpen((previous) => !previous)
                }
                className="
          group
          flex
          min-w-[220px]
          items-center
          gap-3
          rounded-xl
          border
          border-gray-200
          bg-white
          px-3
          py-2
          shadow-sm
          transition-all
          duration-300
          hover:border-indigo-300
          hover:shadow-md
        "
            >
                {/* Globe */}
                <div
                    className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-gradient-to-br
            from-blue-500
            to-indigo-600
            text-white
            shadow-sm
          "
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                        />

                        <path d="M2 12h20" />

                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                </div>

                {/* Selected language */}
                <span className="flex-1 text-left text-sm font-medium text-gray-700">
                    {selected.label}
                </span>

                {/* Arrow */}
                <svg
                    className={`
            h-4
            w-4
            shrink-0
            text-gray-400
            transition-transform
            duration-300

            ${open
                            ? "rotate-180 text-indigo-500"
                            : ""
                        }
          `}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {/* Custom modern dropdown */}
            {open && (
                <div
                    className="
            absolute
            right-0
            top-[calc(100%+8px)]
            z-[999999]
            w-full
            min-w-[220px]
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            bg-white
            p-1.5
            shadow-2xl
          "
                >
                    {languages.map((language) => {
                        const active =
                            selected.code ===
                            language.code;

                        return (
                            <button
                                key={language.code}
                                type="button"
                                onClick={() =>
                                    changeLanguage(language)
                                }
                                className={`
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2.5
                  text-left
                  transition-all
                  duration-200

                  ${active
                                        ? "bg-indigo-50 text-indigo-600"
                                        : "text-gray-700 hover:bg-gray-50"
                                    }
                `}
                            >
                                {/* Code */}
                                <div
                                    className={`
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-[11px]
                    font-bold

                    ${active
                                            ? "bg-indigo-100 text-indigo-600"
                                            : "bg-gray-100 text-gray-500"
                                        }
                  `}
                                >
                                    {language.short}
                                </div>

                                {/* Name */}
                                <span className="flex-1 text-sm font-medium">
                                    {language.label}
                                </span>

                                {/* Check */}
                                {active && (
                                    <svg
                                        className="h-4 w-4 text-indigo-600"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.704 5.292a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.414L8.5 12.086l6.793-6.794a1 1 0 011.411 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </button>
                        );
                    })}

                    {!ready && (
                        <div className="border-t border-gray-100 px-3 py-2 text-center text-xs text-gray-400">
                            Translator loading...
                        </div>
                    )}
                </div>
            )}

            {/* Real GTranslate widget */}
            <div
                id="gtranslate-wrapper"
                className="gtranslate_wrapper hidden"
            />
        </div>
    );
}