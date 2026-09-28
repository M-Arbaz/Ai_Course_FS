import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-purple-100 bg-[#fbfaff]">
            <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
                <div className="grid gap-10 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-700 text-sm font-black text-white">
                                AI
                            </div>

                            <div>
                                <p className="font-black text-[#21172f]">AI Academy</p>
                                <p className="text-xs font-medium text-purple-500">
                                    Learn. Build. Grow.
                                </p>
                            </div>
                        </div>

                        <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
                            Practical AI learning for students, professionals, creators and
                            businesses who want to use modern AI tools confidently.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-[#21172f]">Explore</h4>

                        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
                            <Link href="/">Home</Link>
                            <Link href="/courses">All Courses</Link>
                            <Link href="/#categories">Categories</Link>
                            <Link href="/ai-readiness-test">Test Your AI Level</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-[#21172f]">Popular Skills</h4>

                        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
                            <span>AI Assistants</span>
                            <span>Video Generation</span>
                            <span>AI Coding</span>
                            <span>AI Marketing</span>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex flex-col gap-3 border-t border-purple-100 pt-6 text-sm text-slate-400 md:flex-row md:justify-between">
                    <p>© 2026 AI Academy. All rights reserved.</p>
                    <p>Build skills for an AI-powered future.</p>
                </div>
            </div>
        </footer>
    );
}