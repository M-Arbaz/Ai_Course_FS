import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./Routers/routers.js";
import {
    stripeWebhookHandler,
} from "./Controller/stripeWebhook.controller.js";
import path from "path";
import { fileURLToPath } from "url";
import {
    startProfileImageService,
} from "./Functions/profileImageService.js";
const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://f.api.ai-course.elearnp.com",
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
app.use(
    "/public_assets",
    express.static(path.join(__dirname, "../public_assets"))
);
// Stripe must receive the unmodified request body.
app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhookHandler
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root testagy
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
    startProfileImageService();
});