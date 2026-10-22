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
    enrollInCourse,
    getCourseEnrollment,
    getLearningLesson,
    getLessonQuiz,
    submitLessonQuiz,
    getLearningModule,
    getCourseLearningProgress,
} from "../Controller/controller.js";
import db from "../DB/db.js";
import {
    createCourseCheckout,
} from "../Controller/billing.controller.js";
import {
    requireAuth,
    profileImageUpload,
} from "../Middelware/middelware.js";
import {
    createCourseCheckout,
} from "../Controller/billing.controller.js";
const router = express.Router();

router.post(
    "/billing/courses/:slug/checkout",
    requireAuth,
    createCourseCheckout
);

router.post(
    "/billing/courses/:slug/checkout",
    requireAuth,
    createCourseCheckout
);
// TEST ROUTE
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Router is working",
    });
});


router.post("/contact", contactForm);
router.get("/courses/:slug", getCourseBySlug);

router.post(
    "/courses/:slug/enroll",
    requireAuth,
    enrollInCourse
);

router.get(
    "/learning/courses/:courseSlug/tools/:toolSlug/lessons/:lessonSlug",
    requireAuth,
    getLearningLesson
);

router.get(
    "/learning/courses/:courseSlug/tools/:toolSlug/lessons/:lessonSlug/quiz",
    requireAuth,
    getLessonQuiz
);

router.post(
    "/learning/courses/:courseSlug/tools/:toolSlug/lessons/:lessonSlug/quiz/submit",
    requireAuth,
    submitLessonQuiz
);
router.get(
    "/learning/courses/:courseSlug/tools/:toolSlug",
    requireAuth,
    getLearningModule
);
router.get(
    "/learning/courses/:courseSlug/progress",
    requireAuth,
    getCourseLearningProgress
);
router.get(
    "/courses/:slug/enrollment",
    requireAuth,
    getCourseEnrollment
);
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