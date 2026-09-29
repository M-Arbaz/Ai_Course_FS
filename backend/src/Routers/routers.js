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
    login,
    getCurrentUser,
    logout,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    googleLogin,
    uploadProfileImage,
    updateProfile,
} from "../Controller/controller.js";
import db from "../DB/db.js";
import {
    requireAuth,
    profileImageUpload,
} from "../Middelware/middelware.js";
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

router.post(
    "/auth/login",
    login
);

router.get(
    "/auth/me",
    getCurrentUser
);

router.post(
    "/auth/logout",
    logout
);

router.post(
    "/auth/forgot-password",
    forgotPassword
);

router.post(
    "/auth/verify-reset-otp",
    verifyResetOtp
);

router.post(
    "/auth/reset-password",
    resetPassword
);

router.post(
    "/auth/google",
    googleLogin
);
router.post(
    "/auth/profile-image",
    requireAuth,
    profileImageUpload,
    uploadProfileImage
);
router.patch(
    "/auth/profile",
    requireAuth,
    updateProfile
);
export default router;