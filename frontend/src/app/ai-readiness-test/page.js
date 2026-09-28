import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AiAssessmentStandalone from "@/components/AiAssessmentStandalone";

export const metadata = {
    title: "AI Readiness Test | AI Course",
    description:
        "Take our free AI readiness test and discover your AI skill level with personalized course recommendations.",
};

export default function AiReadinessTestPage() {
    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-lime-50 px-4 py-10 sm:py-16">
                <section className="mx-auto max-w-5xl">

                    <div className="mb-8 text-center">

                        <div className="inline-flex rounded-full bg-purple-100 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.15em] text-purple-700">
                            Free AI Readiness Test
                        </div>

                        <h1 className="mt-5 text-4xl font-black text-[#21172f] sm:text-5xl">
                            How AI-Ready Are You?
                        </h1>

                        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                            Answer 12 quick questions, discover your current AI level
                            and get courses recommended for your goals.
                        </p>

                    </div>

                    <AiAssessmentStandalone />

                </section>
            </main>

            <Footer />
        </>
    );
}