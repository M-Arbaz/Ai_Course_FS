import "dotenv/config";
import express from "express";
import {
    contactForm,
    getCourseBySlug,
    getBlogs,
    getBlogBySlug,
    getBlogsByTag,
    submitAiAssessment,
    getCourses,
    signup,
    verifyEmailOtp,
    resendVerificationOtp,
} from "../Controller/controller.js";
import db from "../DB/db.js";
const router = express.Router();

// TEST ROUTE
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Router is working",
    });
});


router.post("/contact", contactForm);
router.get("/courses/:slug", getCourseBySlug);
router.get("/courses", getCourses);
router.get("/blogs", getBlogs);

router.get("/blogs/tag/:tagSlug", getBlogsByTag);

router.get("/blogs/:slug", getBlogBySlug);
router.post("/ai-assessment", submitAiAssessment);

router.post("/auth/signup", signup);
router.post(
    "/auth/verify-email",
    verifyEmailOtp
);

router.post(
    "/auth/resend-verification-otp",
    resendVerificationOtp
);
export default router;