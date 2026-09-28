import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./Routers/routers.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const PORT = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://f.api.ai-course.elearnp.com",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(
    "/public_assets",
    express.static(path.join(__dirname, "../public_assets"))
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root test
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Course backend is running",
    });
});

// Router
app.use("/api", router);

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});