export default function backendApi() {
    if (process.env.NODE_ENV === "production") {
        return "http://api.ai-course.elearnp.com";
    }

    return "http://localhost:8080";
}