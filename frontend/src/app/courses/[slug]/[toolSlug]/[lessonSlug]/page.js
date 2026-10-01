import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LearningLesson from "@/components/LearningLesson";

export default async function LearningLessonPage({
    params,
}) {
    const {
        slug,
        toolSlug,
        lessonSlug,
    } = await params;

    return (
        <>
            <Navbar />

            <LearningLesson
                courseSlug={slug}
                toolSlug={toolSlug}
                lessonSlug={lessonSlug}
            />

            <Footer />
        </>
    );
}