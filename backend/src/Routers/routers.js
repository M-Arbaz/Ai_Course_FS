import express from "express";
import { contactForm } from "../Controller/controller.js";

const router = express.Router();

// TEST ROUTE
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Router is working",
    });
});

// CONTACT ROUTE
router.post("/contact", contactForm);

export default router;