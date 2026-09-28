import Link from "next/link";
import { getBlogImageUrl } from "@/lib/blog";

export default function BlogCard({ blog }) {
    const imageUrl = getBlogImageUrl(blog.image_url);

    return (
        <article className="group overflow-hidden rounded-[28px] border border-purple-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            {imageUrl ? (
                <div className="aspect-[16/10] overflow-hidden bg-purple-50">
                    <img
                        src={imageUrl}
                        alt={blog.title}
                        width={400}
                        height={250}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                </div>
            ) : (
                <div className="aspect-[16/10] bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100" />
            )}

            <div className="p-7">
                {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {blog.tags.map((tag) => (
                            <Link
                                key={tag}
                                href={`/blog/tag/${encodeURIComponent(tag)}`}
                                className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 transition hover:bg-purple-200"
                            >
                                #{tag}
                            </Link>
                        ))}
                    </div>
                )}

                <Link href={`/blog/${blog.slug}`}>
                    <h2 className="text-2xl font-black leading-tight text-[#21172f] transition group-hover:text-purple-600">
                        {blog.title}
                    </h2>
                </Link>

                <p className="mt-4 line-clamp-3 leading-7 text-slate-600">
                    {blog.excerpt}
                </p>

                <Link
                    href={`/blog/${blog.slug}`}
                    className="mt-6 inline-flex items-center gap-2 font-bold text-purple-600 transition hover:gap-3"
                >
                    Read Article
                    <span>→</span>
                </Link>
            </div>
        </article>
    );
}