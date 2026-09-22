export default function backendApi() {
    return process.env.BACKEND_API_URL || "http://localhost:8080";
}