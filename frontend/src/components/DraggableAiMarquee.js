"use client";

import { useEffect, useRef } from "react";

function updatePosition(trackRef, widthRef, offsetRef) {
    const width = widthRef.current;

    if (!width || !trackRef.current) return;

    let x = offsetRef.current % width;

    if (x > 0) {
        x -= width;
    }

    offsetRef.current = x;

    trackRef.current.style.transform =
        `translate3d(${x}px, 0, 0)`;
}
const aiMarqueeLogos = [
    {
        name: "ChatGPT",
        logo: "https://unpkg.com/@lobehub/icons-static-svg@1.95.1/icons/openai.svg",
    },
    {
        name: "Claude",
        logo: "https://cdn.simpleicons.org/claude",
    },
    {
        name: "Gemini",
        logo: "https://cdn.simpleicons.org/googlegemini",
    },
    {
        name: "DeepSeek",
        logo: "https://cdn.simpleicons.org/deepseek",
    },
    {
        name: "Perplexity",
        logo: "https://cdn.simpleicons.org/perplexity",
    },
    {
        name: "Mistral AI",
        logo: "https://cdn.simpleicons.org/mistralai",
    },
    {
        name: "Qwen",
        logo: "https://cdn.simpleicons.org/qwen",
    },
    {
        name: "GitHub Copilot",
        logo: "https://cdn.simpleicons.org/githubcopilot",
    },
    {
        name: "Cursor",
        logo: "https://cdn.simpleicons.org/cursor",
    },
    {
        name: "Hugging Face",
        logo: "https://cdn.simpleicons.org/huggingface",
    },
    {
        name: "Ollama",
        logo: "https://cdn.simpleicons.org/ollama",
    },
    {
        name: "NotebookLM",
        logo: "https://cdn.simpleicons.org/notebooklm",
    },
    {
        name: "Replit",
        logo: "https://cdn.simpleicons.org/replit",
    },
    {
        name: "Replicate",
        logo: "https://cdn.simpleicons.org/replicate",
    },
    {
        name: "Notion",
        logo: "https://cdn.simpleicons.org/notion",
    },
    {
        name: "Grammarly",
        logo: "https://cdn.simpleicons.org/grammarly",
    },
    {
        name: "Zapier",
        logo: "https://cdn.simpleicons.org/zapier",
    },
    {
        name: "Claude Code",
        logo: "https://cdn.simpleicons.org/claudecode",
    },
];
export default function DraggableAiMarquee({ logos }) {
    const trackRef = useRef(null);
    const groupRef = useRef(null);

    const widthRef = useRef(0);
    const offsetRef = useRef(0);

    // -1 = LEFT, 1 = RIGHT
    const directionRef = useRef(-1);

    const hoveringRef = useRef(false);
    const draggingRef = useRef(false);
    const resumeAfterDragRef = useRef(false);

    const lastXRef = useRef(0);
    const dragDistanceRef = useRef(0);

    // AUTOMATIC INFINITE MOVEMENT
    useEffect(() => {
        let animationId;
        let previousTime = null;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        const measure = () => {
            const newWidth =
                groupRef.current?.getBoundingClientRect().width || 0;

            const oldWidth = widthRef.current;

            if (oldWidth && newWidth) {
                offsetRef.current =
                    (offsetRef.current / oldWidth) * newWidth;
            }

            widthRef.current = newWidth;

            updatePosition(trackRef, widthRef, offsetRef);
        };

        const observer = new ResizeObserver(measure);

        if (groupRef.current) {
            observer.observe(groupRef.current);
        }

        measure();

        const animate = (time) => {
            if (previousTime !== null) {
                const delta = Math.min(time - previousTime, 64);

                const shouldMove =
                    !reducedMotion.matches &&
                    !draggingRef.current &&
                    (!hoveringRef.current ||
                        resumeAfterDragRef.current);

                if (shouldMove && widthRef.current) {
                    // One complete cycle in 50 seconds
                    const speed = widthRef.current / 50000;

                    offsetRef.current +=
                        directionRef.current * speed * delta;

                    updatePosition(
                        trackRef,
                        widthRef,
                        offsetRef
                    );
                }
            }

            previousTime = time;

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationId);
            observer.disconnect();
        };
    }, []);

    // HOVER = PAUSE
    const handlePointerEnter = (event) => {
        if (event.pointerType !== "touch") {
            hoveringRef.current = true;
            resumeAfterDragRef.current = false;
        }
    };

    const handlePointerLeave = (event) => {
        if (event.pointerType !== "touch") {
            hoveringRef.current = false;
            resumeAfterDragRef.current = false;
        }
    };

    // START DRAG
    const handlePointerDown = (event) => {
        if (
            event.pointerType === "mouse" &&
            event.button !== 0
        ) {
            return;
        }

        draggingRef.current = true;
        resumeAfterDragRef.current = false;

        lastXRef.current = event.clientX;
        dragDistanceRef.current = 0;

        event.currentTarget.setPointerCapture(
            event.pointerId
        );
    };

    // DRAG AND CHANGE DIRECTION
    const handlePointerMove = (event) => {
        if (!draggingRef.current) return;

        const delta = event.clientX - lastXRef.current;

        lastXRef.current = event.clientX;

        if (delta === 0) return;

        dragDistanceRef.current += Math.abs(delta);

        // Move logos with cursor
        offsetRef.current += delta;

        updatePosition(
            trackRef,
            widthRef,
            offsetRef
        );

        // Determine new direction
        if (Math.abs(delta) > 1) {
            directionRef.current = delta > 0 ? 1 : -1;
        }
    };

    // RELEASE DRAG
    const handlePointerUp = (event) => {
        if (!draggingRef.current) return;

        draggingRef.current = false;

        // Resume automatically in selected direction
        if (dragDistanceRef.current > 8) {
            resumeAfterDragRef.current = true;
        }

        if (
            event.currentTarget.hasPointerCapture(
                event.pointerId
            )
        ) {
            event.currentTarget.releasePointerCapture(
                event.pointerId
            );
        }
    };

    const handlePointerCancel = () => {
        draggingRef.current = false;
        resumeAfterDragRef.current = false;
    };

    return (
        <div
            className="ai-logo-window relative mt-10 cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onLostPointerCapture={handlePointerCancel}
            onDragStart={(event) => event.preventDefault()}
        >
            {/* LEFT FADE */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent dark:from-[#120d19] sm:w-32" />

            {/* RIGHT FADE */}
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent dark:from-[#120d19] sm:w-32" />

            {/* INFINITE TRACK */}
            <div
                ref={trackRef}
                className="flex w-max items-center"
            >
                {[0, 1].map((copy) => (
                    <div
                        key={copy}
                        ref={copy === 0 ? groupRef : null}
                        aria-hidden={copy === 1}
                        className="flex shrink-0 items-center gap-5 pr-5"
                    >
                        {aiMarqueeLogos.map((tool) => (
                            <div
                                key={tool.name}
                                className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-100 bg-white px-6 py-4 shadow-sm transition duration-300 hover:border-purple-200 hover:shadow-md"
                            >
                                <img
                                    src={tool.logo}
                                    alt=""
                                    width={34}
                                    height={34}
                                    loading="lazy"
                                    decoding="async"
                                    draggable={false}
                                    className="h-8 w-8 shrink-0 object-contain"
                                />

                                <span className="whitespace-nowrap text-sm font-bold text-[#30243e]">
                                    {tool.name}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}