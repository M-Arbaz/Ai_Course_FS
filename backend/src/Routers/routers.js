import "dotenv/config";
import express from "express";
import { contactForm } from "../Controller/controller.js";
import db from "../DB/db.js";
const router = express.Router();

// TEST ROUTE
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Router is working",
    });
});

router.get("/db-test", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS connected");

        res.json({
            success: true,
            message: "Database connected successfully",
            result: rows,
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message,
        });
    }
});
router.post("/contact", contactForm);

export default router;