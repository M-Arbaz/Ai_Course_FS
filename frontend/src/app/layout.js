import "./global.css";
import Script from "next/script";
import AiAssessmentPopup from "@/components/AiAssessmentPopup";
export const metadata = {
    title: "AI Learning Academy",
    description:
        "Practical AI courses in AI assistants, video generation, design, coding, marketing, analytics, business and sales.",
};
const themeInitScript = `
(function () {
    try {
        var savedTheme = localStorage.getItem("ai-academy-theme");

        if (savedTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    } catch (error) {
        document.documentElement.classList.remove("dark");
    }
})();
`;
export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>

            <body>
                <Script
                    id="ai-academy-theme-init"
                    strategy="beforeInteractive"
                >
                    {themeInitScript}
                </Script>
                {children}
                <AiAssessmentPopup />
            </body>
        </html>
    );
}