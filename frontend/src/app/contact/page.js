"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
export default function ContactPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({
        type: "",
        message: "",
    });
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setStatus({ type: "", message: "" });

            const url = `${api}/api/contact`;

            console.log("Calling:", url);

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            console.log("Status:", response.status);
            console.log("Content-Type:", response.headers.get("content-type"));

            const text = await response.text();

            console.log("RAW RESPONSE:", text);

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(
                    `Backend returned HTML/non-JSON response. Status: ${response.status}`
                );
            }

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong.");
            }

            setStatus({
                type: "success",
                message: data.message || "Message sent successfully.",
            });

            setForm({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: "",
            });
        } catch (error) {
            console.error("Contact Error:", error);

            setStatus({
                type: "error",
                message: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="overflow-hidden bg-white">

                {/* HERO */}
                <section className="soft-grid relative overflow-hidden border-b border-purple-100">
                    <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-purple-200/60 blur-3xl" />
                    <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-lime-200/60 blur-3xl" />
                    <div className="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-pink-100 blur-3xl" />

                    <div className="relative mx-auto max-w-7xl px-6 py-20 text-center lg:px-8 lg:py-24">

                        <div className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white px-4 py-2 text-sm font-bold text-purple-600 shadow-sm">
                            <span>💬</span>
                            We&apos;d love to hear from you
                        </div>

                        <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-black tracking-[-0.04em] text-[#21172f] md:text-6xl">
                            Let&apos;s talk about your
                            <span className="text-purple-600"> AI journey.</span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                            Have a question about our courses, learning paths or AI training?
                            Send us a message and our team will get back to you.
                        </p>
                    </div>
                </section>

                {/* CONTACT CONTENT */}
                <section className="relative py-20">
                    <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">

                        {/* LEFT SIDE */}
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-500">
                                Contact Us
                            </p>

                            <h2 className="mt-4 max-w-lg text-4xl font-black leading-tight tracking-tight text-[#21172f]">
                                Questions?
                                <span className="block text-purple-600">
                                    We&apos;re here to help.
                                </span>
                            </h2>

                            <p className="mt-5 max-w-lg leading-7 text-slate-500">
                                Whether you want help choosing a course, want to know more
                                about the 28 Days AI Challenge, or need information about our
                                focused AI programs, just reach out.
                            </p>

                            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">

                                {/* EMAIL */}
                                <div className="flex gap-4 rounded-[26px] bg-[#eee5ff] p-5">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-xl text-white">
                                        ✉
                                    </div>

                                    <div>
                                        <p className="text-xs font-black uppercase tracking-wider text-purple-500">
                                            Email
                                        </p>

                                        <p className="mt-1 font-bold text-[#352148]">
                                            support@yourwebsite.com
                                        </p>

                                        <p className="mt-1 text-sm text-[#776487]">
                                            Send us your questions anytime.
                                        </p>
                                    </div>
                                </div>

                                {/* WHATSAPP */}
                                <div className="flex gap-4 rounded-[26px] bg-[#edffc9] p-5">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#a3e635] text-xl font-black text-[#293900]">
                                        ☎
                                    </div>

                                    <div>
                                        <p className="text-xs font-black uppercase tracking-wider text-[#719b18]">
                                            WhatsApp
                                        </p>

                                        <p className="mt-1 font-bold text-[#2c3918]">
                                            +92 XXX XXXXXXX
                                        </p>

                                        <p className="mt-1 text-sm text-[#68764d]">
                                            Quick support for course inquiries.
                                        </p>
                                    </div>
                                </div>

                                {/* RESPONSE */}
                                <div className="flex gap-4 rounded-[26px] bg-[#e3f4ff] p-5">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-xl text-white">
                                        ⚡
                                    </div>

                                    <div>
                                        <p className="text-xs font-black uppercase tracking-wider text-sky-500">
                                            Quick Response
                                        </p>

                                        <p className="mt-1 font-bold text-[#20384b]">
                                            We respond as soon as possible
                                        </p>

                                        <p className="mt-1 text-sm text-[#627686]">
                                            Our team is ready to guide you.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* SMALL COLOR CARD */}
                            <div className="relative mt-5 overflow-hidden rounded-[28px] bg-[#ffe5ef] p-7">
                                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-pink-300/50" />

                                <div className="relative">
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-500">
                                        Not sure what to learn?
                                    </p>

                                    <h3 className="mt-3 text-2xl font-black text-[#4a2735]">
                                        We&apos;ll help you choose.
                                    </h3>

                                    <p className="mt-3 max-w-sm text-sm leading-6 text-[#81616d]">
                                        Tell us your goal and we&apos;ll help you find the AI
                                        learning path that fits you best.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CONTACT FORM */}
                        <div className="relative">
                            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-lime-200/60 blur-2xl" />

                            <div className="relative rounded-[32px] border border-purple-100 bg-white p-6 shadow-[0_25px_80px_rgba(105,65,198,0.10)] sm:p-8 lg:p-10">

                                <div>
                                    <span className="rounded-full bg-purple-50 px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-purple-600">
                                        Send a Message
                                    </span>

                                    <h2 className="mt-5 text-3xl font-black text-[#21172f]">
                                        How can we help?
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Fill out the form below and tell us what you&apos;d like to
                                        know.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="mt-8">

                                    {/* NAME / EMAIL */}
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="mb-2 block text-sm font-bold text-[#30243d]"
                                            >
                                                Your Name
                                            </label>

                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={form.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter your name"
                                                className="w-full rounded-2xl border border-purple-100 bg-[#fbfaff] px-5 py-4 text-sm text-[#21172f] outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="mb-2 block text-sm font-bold text-[#30243d]"
                                            >
                                                Email Address
                                            </label>

                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="you@example.com"
                                                className="w-full rounded-2xl border border-purple-100 bg-[#fbfaff] px-5 py-4 text-sm text-[#21172f] outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                                            />
                                        </div>
                                    </div>

                                    {/* PHONE / SUBJECT */}
                                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="phone"
                                                className="mb-2 block text-sm font-bold text-[#30243d]"
                                            >
                                                Phone Number
                                                <span className="ml-1 font-normal text-slate-400">
                                                    (optional)
                                                </span>
                                            </label>

                                            <input
                                                id="phone"
                                                name="phone"
                                                type="text"
                                                value={form.phone}
                                                onChange={handleChange}
                                                placeholder="+92..."
                                                className="w-full rounded-2xl border border-purple-100 bg-[#fbfaff] px-5 py-4 text-sm text-[#21172f] outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="subject"
                                                className="mb-2 block text-sm font-bold text-[#30243d]"
                                            >
                                                Subject
                                            </label>

                                            <select
                                                id="subject"
                                                name="subject"
                                                value={form.subject}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-2xl border border-purple-100 bg-[#fbfaff] px-5 py-4 text-sm text-[#21172f] outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                                            >
                                                <option value="">Select a topic</option>
                                                <option value="course">
                                                    Course Information
                                                </option>
                                                <option value="28-days">
                                                    28 Days AI Challenge
                                                </option>
                                                <option value="15-tools">
                                                    15 AI Tools Program
                                                </option>
                                                <option value="single-course">
                                                    Single AI Course
                                                </option>
                                                <option value="business">
                                                    Business / Team Training
                                                </option>
                                                <option value="other">
                                                    Other Inquiry
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* MESSAGE */}
                                    <div className="mt-5">
                                        <label
                                            htmlFor="message"
                                            className="mb-2 block text-sm font-bold text-[#30243d]"
                                        >
                                            Your Message
                                        </label>

                                        <textarea
                                            id="message"
                                            name="message"
                                            rows="6"
                                            value={form.message}
                                            onChange={handleChange}
                                            required
                                            placeholder="Tell us how we can help..."
                                            className="w-full resize-none rounded-2xl border border-purple-100 bg-[#fbfaff] px-5 py-4 text-sm leading-6 text-[#21172f] outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                                        />
                                    </div>

                                    {/* SUBMIT */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 px-6 py-4 font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-1 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loading ? "Sending..." : "Send Message"}

                                        {!loading && <span>→</span>}
                                    </button>
                                    {status.message && (
                                        <div
                                            className={`mt-4 rounded-2xl px-5 py-4 text-center text-sm font-semibold ${status.type === "success"
                                                ? "bg-lime-50 text-lime-700"
                                                : "bg-red-50 text-red-600"
                                                }`}
                                        >
                                            {status.message}
                                        </div>
                                    )}
                                    <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                                        By submitting this form, you agree that we may contact you
                                        regarding your inquiry.
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                {/* BOTTOM CTA */}
                <section className="px-6 pb-24 lg:px-8">
                    <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[#edffc9] px-7 py-12 md:px-12">
                        <div className="flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">

                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#739c20]">
                                    Start Learning AI
                                </p>

                                <h2 className="mt-3 text-3xl font-black text-[#293712] md:text-4xl">
                                    Ready to explore our courses?
                                </h2>

                                <p className="mt-3 text-[#69774d]">
                                    Find the learning path that matches your goals.
                                </p>
                            </div>

                            <a
                                href="/courses"
                                className="shrink-0 rounded-full bg-purple-600 px-7 py-4 font-black text-white shadow-lg shadow-lime-200 transition hover:-translate-y-1"
                            >
                                Browse Courses →
                            </a>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </>
    );
}