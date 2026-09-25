import api from "@/lib/api";

export function getBlogImageUrl(imageUrl) {
    if (!imageUrl) {
        return null;
    }

    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    const path = imageUrl.startsWith("/")
        ? imageUrl
        : `/${imageUrl}`;

    return `${api()}${path}`;
}