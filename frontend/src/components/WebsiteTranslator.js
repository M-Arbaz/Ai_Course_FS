"use client";

import { useEffect } from "react";

export default function WebsiteTranslator() {
    useEffect(() => {
        window.gtranslateSettings = {
            default_language: "en",
            languages: ["en", "fr", "es", "zh-CN", "ur", "fa", "ar"],
            wrapper_selector: ".gtranslate_wrapper",
        };

        if (!document.getElementById("gtranslate-script")) {
            const script = document.createElement("script");

            script.id = "gtranslate-script";
            script.src = "https://cdn.gtranslate.net/widgets/latest/dropdown.js";
            script.defer = true;

            document.body.appendChild(script);
        }
    }, []);

    return (
        <div className="group relative inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-blue-300 hover:shadow-md">

            {/* Globe Icon */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
            </div>

            {/* Language Dropdown */}
            <div
                className="
          gtranslate_wrapper

          [&_select]:min-w-[120px]
          [&_select]:cursor-pointer
          [&_select]:appearance-none
          [&_select]:border-0
          [&_select]:bg-transparent
          [&_select]:py-1
          [&_select]:pr-7
          [&_select]:text-sm
          [&_select]:font-medium
          [&_select]:text-gray-700
          [&_select]:outline-none
          [&_select]:transition-all

          [&_option]:bg-white
          [&_option]:text-gray-700
        "
            />

            {/* Custom Arrow */}
            <svg
                className="pointer-events-none absolute right-3 h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:text-blue-500"
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
        </div>
    );
}