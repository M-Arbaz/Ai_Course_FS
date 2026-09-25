import Link from "next/link";
import { notFound } from "next/navigation";
import api from "@/lib/api";
import { getBlogImageUrl } from "@/lib/blog";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

async function getBlog(slug) {
    const response = await fetch(
        `${api()}/api/blogs/${encodeURIComponent(slug)}`,
        {
            cache: "no-store",
        }
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(
            `Failed to fetch blog: ${response.status}`
        );
    }

    const data = await response.json();

    return data.blog;
}

export default async function BlogDetailPage({
    params,
}) {
    const { slug } = await params;

    const blog = await getBlog(slug);

    if (!blog) {
        notFound();
    }

    const imageUrl = getBlogImageUrl(
        blog.image_url
    );

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-white">
                <section className="bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 px-6 py-16">
                    <div className="mx-auto max-w-4xl">
                        <Link
                            href="/blog"
                            className="font-bold text-purple-600"
                        >
                            ← Back to Blog
                        </Link>

                        {Array.isArray(blog.tags) &&
                            blog.tags.length > 0 && (
                                <div className="mt-8 flex flex-wrap gap-2">
                                    {blog.tags.map((tag) => (
                                        <Link
                                            key={tag}
                                            href={`/blog/tag/${encodeURIComponent(
                                                tag
                                            )}`}
                                            className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-purple-700"
                                        >
                                            #{tag}
                                        </Link>
                                    ))}
                                </div>
                            )}

                        <h1 className="mt-6 text-4xl font-black leading-tight text-[#21172f] sm:text-5xl lg:text-6xl">
                            {blog.title}
                        </h1>

                        <p className="mt-6 text-xl leading-8 text-slate-600">
                            {blog.excerpt}
                        </p>
                    </div>
                </section>

                <article className="px-6 py-14">
                    <div className="mx-auto max-w-4xl">
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt={blog.title}
                                className="mb-12 aspect-[16/9] w-full rounded-[32px] object-cover"
                            />
                        )}

                        <div className="whitespace-pre-line text-lg leading-9 text-slate-700">
                            {blog.content}
                        </div>
                    </div>
                </article>
            </main>
            <Footer />
        </>




    );



}