import "./global.css";
export const metadata = {
    metadataBase: new URL("https://example.com"),

    title: {
        default: "My Website",
        template: "%s | My Website",
    },

    description: "This is my website description.",

    applicationName: "My Website",

    generator: "Next.js",

    keywords: [
        "Next.js",
        "React",
        "Web Development",
        "JavaScript",
    ],

    authors: [
        {
            name: "Your Name",
            url: "https://example.com",
        },
    ],

    creator: "Your Name",

    publisher: "Your Company",

    referrer: "origin-when-cross-origin",

    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },

    alternates: {
        canonical: "/",

        languages: {
            "en-US": "/en-US",
            "ur-PK": "/ur-PK",
        },

        types: {
            "application/rss+xml": "/rss.xml",
        },
    },

    openGraph: {
        title: "My Website",
        description: "This is my website description.",
        url: "https://example.com",
        siteName: "My Website",

        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "My Website",
            },
        ],

        locale: "en_US",
        type: "website",
    },

    twitter: {
        card: "summary_large_image",

        title: "My Website",

        description: "This is my website description.",

        creator: "@username",

        site: "@username",

        images: ["/twitter-image.jpg"],
    },

    robots: {
        index: true,
        follow: true,

        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,

            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },

    icons: {
        icon: "/favicon.ico",

        shortcut: "/favicon-16x16.png",

        apple: "/apple-touch-icon.png",
    },

    manifest: "/site.webmanifest",

    verification: {
        google: "google-verification-code",

        yandex: "yandex-verification-code",

        yahoo: "yahoo-verification-code",

        other: {
            "facebook-domain-verification":
                "facebook-verification-code",
        },
    },

    appleWebApp: {
        capable: true,

        title: "My Website",

        statusBarStyle: "default",
    },

    appLinks: {
        ios: {
            url: "https://example.com/ios",
            app_store_id: "123456789",
        },

        android: {
            package: "com.example.app",
            app_name: "My App",
        },

        web: {
            url: "https://example.com",
            should_fallback: true,
        },
    },

    archives: [
        "https://example.com/archive",
    ],

    assets: [
        "https://example.com/assets",
    ],

    bookmarks: [
        "https://example.com/bookmarks",
    ],

    category: "technology",

    facebook: {
        appId: "123456789",
    },

    pinterest: {
        richPin: true,
    },

    other: {
        "custom-meta": "custom-value",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}