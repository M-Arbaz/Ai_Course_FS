import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseEnrollmentForm from "@/components/CourseEnrollmentForm";

export default async function CourseEnrollmentPage({
    params,
}) {
    const { slug } = await params;

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-white px-4 py-12 text-[#21172f] dark:bg-[#17111f] dark:text-white sm:px-6 lg:px-8">
                <CourseEnrollmentForm slug={slug} />
            </main>

            <Footer />
        </>
    );
}