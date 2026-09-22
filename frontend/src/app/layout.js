import "./global.css";

export const metadata = {
    title: "AI Learning Academy",
    description:
        "Practical AI courses in AI assistants, video generation, design, coding, marketing, analytics, business and sales.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}