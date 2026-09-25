import "dotenv/config";
import express from "express";
import {
    contactForm,
    getCourses,
    getCourseBySlug,
    getBlogs,
    getBlogBySlug,
    getBlogsByTag,
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
router.get("/blogs", getBlogs);

router.get("/blogs/tag/:tagSlug", getBlogsByTag);

router.get("/blogs/:slug", getBlogBySlug);
export default router;