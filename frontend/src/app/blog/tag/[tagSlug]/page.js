import api from "@/lib/api";
import BlogCard from "@/components/BlogCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
async function getBlogsByTag(tagSlug) {
    const response = await fetch(
        `${api()}/api/blogs/tag/${encodeURIComponent(tagSlug)}`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error(
            `Failed to fetch blogs by tag: ${response.status}`
        );
    }

    const data = await response.json();

    return data;
}

function formatTag(tagSlug) {
    return tagSlug
        .split("-")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");
}

export default async function BlogTagPage({
    params,
}) {
    const { tagSlug } = await params;

    const data = await getBlogsByTag(tagSlug);

    const blogs = Array.isArray(data.blogs)
        ? data.blogs
        : [];

    const tagTitle = formatTag(tagSlug);

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-white">
                {/* Hero */}
                <section className="soft-grid relative overflow-hidden border-b border-purple-100">
                    <div class="absolute -left-24 top-10 h-72 w-72 rounded-full bg-purple-200/60 blur-3xl"></div>
                    <div class="absolute right-0 top-0 h-72 w-72 rounded-full bg-lime-200/60 blur-3xl"></div>
                    <div class="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-pink-100 blur-3xl"></div>
                    <div className="relative mx-auto max-w-7xl px-6 py-20 text-left lg:px-8 lg:py-24">
                        <p className="font-bold text-purple-600">
                            Blog Tag
                        </p>

                        <h1 className="mt-3 text-4xl font-black text-[#21172f] sm:text-5xl">
                            {tagTitle}
                        </h1>

                        <p className="mt-4 max-w-2xl text-lg text-slate-600">
                            Explore articles related to {tagTitle}.
                        </p>
                    </div>
                </section>

                {/* Blogs */}
                <section className="px-6 py-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-10">
                            <p className="font-bold text-purple-600">
                                Tagged Articles
                            </p>

                            <h2 className="mt-2 text-3xl font-black text-[#21172f]">
                                {tagTitle} Blogs
                            </h2>
                        </div>

                        {blogs.length === 0 ? (
                            <div className="rounded-3xl bg-purple-50 p-12 text-center">
                                <h2 className="text-xl font-bold text-[#21172f]">
                                    No blogs found for this tag.
                                </h2>

                                <p className="mt-2 text-slate-600">
                                    There are currently no published articles
                                    tagged with {tagTitle}.
                                </p>
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