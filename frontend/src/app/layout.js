import "./global.css";
import AiAssessmentPopup from "@/components/AiAssessmentPopup";
export const metadata = {
    title: "AI Learning Academy",
    description:
        "Practical AI courses in AI assistants, video generation, design, coding, marketing, analytics, business and sales.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}
                <AiAssessmentPopup />
            </body>
        </html>
    );
}