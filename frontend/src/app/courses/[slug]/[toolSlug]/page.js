import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LearningModuleEntry from "@/components/LearningModuleEntry";

export default async function LearningModulePage({
    params,
}) {
    const {
        slug,
        toolSlug,
    } = await params;

    return (
        <>
            <Navbar />

            <LearningModuleEntry
                courseSlug={slug}
                toolSlug={toolSlug}
            />

            <Footer />
        </>
    );
}