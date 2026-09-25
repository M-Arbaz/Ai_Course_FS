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
            script.src =
                "https://cdn.gtranslate.net/widgets/latest/dropdown.js";

            script.defer = true;

            document.body.appendChild(script);
        }
    }, []);

    return <div className="gtranslate_wrapper"></div>;
}