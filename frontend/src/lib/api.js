
export default function backendApi() {
    if (process.env.NODE_ENV === "production") {
        return "https://api.ai-course.elearnp.com";
    }

    return "http://localhost:8080";
}