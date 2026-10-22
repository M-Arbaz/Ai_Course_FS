
"use client";

import { useEffect, useState } from "react";

const LOBE =
    "https://unpkg.com/@lobehub/icons-static-svg@1.95.1/icons";

const toolBrands = {

    // Additional AI tools and name aliases
    "perplexity ai": ["perplexity", "perplexity.ai"],
    "lexica": [null, "lexica.art"],
    "adcreative.ai": [null, "adcreative.ai"],
    "ocoya": [null, "ocoya.com"],
    "albert.ai": [null, "albert.ai"],
    "scispace": [null, "scispace.com"],
    "nanonets": [null, "nanonets.com"],
    "elicit": [null, "elicit.com"],
    "notion ai": ["notion", "notion.so"],
    "fireflies ai": [null, "fireflies.ai"],
    "crewai": [null, "crewai.com"],
    "n8n": ["n8n", "n8n.io"],
    "relume": [null, "relume.io"],
    "speak": [null, "speak.com"],
    "apollo ai": [null, "apollo.io"],

    // Video Generation
    "sora": ["sora", "openai.com"],
    "opus clip": [null, "opus.pro"],
    "runway": ["runway", "runwayml.com"],
    "pika labs": ["pika", "pika.art"],
    "klap": [null, "klap.app"],
    "invideo": [null, "invideo.io"],
    "luma dream": ["dreammachine", "lumalabs.ai"],
    "kling ai": ["kling", "klingai.com"],

    // Graphic Designing
    "nano banana": ["nanobanana", "gemini.google.com"],
    "midjourney": ["midjourney", "midjourney.com"],
    "stable diffusion": ["stability", "stability.ai"],
    "canva ai": ["canva", "canva.com", "simple"],
    "canva": ["canva", "canva.com", "simple"],
    "fluxai": ["flux", "bfl.ai"],
    "flux ai": ["flux", "bfl.ai"],
    "figma ai": ["figma", "figma.com"],
    "ideogram": ["ideogram", "ideogram.ai"],
    "dora": [null, "dora.run"],

    // AI Coding
    "cursor": ["cursor", "cursor.com"],
    "github copilot": ["githubcopilot", "github.com"],
    "windsurf": ["windsurf", "windsurf.com"],
    "replit": ["replit", "replit.com"],
    "codeium": [null, "codeium.com"],
    "tabnine": [null, "tabnine.com"],

    // SEO and Marketing
    "semrushai": [null, "semrush.com"],
    "surfer ai": [null, "surferseo.com"],
    "albertai": [null, "albert.ai"],
    "marketmuse": [null, "marketmuse.com"],

    // Data and Analytics
    "julius": [null, "julius.ai"],
    "polymer": [null, "polymersearch.com"],
    "akkio": [null, "akkio.com"],
    "hex": [null, "hex.tech"],

    // Sales
    "apollo.io": [null, "apollo.io"],
    "humantic ai": [null, "humantic.ai"],
    "outplay": [null, "outplayhq.com"],

    // Business
    "notion": ["notion", "notion.so"],
    "fireflies": [null, "fireflies.ai"],
    "zapier": ["zapier", "zapier.com"],

    // Writing
    "jasper": [null, "jasper.ai"],
    "copy.ai": [null, "copy.ai"],
    "anyword": [null, "anyword.com"],
    "writesonic": [null, "writesonic.com"],

    // Chatbots
    "chatgpt": ["openai", "chatgpt.com"],
    "claude": ["claude", "claude.ai"],
    "gemini": ["gemini", "gemini.google.com"],
    "grok": ["grok", "grok.com"],
    "perplexity pro": ["perplexity", "perplexity.ai"],
    "perplexity": ["perplexity", "perplexity.ai"],
    "poe": ["poe", "poe.com"],
    "microsoft copilot": [
        "microsoftcopilot",
        "copilot.microsoft.com",
    ],
    "deepseek": ["deepseek", "deepseek.com"],
};

function normalizeName(name) {
    return String(name || "")
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, " ")
        .trim();
}

export default function CourseToolLogo({ name }) {
    const key = normalizeName(name);
    const brand = toolBrands[key];

    const sources = brand
        ? [
            brand[0] &&
            (brand[2] === "simple"
                ? `https://cdn.simpleicons.org/${brand[0]}`
                : `${LOBE}/${brand[0]}.svg`),

            brand[1] &&
            `https://${brand[1]}/favicon.ico`,

            brand[1] &&
            `https://www.google.com/s2/favicons?domain=${encodeURIComponent(brand[1])}&sz=128`,

            brand[1] &&
            `https://icons.duckduckgo.com/ip3/${brand[1]}.ico`,

        ].filter(Boolean)
        : [];

    const [sourceIndex, setSourceIndex] = useState(0);

    useEffect(() => {
        setSourceIndex(0);
    }, [name]);

    return (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
            {sourceIndex < sources.length ? (
                <img
                    key={`${key}-${sourceIndex}`}
                    src={sources[sourceIndex]}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                    onError={() =>
                        setSourceIndex((previous) => previous + 1)
                    }
                />
            ) : (
                <span className="text-sm font-black text-purple-700">
                    {String(name || "?").slice(0, 2).toUpperCase()}
                </span>
            )}
        </div>
    );
}
