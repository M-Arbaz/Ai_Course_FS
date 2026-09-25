"use client";

import { useEffect, useRef, useState } from "react";

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
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(languages[0]);
    const [ready, setReady] = useState(false);

    const dropdownRef = useRef(null);

    useEffect(() => {
        // GTranslate settings
        window.gtranslateSettings = {
            default_language: "en",
            languages: ["en", "fr", "es", "zh-CN", "ur", "fa", "ar"],
            wrapper_selector: ".gtranslate_wrapper",
        };

        const initializeScript = () => {
            // Script already loaded
            if (document.getElementById("gtranslate-script")) {
                waitForGTranslate();
                return;
            }

            const script = document.createElement("script");

            script.id = "gtranslate-script";
            script.src =
                "https://cdn.gtranslate.net/widgets/latest/dropdown.js";
            script.async = true;

            script.onload = () => {
                waitForGTranslate();
            };

            document.body.appendChild(script);
        };

        const waitForGTranslate = () => {
            let attempts = 0;

            const interval = setInterval(() => {
                const select = document.querySelector(
                    ".gtranslate_wrapper select"
                );

                attempts++;

                if (select) {
                    setReady(true);
                    clearInterval(interval);

                    // Detect current GTranslate language
                    const currentValue = select.value || "";

                    const found = languages.find(
                        (language) =>
                            currentValue === language.code ||
                            currentValue.endsWith(`|${language.code}`)
                    );

                    if (found) {
                        setSelected(found);
                    }
                }

                if (attempts > 50) {
                    clearInterval(interval);
                }
            }, 100);
        };

        initializeScript();
    }, []);

    // Click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const changeLanguage = (language) => {
        const select = document.querySelector(
            ".gtranslate_wrapper select"
        );

        if (!select) {
            console.warn("GTranslate is not ready yet.");
            return;
        }

        // GTranslate can use values like:
        // fr
        // OR
        // en|fr
        const matchingOption = [...select.options].find(
            (option) =>
                option.value === language.code ||
                option.value.endsWith(`|${language.code}`)
        );

        if (!matchingOption) {
            console.warn(
                `Language ${language.code} not found in GTranslate.`
            );
            return;
        }

        select.value = matchingOption.value;

        select.dispatchEvent(
            new Event("change", {
                bubbles: true,
            })
        );

        setSelected(language);
        setOpen(false);
    };

    return (
        <div
            ref={dropdownRef}
            className="relative z-[9999]"
        >
            {/* Custom Button */}
            <button
                type="button"
                onClick={() => ready && setOpen((prev) => !prev)}
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
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                </div>

                {/* Selected language */}
                <div className="flex flex-1 items-center gap-2 text-left">
                    <span className="text-sm font-medium text-gray-700">
                        {selected.label}
                    </span>
                </div>

                {/* Arrow */}
                <svg
                    className={`
            h-4
            w-4
            shrink-0
            text-gray-400
            transition-transform
            duration-300
            ${open ? "rotate-180 text-indigo-500" : ""}
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

            {/* Modern Dropdown */}
            {open && (
                <div
                    className="
            absolute
            right-0
            top-[calc(100%+8px)]
            w-full
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            bg-white
            p-1.5
            shadow-xl
          "
                >
                    {languages.map((language) => {
                        const active =
                            selected.code === language.code;

                        return (
                            <button
                                type="button"
                                key={language.code}
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
                                {/* Language Code */}
                                <div
                                    className={`
                    flex
                    h-8
                    w-8
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
                </div>
            )}

            {/* Actual GTranslate widget - hidden */}
            <div className="gtranslate_wrapper hidden" />
        </div>
    );
}