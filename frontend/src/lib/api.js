
export default function backendApi() {
    return process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8080";
}