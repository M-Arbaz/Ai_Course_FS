"use client";

import Link from "next/link";
import { useState } from "react";
import WebsiteTranslator from "./WebsiteTranslator";

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-purple-100/70 bg-white/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-700 text-sm font-black text-white shadow-lg shadow-purple-200">
                        AI
                    </div>

                    <div>
                        <p className="text-[17px] font-black leading-none text-[#21172f]">
                            AI Academy
                        </p>
                        <p className="mt-1 text-[10px] font-semibold tracking-[0.18em] text-purple-500">
                            LEARN • BUILD • GROW
                        </p>
                    </div>
                </Link>

                <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
                    <Link href="/" className="transition hover:text-purple-600">
                        Home
                    </Link>

                    <Link href="/courses" className="transition hover:text-purple-600">
                        Courses
                    </Link>

                    <Link href="/#categories" className="transition hover:text-purple-600">
                        Categories
                    </Link>

                    <Link href="/#why-us" className="transition hover:text-purple-600">
                        Why Us
                    </Link>
                    <Link href="/blog" className="transition hover:text-purple-600">
                        Blog
                    </Link>
                    <Link href="/contact" className="transition hover:text-purple-600">
                        Contact
                    </Link>
                </nav>

                <div className="hidden md:block">
                    <Link
                        href="/courses"
                        className="inline-flex items-center rounded-full bg-[#a3e635] px-5 py-2.5 text-sm font-bold text-[#243300] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#b7ef59]"
                    >
                        Explore Courses
                    </Link>
                    {/* <WebsiteTranslator /> */}
                </div>

                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-xl font-bold text-purple-700 md:hidden"
                >
                    {open ? "×" : "☰"}
                </button>
            </div>

            {open && (
                <div className="border-t border-purple-100 bg-white px-5 py-5 md:hidden">
                    <div className="flex flex-col gap-4 font-semibold text-slate-600">
                        <Link href="/" onClick={() => setOpen(false)}>
                            Home
                        </Link>

                        <Link href="/courses" onClick={() => setOpen(false)}>
                            Courses
                        </Link>

                        <Link href="/#categories" onClick={() => setOpen(false)}>
                            Categories
                        </Link>

                        <Link href="/#why-us" onClick={() => setOpen(false)}>
                            Why Us
                        </Link>
                        <Link href="/blog" onClick={() => setOpen(false)}>
                            Blog
                        </Link>
                        <Link href="/contact" onClick={() => setOpen(false)}>
                            Contact
                        </Link>
                        <Link
                            href="/courses"
                            onClick={() => setOpen(false)}
                            className="mt-2 rounded-xl bg-[#a3e635] px-5 py-3 text-center font-bold text-[#263800]"
                        >
                            Explore Courses
                        </Link>
                    </div>
                </div>
            )
            }
        </header >
    );
}