import api from "@/lib/api";
import BlogCard from "@/components/BlogCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

async function getBlogs() {
    const response = await fetch(`${api()}/api/blogs`, {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(
            `Failed to fetch blogs: ${response.status}`
        );
    }

    const data = await response.json();

    return Array.isArray(data.blogs)
        ? data.blogs
        : [];
}

export default async function BlogPage() {
    const blogs = await getBlogs();

    return (

        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                <section className="relative overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 px-6 py-20">
                    <div className="mx-auto max-w-7xl text-center">
                        <span className="inline-flex rounded-full bg-purple-100 px-4 py-2 text-sm font-bold text-purple-700">
                            AI Learning Blog
                        </span>

                        <h1 className="mt-6 text-4xl font-black tracking-tight text-[#21172f] sm:text-5xl lg:text-6xl">
                            Learn, Explore & Grow
                            <span className="block text-purple-600">
                                with Artificial Intelligence
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                            Explore AI tools, guides, trends and
                            practical ideas designed to help you
                            learn and work smarter.
                        </p>
                    </div>
                </section>

                <section className="px-6 py-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-10">
                            <p className="font-bold text-purple-600">
                                Latest Articles
                            </p>

                            <h2 className="mt-2 text-3xl font-black text-[#21172f]">
                                Explore Our Blog
                            </h2>
                        </div>

                        {blogs.length === 0 ? (
                            <div className="rounded-3xl bg-purple-50 p-12 text-center">
                                <h3 className="text-xl font-bold text-[#21172f]">
                                    No articles available yet.
                                </h3>
                            </div>
                        ) : (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {blogs.map((blog) => (
                                    <BlogCard
                                        key={blog.id}
                                        blog={blog}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>

    );
}