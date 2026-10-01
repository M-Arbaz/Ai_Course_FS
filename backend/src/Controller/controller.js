import "dotenv/config";
import {
    sendContactEmails,
    sendVerificationOtp,
    sendPasswordResetOtp,
} from "../Email/email.js";
import db from "../DB/db.js";
import {
    randomBytes,
    randomInt,
    createHmac,
    createHash,
    timingSafeEqual,
    scrypt as scryptCallback,
} from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { promisify } from "node:util";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scrypt = promisify(scryptCallback);
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);
const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

const USER_PROFILE_DIR =
    path.resolve(
        __dirname,
        "../../public_assets/user_profile"
    );
const OTP_PURPOSE =
    "email_verification";
const PASSWORD_RESET_PURPOSE =
    "password_reset";
const OTP_EXPIRY_MINUTES =
    Number(
        process.env.OTP_EXPIRES_MINUTES || 10
    );

const OTP_RESEND_SECONDS =
    Number(
        process.env.OTP_RESEND_SECONDS || 60
    );

const MAX_OTP_ATTEMPTS = 5;

const generateOtp = () =>
    String(
        randomInt(100000, 1000000)
    );

const hashOtp = (otp) => {
    const secret =
        process.env.OTP_SECRET;

    if (!secret) {
        throw new Error(
            "OTP_SECRET is not configured."
        );
    }

    return createHmac(
        "sha256",
        secret
    )
        .update(String(otp))
        .digest("hex");
};

const verifyOtpHash = (
    otp,
    storedHash
) => {
    if (!storedHash) {
        return false;
    }

    const incomingHash =
        Buffer.from(
            hashOtp(otp),
            "hex"
        );

    const savedHash =
        Buffer.from(
            storedHash,
            "hex"
        );

    if (
        incomingHash.length !==
        savedHash.length
    ) {
        return false;
    }

    return timingSafeEqual(
        incomingHash,
        savedHash
    );
};


const hashPassword = async (password) => {
    const salt = randomBytes(16).toString("hex");

    const derivedKey = await scrypt(
        password,
        salt,
        64
    );

    return `scrypt$${salt}$${Buffer.from(
        derivedKey
    ).toString("hex")}`;
};
const verifyPassword = async (
    password,
    storedHash
) => {
    try {
        if (!storedHash) {
            return false;
        }

        const parts =
            storedHash.split("$");

        if (
            parts.length !== 3 ||
            parts[0] !== "scrypt"
        ) {
            return false;
        }

        const salt =
            parts[1];

        const savedHashHex =
            parts[2];

        const derivedKey =
            await scrypt(
                password,
                salt,
                64
            );

        const incomingHash =
            Buffer.from(derivedKey);

        const savedHash =
            Buffer.from(
                savedHashHex,
                "hex"
            );

        if (
            incomingHash.length !==
            savedHash.length
        ) {
            return false;
        }

        return timingSafeEqual(
            incomingHash,
            savedHash
        );
    } catch {
        return false;
    }
};


const SESSION_COOKIE_NAME =
    process.env.SESSION_COOKIE_NAME ||
    "ai_course_session";

const SESSION_DAYS =
    Number(
        process.env.SESSION_DAYS || 7
    );

const LOGIN_MAX_ATTEMPTS =
    Number(
        process.env.LOGIN_MAX_ATTEMPTS || 5
    );

const LOGIN_LOCK_MINUTES =
    Number(
        process.env.LOGIN_LOCK_MINUTES || 15
    );


const hashSessionToken = (token) =>
    createHash("sha256")
        .update(token)
        .digest("hex");


const getCookieValue = (
    req,
    cookieName
) => {
    const cookieHeader =
        req.headers.cookie;

    if (!cookieHeader) {
        return null;
    }

    const cookies =
        cookieHeader.split(";");

    for (const cookie of cookies) {
        const [name, ...valueParts] =
            cookie.trim().split("=");

        if (name === cookieName) {
            return decodeURIComponent(
                valueParts.join("=")
            );
        }
    }

    return null;
};


const getSessionCookieOptions = () => ({
    httpOnly: true,

    secure:
        process.env.COOKIE_SECURE ===
        "true",

    sameSite: "lax",

    path: "/",

    maxAge:
        SESSION_DAYS *
        24 *
        60 *
        60 *
        1000,
});
const parseBlogTags = (tags) => {
    if (!tags) return [];

    return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
};
export const getBlogs = async (req, res) => {
    try {
        const [blogs] = await db.query(`
      SELECT
        id,
        slug,
        title,
        excerpt,
        image_url,
        tags,
        published_at,
        created_at
      FROM blogs
      WHERE status = 'published'
      ORDER BY COALESCE(published_at, created_at) DESC, id DESC
    `);

        const formattedBlogs = blogs.map((blog) => ({
            ...blog,
            tags: parseBlogTags(blog.tags),
        }));

        return res.status(200).json({
            success: true,
            blogs: formattedBlogs,
        });
    } catch (error) {
        console.error("Get blogs error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch blogs.",
        });
    }
};

export const getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const [blogs] = await db.query(
            `
        SELECT
          id,
          slug,
          title,
          excerpt,
          content,
          image_url,
          tags,
          published_at,
          created_at,
          updated_at
        FROM blogs
        WHERE slug = ?
          AND status = 'published'
        LIMIT 1
      `,
            [slug]
        );

        if (blogs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Blog not found.",
            });
        }

        const blog = {
            ...blogs[0],
            tags: parseBlogTags(blogs[0].tags),
        };

        return res.status(200).json({
            success: true,
            blog,
        });
    } catch (error) {
        console.error("Get blog error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch blog.",
        });
    }
};
export const getBlogsByTag = async (req, res) => {
    try {
        const tagSlug = req.params.tagSlug
            .trim()
            .toLowerCase();

        const [blogs] = await db.query(
            `
        SELECT
          id,
          slug,
          title,
          excerpt,
          image_url,
          tags,
          published_at,
          created_at
        FROM blogs
        WHERE status = 'published'
          AND FIND_IN_SET(
            ?,
            REPLACE(LOWER(tags), ' ', '')
          ) > 0
        ORDER BY COALESCE(published_at, created_at) DESC, id DESC
      `,
            [tagSlug]
        );

        const formattedBlogs = blogs.map((blog) => ({
            ...blog,
            tags: parseBlogTags(blog.tags),
        }));

        return res.status(200).json({
            success: true,
            tag: tagSlug,
            blogs: formattedBlogs,
        });
    } catch (error) {
        console.error("Get blogs by tag error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch blogs by tag.",
        });
    }
};
export const contactForm = async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    // 1. Validate
    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all required fields.",
        });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone?.trim() || null;
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address.",
        });
    }

    let inquiryId;

    // 2. Save inquiry in DB FIRST
    try {
        const [result] = await db.execute(
            `
        INSERT INTO contact_inquiries
        (
          name,
          email,
          phone,
          subject,
          message,
          status,
          email_status
        )
        VALUES (?, ?, ?, ?, ?, 'new', 'pending')
      `,
            [
                cleanName,
                cleanEmail,
                cleanPhone,
                cleanSubject,
                cleanMessage,
            ]
        );

        inquiryId = result.insertId;

        console.log(`Contact inquiry saved. ID: ${inquiryId}`);
    } catch (error) {
        console.error("Contact DB insert error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to submit your inquiry right now.",
        });
    }

    // 3. Send emails
    let emailStatus = "sent";

    try {
        await sendContactEmails({
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            subject: cleanSubject,
            message: cleanMessage,
        });
    } catch (error) {
        console.error("Contact email error:", error);
        emailStatus = "failed";
    }

    // 4. Update email status
    try {
        await db.execute(
            `
        UPDATE contact_inquiries
        SET email_status = ?
        WHERE id = ?
      `,
            [emailStatus, inquiryId]
        );
    } catch (error) {
        console.error("Email status DB update error:", error);
    }

    // 5. Final response
    if (emailStatus === "sent") {
        return res.status(200).json({
            success: true,
            message: "Your message has been sent successfully.",
        });
    }

    return res.status(200).json({
        success: true,
        emailSent: false,
        message:
            "Your inquiry has been received successfully. Email confirmation could not be sent right now.",
    });
};
// ==========================================
// GET ALL ACTIVE COURSES
// ==========================================

export const getCourses = async (req, res) => {
    try {
        const [courses] = await db.execute(`
      SELECT
        id,
        slug,
        title,
        type,
        duration,
        level,
        description,
        theme,
        sort_order
      FROM courses
      WHERE is_active = 1
      ORDER BY sort_order ASC, id ASC
    `);

        return res.status(200).json({
            success: true,
            courses,
        });
    } catch (error) {
        console.error("Get courses error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch courses.",
        });
    }
};
export const getCourseBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const [courses] = await db.execute(
            `
        SELECT
          id,
          slug,
          title,
          type,
          duration,
          level,
          description,
          theme
        FROM courses
        WHERE slug = ?
          AND is_active = 1
        LIMIT 1
      `,
            [slug]
        );

        if (courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        const course = courses[0];

        const [tools] = await db.execute(
            `
        SELECT tool_name
        FROM course_tools
        WHERE course_id = ?
        ORDER BY sort_order ASC, id ASC
      `,
            [course.id]
        );

        const [outcomes] = await db.execute(
            `
        SELECT outcome
        FROM course_outcomes
        WHERE course_id = ?
        ORDER BY sort_order ASC, id ASC
      `,
            [course.id]
        );

        return res.status(200).json({
            success: true,
            course: {
                ...course,
                tools: tools.map((item) => item.tool_name),
                outcomes: outcomes.map((item) => item.outcome),
                toolsCount: `${tools.length} AI Tools`,
            },
        });
    } catch (error) {
        console.error("Get course error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load course.",
        });
    }
};

// ==========================================
// ENROLL IN COURSE
// ==========================================

export const enrollInCourse = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.auth.userId;

        const [courses] = await db.execute(
            `
            SELECT
                id,
                slug,
                title
            FROM courses
            WHERE slug = ?
              AND is_active = 1
            LIMIT 1
            `,
            [slug]
        );

        if (courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        const course = courses[0];

        const [existingEnrollments] = await db.execute(
            `
            SELECT
                id,
                status,
                enrolled_at,
                completed_at
            FROM course_enrollments
            WHERE user_id = ?
              AND course_id = ?
            LIMIT 1
            `,
            [userId, course.id]
        );

        if (existingEnrollments.length > 0) {
            return res.status(200).json({
                success: true,
                alreadyEnrolled: true,
                message: "You are already enrolled in this course.",
                course,
                enrollment: existingEnrollments[0],
            });
        }

        const [result] = await db.execute(
            `
            INSERT INTO course_enrollments
                (user_id, course_id, status)
            VALUES (?, ?, 'active')
            `,
            [userId, course.id]
        );

        const [enrollments] = await db.execute(
            `
            SELECT
                id,
                status,
                enrolled_at,
                completed_at
            FROM course_enrollments
            WHERE id = ?
            LIMIT 1
            `,
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            alreadyEnrolled: false,
            message: "Enrollment completed successfully.",
            course,
            enrollment: enrollments[0],
        });
    } catch (error) {
        if (error?.code === "ER_DUP_ENTRY") {
            return res.status(200).json({
                success: true,
                alreadyEnrolled: true,
                message: "You are already enrolled in this course.",
            });
        }

        console.error("Course enrollment error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to enroll in this course right now.",
        });
    }
};

// ==========================================
// GET PROTECTED LEARNING LESSON
// ==========================================

export const getLearningLesson = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const {
            courseSlug,
            toolSlug,
            lessonSlug,
        } = req.params;

        // ------------------------------------------
        // COURSE
        // ------------------------------------------

        const [courses] = await db.execute(
            `
            SELECT
                id,
                slug,
                title
            FROM courses
            WHERE slug = ?
              AND is_active = 1
            LIMIT 1
            `,
            [courseSlug]
        );

        if (courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        const course = courses[0];

        // ------------------------------------------
        // ENROLLMENT REQUIRED
        // ------------------------------------------

        const [enrollments] = await db.execute(
            `
            SELECT
                id,
                status,
                enrolled_at,
                completed_at
            FROM course_enrollments
            WHERE user_id = ?
              AND course_id = ?
              AND status IN ('active', 'completed')
            LIMIT 1
            `,
            [userId, course.id]
        );

        if (enrollments.length === 0) {
            return res.status(403).json({
                success: false,
                code: "COURSE_ENROLLMENT_REQUIRED",
                message:
                    "You must enroll in this course before accessing its lessons.",
            });
        }

        // ------------------------------------------
        // TOOL / MODULE
        // ------------------------------------------

        const [tools] = await db.execute(
            `
            SELECT
                id,
                course_id,
                tool_name,
                slug,
                sort_order
            FROM course_tools
            WHERE course_id = ?
              AND slug = ?
            LIMIT 1
            `,
            [course.id, toolSlug]
        );

        if (tools.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Course module not found.",
            });
        }

        const tool = tools[0];

        // ------------------------------------------
        // ALL COURSE LESSONS IN LEARNING ORDER
        // ------------------------------------------

        const [lessons] = await db.execute(
            `
            SELECT
                cl.id,
                cl.course_tool_id,
                cl.slug,
                cl.title,
                cl.summary,
                cl.content,
                cl.video_url,
                cl.sort_order AS lesson_sort_order,

                ct.tool_name,
                ct.slug AS tool_slug,
                ct.sort_order AS tool_sort_order

            FROM course_lessons cl

            INNER JOIN course_tools ct
                ON ct.id = cl.course_tool_id

            WHERE ct.course_id = ?
              AND cl.is_active = 1

            ORDER BY
                ct.sort_order ASC,
                ct.id ASC,
                cl.sort_order ASC,
                cl.id ASC
            `,
            [course.id]
        );

        const lessonIndex = lessons.findIndex(
            (lesson) =>
                Number(lesson.course_tool_id) ===
                Number(tool.id) &&
                lesson.slug === lessonSlug
        );

        if (lessonIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Lesson not found.",
            });
        }

        const lesson = lessons[lessonIndex];

        const previousLesson =
            lessonIndex > 0
                ? lessons[lessonIndex - 1]
                : null;

        const nextLesson =
            lessonIndex < lessons.length - 1
                ? lessons[lessonIndex + 1]
                : null;

        // ------------------------------------------
        // SEQUENTIAL LOCK CHECK
        // ------------------------------------------

        if (previousLesson) {
            const [previousProgress] =
                await db.execute(
                    `
                    SELECT
                        status,
                        completed_at
                    FROM user_lesson_progress
                    WHERE user_id = ?
                      AND lesson_id = ?
                    LIMIT 1
                    `,
                    [
                        userId,
                        previousLesson.id,
                    ]
                );

            const previousCompleted =
                previousProgress.length > 0 &&
                previousProgress[0].status ===
                "completed";

            if (!previousCompleted) {
                return res.status(403).json({
                    success: false,
                    code: "LESSON_LOCKED",
                    message:
                        "Complete the previous lesson quiz to unlock this lesson.",

                    requiredPreviousLesson: {
                        toolSlug:
                            previousLesson.tool_slug,
                        lessonSlug:
                            previousLesson.slug,
                        title:
                            previousLesson.title,
                    },
                });
            }
        }

        // ------------------------------------------
        // MARK LESSON AS STARTED
        // ------------------------------------------

        await db.execute(
            `
            INSERT IGNORE INTO user_lesson_progress
                (
                    user_id,
                    lesson_id,
                    status
                )
            VALUES (?, ?, 'in_progress')
            `,
            [userId, lesson.id]
        );

        // ------------------------------------------
        // CURRENT PROGRESS
        // ------------------------------------------

        const [currentProgress] =
            await db.execute(
                `
                SELECT
                    status,
                    started_at,
                    completed_at
                FROM user_lesson_progress
                WHERE user_id = ?
                  AND lesson_id = ?
                LIMIT 1
                `,
                [userId, lesson.id]
            );

        // ------------------------------------------
        // QUIZ METADATA
        // Do NOT send correct answers here.
        // ------------------------------------------

        const [quizzes] = await db.execute(
            `
            SELECT
                id,
                title,
                pass_percentage
            FROM lesson_quizzes
            WHERE lesson_id = ?
              AND is_active = 1
            LIMIT 1
            `,
            [lesson.id]
        );

        return res.status(200).json({
            success: true,

            course,

            tool: {
                id: tool.id,
                name: tool.tool_name,
                slug: tool.slug,
                sortOrder: tool.sort_order,
            },

            lesson: {
                id: lesson.id,
                slug: lesson.slug,
                title: lesson.title,
                summary: lesson.summary,
                content: lesson.content,
                videoUrl: lesson.video_url,
                sortOrder:
                    lesson.lesson_sort_order,

                progress:
                    currentProgress[0] || null,
            },

            quiz:
                quizzes.length > 0
                    ? {
                        id: quizzes[0].id,
                        title:
                            quizzes[0].title,
                        passPercentage:
                            quizzes[0]
                                .pass_percentage,
                    }
                    : null,

            navigation: {
                previousLesson: previousLesson
                    ? {
                        toolSlug:
                            previousLesson.tool_slug,
                        lessonSlug:
                            previousLesson.slug,
                        title:
                            previousLesson.title,
                    }
                    : null,

                nextLesson: nextLesson
                    ? {
                        toolSlug:
                            nextLesson.tool_slug,
                        lessonSlug:
                            nextLesson.slug,
                        title:
                            nextLesson.title,
                    }
                    : null,
            },
        });
    } catch (error) {
        console.error(
            "Get learning lesson error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load this lesson right now.",
        });
    }
};

// ==========================================
// GET LESSON QUIZ
// ==========================================

export const getLessonQuiz = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const {
            courseSlug,
            toolSlug,
            lessonSlug,
        } = req.params;

        // ------------------------------------------
        // COURSE + ENROLLMENT
        // ------------------------------------------

        const [courses] = await db.execute(
            `
            SELECT
                id,
                slug,
                title
            FROM courses
            WHERE slug = ?
              AND is_active = 1
            LIMIT 1
            `,
            [courseSlug]
        );

        if (courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        const course = courses[0];

        const [enrollments] = await db.execute(
            `
            SELECT id
            FROM course_enrollments
            WHERE user_id = ?
              AND course_id = ?
              AND status IN ('active', 'completed')
            LIMIT 1
            `,
            [userId, course.id]
        );

        if (enrollments.length === 0) {
            return res.status(403).json({
                success: false,
                code: "COURSE_ENROLLMENT_REQUIRED",
                message:
                    "You must enroll in this course before accessing its quiz.",
            });
        }

        // ------------------------------------------
        // FIND REQUESTED LESSON
        // ------------------------------------------

        const [lessons] = await db.execute(
            `
            SELECT
                cl.id,
                cl.course_tool_id,
                cl.slug,
                cl.title,
                cl.sort_order AS lesson_sort_order,

                ct.id AS tool_id,
                ct.tool_name,
                ct.slug AS tool_slug,
                ct.sort_order AS tool_sort_order

            FROM course_lessons cl

            INNER JOIN course_tools ct
                ON ct.id = cl.course_tool_id

            WHERE ct.course_id = ?
              AND cl.is_active = 1

            ORDER BY
                ct.sort_order ASC,
                ct.id ASC,
                cl.sort_order ASC,
                cl.id ASC
            `,
            [course.id]
        );

        const lessonIndex = lessons.findIndex(
            (lesson) =>
                lesson.tool_slug === toolSlug &&
                lesson.slug === lessonSlug
        );

        if (lessonIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Lesson not found.",
            });
        }

        const lesson = lessons[lessonIndex];

        // ------------------------------------------
        // SAME SEQUENTIAL LOCK CHECK
        // ------------------------------------------

        if (lessonIndex > 0) {
            const previousLesson =
                lessons[lessonIndex - 1];

            const [previousProgress] =
                await db.execute(
                    `
                    SELECT status
                    FROM user_lesson_progress
                    WHERE user_id = ?
                      AND lesson_id = ?
                    LIMIT 1
                    `,
                    [
                        userId,
                        previousLesson.id,
                    ]
                );

            const previousCompleted =
                previousProgress.length > 0 &&
                previousProgress[0].status ===
                "completed";

            if (!previousCompleted) {
                return res.status(403).json({
                    success: false,
                    code: "LESSON_LOCKED",
                    message:
                        "Complete the previous lesson quiz to unlock this lesson.",
                });
            }
        }

        // ------------------------------------------
        // QUIZ
        // ------------------------------------------

        const [quizzes] = await db.execute(
            `
            SELECT
                id,
                title,
                pass_percentage
            FROM lesson_quizzes
            WHERE lesson_id = ?
              AND is_active = 1
            LIMIT 1
            `,
            [lesson.id]
        );

        if (quizzes.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "No active quiz is available for this lesson.",
            });
        }

        const quiz = quizzes[0];

        // ------------------------------------------
        // QUESTIONS
        // IMPORTANT:
        // is_correct is intentionally NOT selected.
        // ------------------------------------------

        const [rows] = await db.execute(
            `
            SELECT
                qq.id AS question_id,
                qq.question_text,
                qq.sort_order AS question_order,

                qo.id AS option_id,
                qo.option_text,
                qo.sort_order AS option_order

            FROM quiz_questions qq

            INNER JOIN quiz_options qo
                ON qo.question_id = qq.id

            WHERE qq.quiz_id = ?
              AND qq.is_active = 1

            ORDER BY
                qq.sort_order ASC,
                qo.sort_order ASC
            `,
            [quiz.id]
        );

        const questionsMap = new Map();

        for (const row of rows) {
            if (!questionsMap.has(row.question_id)) {
                questionsMap.set(
                    row.question_id,
                    {
                        id: row.question_id,
                        question:
                            row.question_text,
                        sortOrder:
                            row.question_order,
                        options: [],
                    }
                );
            }

            questionsMap
                .get(row.question_id)
                .options.push({
                    id: row.option_id,
                    text: row.option_text,
                    sortOrder:
                        row.option_order,
                });
        }

        const questions = Array.from(
            questionsMap.values()
        );

        return res.status(200).json({
            success: true,

            lesson: {
                id: lesson.id,
                slug: lesson.slug,
                title: lesson.title,
            },

            quiz: {
                id: quiz.id,
                title: quiz.title,
                passPercentage:
                    quiz.pass_percentage,
                questionCount:
                    questions.length,
                questions,
            },
        });
    } catch (error) {
        console.error(
            "Get lesson quiz error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load this quiz right now.",
        });
    }
};


// ==========================================
// GET COURSE ENROLLMENT
// ==========================================

export const getCourseEnrollment = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.auth.userId;

        const [courses] = await db.execute(
            `
            SELECT
                id,
                slug,
                title
            FROM courses
            WHERE slug = ?
              AND is_active = 1
            LIMIT 1
            `,
            [slug]
        );

        if (courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        const course = courses[0];

        const [enrollments] = await db.execute(
            `
            SELECT
                id,
                status,
                enrolled_at,
                completed_at
            FROM course_enrollments
            WHERE user_id = ?
              AND course_id = ?
            LIMIT 1
            `,
            [userId, course.id]
        );

        if (enrollments.length === 0) {
            return res.status(200).json({
                success: true,
                enrolled: false,
                course,
                enrollment: null,
            });
        }

        return res.status(200).json({
            success: true,
            enrolled: true,
            course,
            enrollment: enrollments[0],
        });
    } catch (error) {
        console.error("Get course enrollment error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to check course enrollment.",
        });
    }
};
// ==========================================
// AI ASSESSMENT
// ==========================================

export const submitAiAssessment = async (req, res) => {
    try {
        const {
            name = "",
            email,
            answers = {},
        } = req.body;

        // -----------------------------
        // Basic validation
        // -----------------------------

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        if (!answers || typeof answers !== "object") {
            return res.status(400).json({
                success: false,
                message: "Assessment answers are required.",
            });
        }

        // -----------------------------
        // SCORE CALCULATION
        // -----------------------------

        let rawScore = 0;

        // Q1 - Usage
        const usageScores = {
            never: 0,
            sometimes: 3,
            weekly: 7,
            daily: 10,
        };

        rawScore += usageScores[answers.usage] || 0;

        // Q2 - Tools used
        if (Array.isArray(answers.toolsUsed)) {
            const realTools = answers.toolsUsed.filter(
                (tool) => tool && tool !== "none"
            );

            rawScore += Math.min(realTools.length * 2, 10);
        }

        // Q3 - Confidence
        const confidenceScores = {
            beginner: 0,
            basic: 4,
            comfortable: 7,
            "very-confident": 10,
        };

        rawScore += confidenceScores[answers.confidence] || 0;

        // Q4 - Prompting
        const promptingScores = {
            "no-idea": 0,
            basic: 4,
            good: 8,
            advanced: 12,
        };

        rawScore += promptingScores[answers.prompting] || 0;

        // Q5 - Refining / Context
        const contextScores = {
            "give-up": 0,
            rewrite: 3,
            "add-context": 7,
            iterate: 10,
        };

        rawScore += contextScores[answers.contextSkill] || 0;

        // Q6 - Verification
        const verificationScores = {
            never: 0,
            rarely: 3,
            sometimes: 6,
            always: 10,
        };

        rawScore += verificationScores[answers.verification] || 0;

        // Q7 - Creative AI
        const creativeScores = {
            none: 0,
            tried: 3,
            regular: 7,
            advanced: 10,
        };

        rawScore += creativeScores[answers.creativeAI] || 0;

        // Q8 - Coding AI
        const codingScores = {
            never: 0,
            basic: 3,
            projects: 7,
            advanced: 10,
        };

        rawScore += codingScores[answers.codingAI] || 0;

        // Q9 - Automation
        const automationScores = {
            never: 0,
            interested: 2,
            simple: 6,
            advanced: 10,
        };

        rawScore += automationScores[answers.automationAI] || 0;

        // Q10 - Projects
        const projectScores = {
            never: 0,
            "small-tasks": 4,
            "complete-projects": 9,
            "automated-workflows": 13,
        };

        rawScore += projectScores[answers.projects] || 0;

        // Max raw score = 105
        const score = Math.min(
            100,
            Math.round((rawScore / 105) * 100)
        );
        // -----------------------------
        // LEVEL
        // -----------------------------

        let aiLevel = "AI Beginner";

        if (score <= 30) {
            aiLevel = "AI Beginner";
        } else if (score <= 55) {
            aiLevel = "AI Explorer";
        } else if (score <= 75) {
            aiLevel = "AI Practitioner";
        } else {
            aiLevel = "AI Power User";
        }

        // ==========================================
        // SMART COURSE RECOMMENDATIONS
        // ==========================================

        const [courses] = await db.execute(`
  SELECT
    id,
    slug,
    title,
    type,
    duration,
    level,
    description,
    theme,
    sort_order
  FROM courses
  WHERE is_active = 1
  ORDER BY sort_order ASC, id ASC
`);

        const interest = String(answers.interest || "").toLowerCase();
        const goal = String(answers.goal || "").toLowerCase();

        const interestKeywords = {
            "content-productivity": [
                "writing",
                "business",
                "chatbot",
                "marketing"
            ],

            "image-design": [
                "graphic",
                "design",
                "image"
            ],

            "video": [
                "video"
            ],

            "coding": [
                "coding",
                "software",
                "development"
            ],

            "marketing": [
                "marketing",
                "seo",
                "sales"
            ],

            "data-research": [
                "data",
                "analytics",
                "research"
            ],

            "business-automation": [
                "business",
                "sales",
                "chatbot",
                "automation"
            ]
        };

        const goalKeywords = {
            "job-skills": [
                "coding",
                "data",
                "business",
                "marketing"
            ],

            "freelancing": [
                "graphic",
                "video",
                "writing",
                "coding",
                "marketing"
            ],

            "business": [
                "business",
                "sales",
                "marketing",
                "chatbot"
            ],

            "content-creation": [
                "writing",
                "graphic",
                "video",
                "marketing"
            ],

            "study": [
                "chatbot",
                "data",
                "writing"
            ],

            "productivity": [
                "business",
                "chatbot",
                "writing"
            ]
        };

        const scoredCourses = courses.map((course) => {
            let recommendationScore = 0;

            const searchableText = `
    ${course.title || ""}
    ${course.type || ""}
    ${course.level || ""}
    ${course.description || ""}
    ${course.slug || ""}
  `.toLowerCase();

            // --------------------------------------
            // Interest matching
            // --------------------------------------

            const selectedInterestKeywords =
                interestKeywords[interest] || [];

            selectedInterestKeywords.forEach((keyword) => {
                if (searchableText.includes(keyword)) {
                    recommendationScore += 25;
                }
            });

            // --------------------------------------
            // Goal matching
            // --------------------------------------

            const selectedGoalKeywords =
                goalKeywords[goal] || [];

            selectedGoalKeywords.forEach((keyword) => {
                if (searchableText.includes(keyword)) {
                    recommendationScore += 15;
                }
            });

            // --------------------------------------
            // AI level matching
            // --------------------------------------

            const levelText = String(course.level || "").toLowerCase();

            if (score <= 30) {
                if (levelText.includes("beginner")) {
                    recommendationScore += 20;
                }

                // Complete beginner programs get priority
                if (
                    course.slug === "28-days-ai-challenge" ||
                    course.slug === "15-ai-tools-program"
                ) {
                    recommendationScore += 30;
                }
            }

            if (score > 30 && score <= 55) {
                if (levelText.includes("beginner")) {
                    recommendationScore += 15;
                }

                if (course.slug === "15-ai-tools-program") {
                    recommendationScore += 15;
                }
            }

            if (score > 55 && score <= 75) {
                if (
                    levelText.includes("intermediate") ||
                    levelText.includes("advanced")
                ) {
                    recommendationScore += 15;
                }
            }

            if (score > 75) {
                if (
                    levelText.includes("advanced") ||
                    levelText.includes("intermediate")
                ) {
                    recommendationScore += 20;
                }
            }

            return {
                ...course,
                recommendationScore,
            };
        });

        scoredCourses.sort((a, b) => {
            if (b.recommendationScore !== a.recommendationScore) {
                return b.recommendationScore - a.recommendationScore;
            }

            return (a.sort_order || 999) - (b.sort_order || 999);
        });

        const recommendedCourses = scoredCourses
            .slice(0, 3)
            .map((course) => ({
                id: course.id,
                slug: course.slug,
                title: course.title,
                type: course.type,
                duration: course.duration,
                level: course.level,
                description: course.description,
                theme: course.theme,
            }));
        // -----------------------------
        // SAVE TO DATABASE
        // -----------------------------

        const [result] = await db.execute(
            `
      INSERT INTO ai_assessments
      (
        name,
        email,
        answers,
        score,
        ai_level,
        recommended_courses,
        source
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
            [
                name.trim() || null,
                email.trim().toLowerCase(),
                JSON.stringify(answers),
                score,
                aiLevel,
                JSON.stringify(recommendedCourses),
                "ai-assessment",
            ]
        );

        // -----------------------------
        // RESPONSE
        // -----------------------------

        return res.status(201).json({
            success: true,
            message: "Assessment completed successfully.",
            assessmentId: result.insertId,
            score,
            level: aiLevel,
            interest: answers.interest || null,
            goal: answers.goal || null,
            recommendedCourses,
        });
    } catch (error) {
        console.error("AI assessment error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to complete AI assessment.",
        });
    }
};

// Sign up

export const signup = async (req, res) => {
    let connection;

    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
        } = req.body;

        // ----------------------------------
        // Required fields
        // ----------------------------------

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please fill in all required fields.",
            });
        }

        const cleanFirstName =
            String(firstName).trim();

        const cleanLastName =
            String(lastName).trim();

        const cleanEmail =
            String(email)
                .trim()
                .toLowerCase();

        // ----------------------------------
        // Name validation
        // ----------------------------------

        if (
            cleanFirstName.length < 2 ||
            cleanFirstName.length > 100
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "First name must be between 2 and 100 characters.",
            });
        }

        if (
            cleanLastName.length < 2 ||
            cleanLastName.length > 100
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Last name must be between 2 and 100 characters.",
            });
        }

        // ----------------------------------
        // Email validation
        // ----------------------------------

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailRegex.test(cleanEmail)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please enter a valid email address.",
            });
        }

        // ----------------------------------
        // Password validation
        // ----------------------------------

        if (
            password !== confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Password and confirm password do not match.",
            });
        }

        if (
            password.length < 8 ||
            password.length > 128
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be between 8 and 128 characters.",
            });
        }

        if (
            !/[A-Za-z]/.test(password)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least one letter.",
            });
        }

        if (
            !/[0-9]/.test(password)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least one number.",
            });
        }

        const passwordHash =
            await hashPassword(password);

        const otp =
            generateOtp();

        const otpHash =
            hashOtp(otp);

        const otpExpiresAt =
            new Date(
                Date.now() +
                OTP_EXPIRY_MINUTES *
                60 *
                1000
            );

        connection =
            await db.getConnection();

        await connection.beginTransaction();

        // ----------------------------------
        // Existing account?
        // ----------------------------------

        const [existingUsers] =
            await connection.execute(
                `
                SELECT
                    id,
                    email_verified_at
                FROM users
                WHERE email = ?
                LIMIT 1
                FOR UPDATE
                `,
                [cleanEmail]
            );

        const existingUser =
            existingUsers.length > 0
                ? existingUsers[0]
                : null;

        // Already verified account
        if (
            existingUser &&
            existingUser.email_verified_at
        ) {
            await connection.rollback();

            connection.release();
            connection = null;

            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists. Please sign in.",
            });
        }

        let userId;
        let isNewUser = false;

        // ----------------------------------
        // Pending/unverified account
        // ----------------------------------

        if (existingUser) {
            userId = existingUser.id;

            await connection.execute(
                `
                UPDATE users
                SET
                    first_name = ?,
                    last_name = ?,
                    password_hash = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [
                    cleanFirstName,
                    cleanLastName,
                    passwordHash,
                    userId,
                ]
            );
        } else {
            const [result] =
                await connection.execute(
                    `
                    INSERT INTO users
                    (
                        first_name,
                        last_name,
                        email,
                        password_hash,
                        email_verified_at,
                        status
                    )
                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        NULL,
                        'active'
                    )
                    `,
                    [
                        cleanFirstName,
                        cleanLastName,
                        cleanEmail,
                        passwordHash,
                    ]
                );

            userId =
                result.insertId;

            isNewUser = true;
        }

        // ----------------------------------
        // Invalidate previous verification OTPs
        // ----------------------------------

        await connection.execute(
            `
            UPDATE auth_otps
            SET consumed_at = CURRENT_TIMESTAMP
            WHERE
                user_id = ?
                AND purpose = ?
                AND consumed_at IS NULL
            `,
            [
                userId,
                OTP_PURPOSE,
            ]
        );

        // ----------------------------------
        // Save fresh OTP HASH
        // ----------------------------------

        await connection.execute(
            `
            INSERT INTO auth_otps
            (
                user_id,
                purpose,
                code_hash,
                attempts,
                expires_at,
                consumed_at
            )
            VALUES (
                ?,
                ?,
                ?,
                0,
                ?,
                NULL
            )
            `,
            [
                userId,
                OTP_PURPOSE,
                otpHash,
                otpExpiresAt,
            ]
        );

        await connection.commit();

        connection.release();
        connection = null;

        // ----------------------------------
        // Send OTP email
        // ----------------------------------

        try {
            await sendVerificationOtp({
                firstName:
                    cleanFirstName,
                email:
                    cleanEmail,
                otp,
            });
        } catch (emailError) {
            console.error(
                "Verification OTP email error:",
                emailError
            );

            return res.status(503).json({
                success: false,
                accountCreated: true,
                requiresEmailVerification: true,
                email: cleanEmail,
                message:
                    "Your registration was saved, but we could not send the verification email. Please request a new code.",
            });
        }

        // ----------------------------------
        // Success
        // ----------------------------------

        return res
            .status(
                isNewUser
                    ? 201
                    : 200
            )
            .json({
                success: true,
                message:
                    "Verification code sent to your email.",
                requiresEmailVerification:
                    true,
                email:
                    cleanEmail,
                user: {
                    id:
                        userId,
                    firstName:
                        cleanFirstName,
                    lastName:
                        cleanLastName,
                    email:
                        cleanEmail,
                },
            });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch {
                // ignore rollback error
            }

            connection.release();
        }

        console.error(
            "Signup error:",
            error
        );

        if (
            error.code ===
            "ER_DUP_ENTRY"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Unable to create your account right now.",
        });
    }
};

// ==========================================
// AUTH - VERIFY EMAIL OTP
// ==========================================

export const verifyEmailOtp =
    async (req, res) => {
        let connection;

        try {
            const {
                email,
                otp,
            } = req.body;

            if (
                !email ||
                !otp
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Email and verification code are required.",
                    });
            }

            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            const cleanOtp =
                String(otp).trim();

            if (
                !/^\d{6}$/.test(
                    cleanOtp
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Please enter a valid 6-digit verification code.",
                    });
            }

            connection =
                await db.getConnection();

            await connection.beginTransaction();

            // ------------------------------
            // User
            // ------------------------------

            const [users] =
                await connection.execute(
                    `
                    SELECT
                        id,
                        first_name,
                        last_name,
                        email,
                        email_verified_at
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    FOR UPDATE
                    `,
                    [cleanEmail]
                );

            if (
                users.length === 0
            ) {
                await connection.rollback();

                connection.release();
                connection = null;

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid or expired verification code.",
                    });
            }

            const user =
                users[0];

            // Already verified = safe/idempotent
            if (
                user.email_verified_at
            ) {
                await connection.commit();

                connection.release();
                connection = null;

                return res
                    .status(200)
                    .json({
                        success: true,
                        alreadyVerified: true,
                        message:
                            "Your email is already verified. You can sign in.",
                    });
            }

            // ------------------------------
            // Latest active OTP
            // ------------------------------

            const [otpRows] =
                await connection.execute(
                    `
                    SELECT
                        id,
                        code_hash,
                        attempts,
                        expires_at
                    FROM auth_otps
                    WHERE
                        user_id = ?
                        AND purpose = ?
                        AND consumed_at IS NULL
                    ORDER BY id DESC
                    LIMIT 1
                    FOR UPDATE
                    `,
                    [
                        user.id,
                        OTP_PURPOSE,
                    ]
                );

            if (
                otpRows.length === 0
            ) {
                await connection.rollback();

                connection.release();
                connection = null;

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Verification code is invalid or has expired. Please request a new code.",
                    });
            }

            const otpRecord =
                otpRows[0];

            // ------------------------------
            // Attempts exhausted
            // ------------------------------

            if (
                otpRecord.attempts >=
                MAX_OTP_ATTEMPTS
            ) {
                await connection.execute(
                    `
                    UPDATE auth_otps
                    SET consumed_at =
                        CURRENT_TIMESTAMP
                    WHERE id = ?
                    `,
                    [otpRecord.id]
                );

                await connection.commit();

                connection.release();
                connection = null;

                return res
                    .status(429)
                    .json({
                        success: false,
                        message:
                            "Too many incorrect attempts. Please request a new verification code.",
                    });
            }

            // ------------------------------
            // Expiry
            // ------------------------------

            if (
                new Date(
                    otpRecord.expires_at
                ).getTime() <=
                Date.now()
            ) {
                await connection.execute(
                    `
                    UPDATE auth_otps
                    SET consumed_at =
                        CURRENT_TIMESTAMP
                    WHERE id = ?
                    `,
                    [otpRecord.id]
                );

                await connection.commit();

                connection.release();
                connection = null;

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Verification code has expired. Please request a new code.",
                    });
            }

            // ------------------------------
            // Wrong OTP
            // ------------------------------

            const isCorrect =
                verifyOtpHash(
                    cleanOtp,
                    otpRecord.code_hash
                );

            if (!isCorrect) {
                const newAttempts =
                    otpRecord.attempts +
                    1;

                if (
                    newAttempts >=
                    MAX_OTP_ATTEMPTS
                ) {
                    await connection.execute(
                        `
                        UPDATE auth_otps
                        SET
                            attempts = ?,
                            consumed_at =
                                CURRENT_TIMESTAMP
                        WHERE id = ?
                        `,
                        [
                            newAttempts,
                            otpRecord.id,
                        ]
                    );
                } else {
                    await connection.execute(
                        `
                        UPDATE auth_otps
                        SET attempts = ?
                        WHERE id = ?
                        `,
                        [
                            newAttempts,
                            otpRecord.id,
                        ]
                    );
                }

                await connection.commit();

                connection.release();
                connection = null;

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            newAttempts >=
                                MAX_OTP_ATTEMPTS
                                ? "Too many incorrect attempts. Please request a new verification code."
                                : "Incorrect verification code.",
                    });
            }

            // ------------------------------
            // OTP correct
            // ------------------------------

            await connection.execute(
                `
                UPDATE auth_otps
                SET consumed_at =
                    CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [otpRecord.id]
            );

            await connection.execute(
                `
                UPDATE users
                SET
                    email_verified_at =
                        CURRENT_TIMESTAMP,
                    updated_at =
                        CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [user.id]
            );

            await connection.commit();

            connection.release();
            connection = null;

            return res
                .status(200)
                .json({
                    success: true,
                    message:
                        "Email verified successfully. You can now sign in.",
                    user: {
                        id:
                            user.id,
                        firstName:
                            user.first_name,
                        lastName:
                            user.last_name,
                        email:
                            user.email,
                    },
                });
        } catch (error) {
            if (connection) {
                try {
                    await connection.rollback();
                } catch {
                    // ignore
                }

                connection.release();
            }

            console.error(
                "Verify email OTP error:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Unable to verify your email right now.",
                });
        }
    };

// ==========================================
// AUTH - RESEND EMAIL OTP
// ==========================================

export const resendVerificationOtp =
    async (req, res) => {
        try {
            const { email } =
                req.body;

            if (!email) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Email is required.",
                    });
            }

            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            const [users] =
                await db.execute(
                    `
                    SELECT
                        id,
                        first_name,
                        email,
                        email_verified_at
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [cleanEmail]
                );

            /*
             * Generic response:
             * don't reveal unnecessarily
             * whether an account exists.
             */
            if (
                users.length === 0
            ) {
                return res
                    .status(200)
                    .json({
                        success: true,
                        message:
                            "If this email requires verification, a new code will be sent.",
                    });
            }

            const user =
                users[0];

            if (
                user.email_verified_at
            ) {
                return res
                    .status(200)
                    .json({
                        success: true,
                        alreadyVerified: true,
                        message:
                            "This email is already verified. You can sign in.",
                    });
            }

            // ------------------------------
            // Cooldown
            // ------------------------------

            const [recentOtps] =
                await db.execute(
                    `
                    SELECT created_at
                    FROM auth_otps
                    WHERE
                        user_id = ?
                        AND purpose = ?
                    ORDER BY id DESC
                    LIMIT 1
                    `,
                    [
                        user.id,
                        OTP_PURPOSE,
                    ]
                );

            if (
                recentOtps.length > 0
            ) {
                const lastSentAt =
                    new Date(
                        recentOtps[0]
                            .created_at
                    ).getTime();

                const secondsPassed =
                    Math.floor(
                        (
                            Date.now() -
                            lastSentAt
                        ) /
                        1000
                    );

                if (
                    secondsPassed <
                    OTP_RESEND_SECONDS
                ) {
                    return res
                        .status(429)
                        .json({
                            success: false,
                            retryAfter:
                                OTP_RESEND_SECONDS -
                                secondsPassed,
                            message:
                                `Please wait ${OTP_RESEND_SECONDS -
                                secondsPassed
                                } seconds before requesting another code.`,
                        });
                }
            }

            const otp =
                generateOtp();

            const otpHash =
                hashOtp(otp);

            const expiresAt =
                new Date(
                    Date.now() +
                    OTP_EXPIRY_MINUTES *
                    60 *
                    1000
                );

            const connection =
                await db.getConnection();

            try {
                await connection.beginTransaction();

                await connection.execute(
                    `
                    UPDATE auth_otps
                    SET consumed_at =
                        CURRENT_TIMESTAMP
                    WHERE
                        user_id = ?
                        AND purpose = ?
                        AND consumed_at IS NULL
                    `,
                    [
                        user.id,
                        OTP_PURPOSE,
                    ]
                );

                await connection.execute(
                    `
                    INSERT INTO auth_otps
                    (
                        user_id,
                        purpose,
                        code_hash,
                        attempts,
                        expires_at,
                        consumed_at
                    )
                    VALUES (
                        ?,
                        ?,
                        ?,
                        0,
                        ?,
                        NULL
                    )
                    `,
                    [
                        user.id,
                        OTP_PURPOSE,
                        otpHash,
                        expiresAt,
                    ]
                );

                await connection.commit();
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }

            await sendVerificationOtp({
                firstName:
                    user.first_name,
                email:
                    user.email,
                otp,
            });

            return res
                .status(200)
                .json({
                    success: true,
                    message:
                        "A new verification code has been sent.",
                });
        } catch (error) {
            console.error(
                "Resend verification OTP error:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Unable to resend the verification code right now.",
                });
        }
    };

// ==========================================
// AUTH - LOGIN
// ==========================================

export const login = async (req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (
            !email ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required.",
            });
        }

        const cleanEmail =
            String(email)
                .trim()
                .toLowerCase();

        const [users] =
            await db.execute(
                `
                SELECT
                    id,
                    first_name,
                    last_name,
                    email,
                    password_hash,
                    email_verified_at,
                    status,
                    failed_login_attempts,
                    locked_until
                FROM users
                WHERE email = ?
                LIMIT 1
                `,
                [cleanEmail]
            );

        // Don't reveal whether account exists
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password.",
            });
        }

        const user =
            users[0];

        // ----------------------------------
        // Account blocked
        // ----------------------------------

        if (
            user.status !== "active"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "This account is currently unavailable.",
            });
        }

        // ----------------------------------
        // Temporary login lock
        // ----------------------------------

        if (
            user.locked_until &&
            new Date(
                user.locked_until
            ).getTime() >
            Date.now()
        ) {
            const retryAfter =
                Math.ceil(
                    (
                        new Date(
                            user.locked_until
                        ).getTime() -
                        Date.now()
                    ) /
                    1000
                );

            return res.status(429).json({
                success: false,
                retryAfter,
                message:
                    "Too many failed login attempts. Please try again later.",
            });
        }

        // ----------------------------------
        // Password check
        // ----------------------------------

        const passwordCorrect =
            await verifyPassword(
                password,
                user.password_hash
            );

        if (!passwordCorrect) {
            const failedAttempts =
                Number(
                    user.failed_login_attempts ||
                    0
                ) + 1;

            if (
                failedAttempts >=
                LOGIN_MAX_ATTEMPTS
            ) {
                await db.execute(
                    `
                    UPDATE users
                    SET
                        failed_login_attempts = ?,
                        locked_until =
                            DATE_ADD(
                                NOW(),
                                INTERVAL ? MINUTE
                            )
                    WHERE id = ?
                    `,
                    [
                        failedAttempts,
                        LOGIN_LOCK_MINUTES,
                        user.id,
                    ]
                );

                return res
                    .status(429)
                    .json({
                        success: false,
                        message:
                            `Too many failed login attempts. Please try again in ${LOGIN_LOCK_MINUTES} minutes.`,
                    });
            }

            await db.execute(
                `
                UPDATE users
                SET failed_login_attempts = ?
                WHERE id = ?
                `,
                [
                    failedAttempts,
                    user.id,
                ]
            );

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password.",
            });
        }

        // ----------------------------------
        // Email must be verified
        // ----------------------------------

        if (!user.email_verified_at) {
            // Password is correct, so reset
            // failed-attempt counter
            await db.execute(
                `
                UPDATE users
                SET
                    failed_login_attempts = 0,
                    locked_until = NULL
                WHERE id = ?
                `,
                [user.id]
            );

            return res.status(403).json({
                success: false,
                code:
                    "EMAIL_NOT_VERIFIED",
                requiresEmailVerification:
                    true,
                email:
                    user.email,
                message:
                    "Please verify your email before signing in.",
            });
        }

        // ----------------------------------
        // Successful login
        // ----------------------------------

        const sessionToken =
            randomBytes(32)
                .toString("hex");

        const tokenHash =
            hashSessionToken(
                sessionToken
            );

        const expiresAt =
            new Date(
                Date.now() +
                SESSION_DAYS *
                24 *
                60 *
                60 *
                1000
            );

        await db.execute(
            `
            INSERT INTO auth_sessions
            (
                user_id,
                token_hash,
                ip_address,
                user_agent,
                expires_at,
                last_seen_at
            )
            VALUES (?, ?, ?, ?, ?, NOW())
            `,
            [
                user.id,
                tokenHash,
                req.ip || null,
                req.get("user-agent") ||
                null,
                expiresAt,
            ]
        );

        await db.execute(
            `
            UPDATE users
            SET
                failed_login_attempts = 0,
                locked_until = NULL,
                last_login_at =
                    CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [user.id]
        );

        res.cookie(
            SESSION_COOKIE_NAME,
            sessionToken,
            getSessionCookieOptions()
        );

        return res.status(200).json({
            success: true,
            message:
                "Signed in successfully.",
            user: {
                id:
                    user.id,
                firstName:
                    user.first_name,
                lastName:
                    user.last_name,
                email:
                    user.email,
            },
        });
    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to sign in right now.",
        });
    }
};

// ==========================================
// AUTH - CURRENT USER
// ==========================================

export const getCurrentUser =
    async (req, res) => {
        try {
            const sessionToken =
                getCookieValue(
                    req,
                    SESSION_COOKIE_NAME
                );

            if (!sessionToken) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        authenticated:
                            false,
                        message:
                            "Not authenticated.",
                    });
            }

            const tokenHash =
                hashSessionToken(
                    sessionToken
                );

            const [sessions] =
                await db.execute(
                    `
                    SELECT
                        s.id AS session_id,
                        u.id,
                       u.first_name,
                       u.last_name,
                       u.email,
                       u.password_hash,
                       u.profile_image,
                       u.email_verified_at
                    FROM auth_sessions s
                    INNER JOIN users u
                        ON u.id = s.user_id
                    WHERE
                        s.token_hash = ?
                        AND s.revoked_at IS NULL
                        AND s.expires_at > NOW()
                        AND u.status = 'active'
                    LIMIT 1
                    `,
                    [tokenHash]
                );

            if (
                sessions.length === 0
            ) {
                res.clearCookie(
                    SESSION_COOKIE_NAME,
                    {
                        httpOnly: true,
                        secure:
                            process.env
                                .COOKIE_SECURE ===
                            "true",
                        sameSite:
                            "lax",
                        path: "/",
                    }
                );

                return res
                    .status(401)
                    .json({
                        success: false,
                        authenticated:
                            false,
                        message:
                            "Session expired. Please sign in again.",
                    });
            }

            const user =
                sessions[0];

            await db.execute(
                `
                UPDATE auth_sessions
                SET last_seen_at = NOW()
                WHERE id = ?
                `,
                [
                    user.session_id,
                ]
            );

            return res.status(200).json({
                success: true,
                authenticated: true,

                user: {
                    id:
                        user.id,
                    firstName:
                        user.first_name,
                    lastName:
                        user.last_name,
                    email:
                        user.email,

                    profileImage:
                        user.profile_image || null,
                    hasPassword:
                        Boolean(
                            user.password_hash
                        ),

                    emailVerified:
                        Boolean(
                            user.email_verified_at
                        ),
                },
            });
        } catch (error) {
            console.error(
                "Current user error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to check authentication.",
            });
        }
    };

// ==========================================
// AUTH - LOGOUT
// ==========================================

export const logout =
    async (req, res) => {
        try {
            const sessionToken =
                getCookieValue(
                    req,
                    SESSION_COOKIE_NAME
                );

            if (sessionToken) {
                const tokenHash =
                    hashSessionToken(
                        sessionToken
                    );

                await db.execute(
                    `
                    UPDATE auth_sessions
                    SET revoked_at =
                        CURRENT_TIMESTAMP
                    WHERE
                        token_hash = ?
                        AND revoked_at IS NULL
                    `,
                    [tokenHash]
                );
            }

            res.clearCookie(
                SESSION_COOKIE_NAME,
                {
                    httpOnly: true,

                    secure:
                        process.env
                            .COOKIE_SECURE ===
                        "true",

                    sameSite:
                        "lax",

                    path: "/",
                }
            );

            return res.status(200).json({
                success: true,
                message:
                    "Signed out successfully.",
            });
        } catch (error) {
            console.error(
                "Logout error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to sign out right now.",
            });
        }
    };

// ==========================================
// AUTH - FORGOT PASSWORD
// ==========================================

export const forgotPassword =
    async (req, res) => {
        let connection;

        try {
            const { email } =
                req.body;

            if (!email) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Email is required.",
                    });
            }

            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !emailRegex.test(
                    cleanEmail
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Please enter a valid email address.",
                    });
            }

            const genericResponse = {
                success: true,
                message:
                    "If an eligible account exists for this email, a password reset code has been sent.",
            };

            const [users] =
                await db.execute(
                    `
                    SELECT
                        id,
                        first_name,
                        email,
                        password_hash,
                        email_verified_at,
                        status
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [cleanEmail]
                );

            /*
             * Do not reveal whether account exists.
             */
            if (
                users.length === 0
            ) {
                return res
                    .status(200)
                    .json(
                        genericResponse
                    );
            }

            const user =
                users[0];

            /*
             * Only normal, verified,
             * active password accounts.
             */
            if (
                user.status !==
                "active" ||
                !user.email_verified_at ||
                !user.password_hash
            ) {
                return res
                    .status(200)
                    .json(
                        genericResponse
                    );
            }

            // ----------------------------------
            // Resend cooldown
            // ----------------------------------

            const [recentOtps] =
                await db.execute(
                    `
                    SELECT
                        created_at
                    FROM auth_otps
                    WHERE
                        user_id = ?
                        AND purpose = ?
                    ORDER BY id DESC
                    LIMIT 1
                    `,
                    [
                        user.id,
                        PASSWORD_RESET_PURPOSE,
                    ]
                );

            if (
                recentOtps.length > 0
            ) {
                const lastCreated =
                    new Date(
                        recentOtps[0]
                            .created_at
                    ).getTime();

                const secondsPassed =
                    Math.floor(
                        (
                            Date.now() -
                            lastCreated
                        ) /
                        1000
                    );

                /*
                 * Return same generic response
                 * to avoid account enumeration.
                 */
                if (
                    secondsPassed <
                    OTP_RESEND_SECONDS
                ) {
                    return res
                        .status(200)
                        .json(
                            genericResponse
                        );
                }
            }

            const otp =
                generateOtp();

            const otpHash =
                hashOtp(otp);

            const expiresAt =
                new Date(
                    Date.now() +
                    OTP_EXPIRY_MINUTES *
                    60 *
                    1000
                );

            connection =
                await db.getConnection();

            await connection.beginTransaction();

            // Invalidate old reset OTPs
            await connection.execute(
                `
                UPDATE auth_otps
                SET consumed_at =
                    CURRENT_TIMESTAMP
                WHERE
                    user_id = ?
                    AND purpose = ?
                    AND consumed_at IS NULL
                `,
                [
                    user.id,
                    PASSWORD_RESET_PURPOSE,
                ]
            );

            // Save new OTP hash
            await connection.execute(
                `
                INSERT INTO auth_otps
                (
                    user_id,
                    purpose,
                    code_hash,
                    attempts,
                    expires_at,
                    consumed_at
                )
                VALUES (
                    ?,
                    ?,
                    ?,
                    0,
                    ?,
                    NULL
                )
                `,
                [
                    user.id,
                    PASSWORD_RESET_PURPOSE,
                    otpHash,
                    expiresAt,
                ]
            );

            await connection.commit();

            connection.release();
            connection = null;

            try {
                await sendPasswordResetOtp({
                    firstName:
                        user.first_name,

                    email:
                        user.email,

                    otp,
                });
            } catch (emailError) {
                console.error(
                    "Password reset OTP email error:",
                    emailError
                );

                /*
                 * Still return generic response.
                 * Don't leak account existence.
                 */
            }

            return res
                .status(200)
                .json(
                    genericResponse
                );
        } catch (error) {
            if (connection) {
                try {
                    await connection.rollback();
                } catch {
                    // ignore
                }

                connection.release();
            }

            console.error(
                "Forgot password error:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Unable to process the password reset request right now.",
                });
        }
    };

// ==========================================
// AUTH - VERIFY PASSWORD RESET OTP
// ==========================================

export const verifyResetOtp =
    async (req, res) => {
        let connection;

        try {
            const {
                email,
                otp,
            } = req.body;

            if (
                !email ||
                !otp
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Email and reset code are required.",
                    });
            }

            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            const cleanOtp =
                String(otp).trim();

            if (
                !/^\d{6}$/.test(
                    cleanOtp
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Please enter a valid 6-digit reset code.",
                    });
            }

            connection =
                await db.getConnection();

            await connection.beginTransaction();

            const [users] =
                await connection.execute(
                    `
                    SELECT
                        id,
                        email_verified_at,
                        status
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    FOR UPDATE
                    `,
                    [cleanEmail]
                );

            if (
                users.length === 0 ||
                !users[0]
                    .email_verified_at ||
                users[0].status !==
                "active"
            ) {
                await connection.rollback();

                connection.release();
                connection = null;

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid or expired reset code.",
                    });
            }

            const user =
                users[0];

            const [otpRows] =
                await connection.execute(
                    `
                    SELECT
                        id,
                        code_hash,
                        attempts,
                        expires_at
                    FROM auth_otps
                    WHERE
                        user_id = ?
                        AND purpose = ?
                        AND consumed_at IS NULL
                    ORDER BY id DESC
                    LIMIT 1
                    FOR UPDATE
                    `,
                    [
                        user.id,
                        PASSWORD_RESET_PURPOSE,
                    ]
                );

            if (
                otpRows.length === 0
            ) {
                await connection.rollback();

                connection.release();
                connection = null;

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid or expired reset code.",
                    });
            }

            const otpRecord =
                otpRows[0];

            // Attempts exhausted
            if (
                Number(
                    otpRecord.attempts
                ) >=
                MAX_OTP_ATTEMPTS
            ) {
                await connection.execute(
                    `
                    UPDATE auth_otps
                    SET consumed_at =
                        CURRENT_TIMESTAMP
                    WHERE id = ?
                    `,
                    [otpRecord.id]
                );

                await connection.commit();

                connection.release();
                connection = null;

                return res
                    .status(429)
                    .json({
                        success: false,
                        message:
                            "Too many incorrect attempts. Please request a new reset code.",
                    });
            }

            // Expired
            if (
                new Date(
                    otpRecord.expires_at
                ).getTime() <=
                Date.now()
            ) {
                await connection.execute(
                    `
                    UPDATE auth_otps
                    SET consumed_at =
                        CURRENT_TIMESTAMP
                    WHERE id = ?
                    `,
                    [otpRecord.id]
                );

                await connection.commit();

                connection.release();
                connection = null;

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Reset code has expired. Please request a new code.",
                    });
            }

            const isCorrect =
                verifyOtpHash(
                    cleanOtp,
                    otpRecord.code_hash
                );

            if (!isCorrect) {
                const newAttempts =
                    Number(
                        otpRecord.attempts
                    ) + 1;

                if (
                    newAttempts >=
                    MAX_OTP_ATTEMPTS
                ) {
                    await connection.execute(
                        `
                        UPDATE auth_otps
                        SET
                            attempts = ?,
                            consumed_at =
                                CURRENT_TIMESTAMP
                        WHERE id = ?
                        `,
                        [
                            newAttempts,
                            otpRecord.id,
                        ]
                    );
                } else {
                    await connection.execute(
                        `
                        UPDATE auth_otps
                        SET attempts = ?
                        WHERE id = ?
                        `,
                        [
                            newAttempts,
                            otpRecord.id,
                        ]
                    );
                }

                await connection.commit();

                connection.release();
                connection = null;

                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            newAttempts >=
                                MAX_OTP_ATTEMPTS
                                ? "Too many incorrect attempts. Please request a new reset code."
                                : "Incorrect reset code.",
                    });
            }

            /*
             * IMPORTANT:
             * Do NOT consume OTP here.
             *
             * Same OTP will be submitted once
             * more with the new password.
             *
             * It becomes consumed only when
             * password change succeeds.
             */

            await connection.commit();

            connection.release();
            connection = null;

            return res
                .status(200)
                .json({
                    success: true,
                    resetVerified: true,
                    message:
                        "Reset code verified. You can now create a new password.",
                });
        } catch (error) {
            if (connection) {
                try {
                    await connection.rollback();
                } catch {
                    // ignore
                }

                connection.release();
            }

            console.error(
                "Verify reset OTP error:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Unable to verify the reset code right now.",
                });
        }
    };

// ==========================================
// AUTH - RESET PASSWORD
// ==========================================

export const resetPassword =
    async (req, res) => {
        let connection;

        try {
            const {
                email,
                otp,
                password,
                confirmPassword,
            } = req.body;

            if (
                !email ||
                !otp ||
                !password ||
                !confirmPassword
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Please fill in all required fields.",
                    });
            }

            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            const cleanOtp =
                String(otp).trim();

            if (
                !/^\d{6}$/.test(
                    cleanOtp
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid reset code.",
                    });
            }

            if (
                password !==
                confirmPassword
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Password and confirm password do not match.",
                    });
            }

            if (
                password.length < 8 ||
                password.length > 128
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Password must be between 8 and 128 characters.",
                    });
            }

            if (
                !/[A-Za-z]/.test(
                    password
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Password must contain at least one letter.",
                    });
            }

            if (
                !/[0-9]/.test(
                    password
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Password must contain at least one number.",
                    });
            }

            const newPasswordHash =
                await hashPassword(
                    password
                );

            connection =
                await db.getConnection();

            await connection.beginTransaction();

            const [users] =
                await connection.execute(
                    `
                    SELECT
                        id,
                        email_verified_at,
                        status
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    FOR UPDATE
                    `,
                    [cleanEmail]
                );

            if (
                users.length === 0 ||
                !users[0]
                    .email_verified_at ||
                users[0].status !==
                "active"
            ) {
                await connection.rollback();

                connection.release();
                connection = null;

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid or expired password reset request.",
                    });
            }

            const user =
                users[0];

            const [otpRows] =
                await connection.execute(
                    `
                    SELECT
                        id,
                        code_hash,
                        attempts,
                        expires_at
                    FROM auth_otps
                    WHERE
                        user_id = ?
                        AND purpose = ?
                        AND consumed_at IS NULL
                    ORDER BY id DESC
                    LIMIT 1
                    FOR UPDATE
                    `,
                    [
                        user.id,
                        PASSWORD_RESET_PURPOSE,
                    ]
                );

            if (
                otpRows.length === 0
            ) {
                await connection.rollback();

                connection.release();
                connection = null;

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid or expired password reset request.",
                    });
            }

            const otpRecord =
                otpRows[0];

            if (
                Number(
                    otpRecord.attempts
                ) >=
                MAX_OTP_ATTEMPTS
            ) {
                await connection.rollback();

                connection.release();
                connection = null;

                return res
                    .status(429)
                    .json({
                        success: false,
                        message:
                            "Too many incorrect attempts. Please request a new reset code.",
                    });
            }

            if (
                new Date(
                    otpRecord.expires_at
                ).getTime() <=
                Date.now()
            ) {
                await connection.execute(
                    `
                    UPDATE auth_otps
                    SET consumed_at =
                        CURRENT_TIMESTAMP
                    WHERE id = ?
                    `,
                    [otpRecord.id]
                );

                await connection.commit();

                connection.release();
                connection = null;

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Password reset code has expired.",
                    });
            }

            const isCorrect =
                verifyOtpHash(
                    cleanOtp,
                    otpRecord.code_hash
                );

            if (!isCorrect) {
                const newAttempts =
                    Number(
                        otpRecord.attempts
                    ) + 1;

                await connection.execute(
                    `
                    UPDATE auth_otps
                    SET
                        attempts = ?,
                        consumed_at =
                            CASE
                                WHEN ? >= ?
                                THEN CURRENT_TIMESTAMP
                                ELSE consumed_at
                            END
                    WHERE id = ?
                    `,
                    [
                        newAttempts,
                        newAttempts,
                        MAX_OTP_ATTEMPTS,
                        otpRecord.id,
                    ]
                );

                await connection.commit();

                connection.release();
                connection = null;

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid or expired password reset request.",
                    });
            }

            // ----------------------------------
            // Update password
            // ----------------------------------

            await connection.execute(
                `
                UPDATE users
                SET
                    password_hash = ?,
                    password_changed_at =
                        CURRENT_TIMESTAMP,
                    failed_login_attempts = 0,
                    locked_until = NULL,
                    updated_at =
                        CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [
                    newPasswordHash,
                    user.id,
                ]
            );

            // ----------------------------------
            // Consume ALL reset OTPs
            // ----------------------------------

            await connection.execute(
                `
                UPDATE auth_otps
                SET consumed_at =
                    CURRENT_TIMESTAMP
                WHERE
                    user_id = ?
                    AND purpose = ?
                    AND consumed_at IS NULL
                `,
                [
                    user.id,
                    PASSWORD_RESET_PURPOSE,
                ]
            );

            // ----------------------------------
            // Revoke ALL existing sessions
            // ----------------------------------

            await connection.execute(
                `
                UPDATE auth_sessions
                SET revoked_at =
                    CURRENT_TIMESTAMP
                WHERE
                    user_id = ?
                    AND revoked_at IS NULL
                `,
                [user.id]
            );

            await connection.commit();

            connection.release();
            connection = null;

            /*
             * Clear cookie from this browser too.
             */
            res.clearCookie(
                SESSION_COOKIE_NAME,
                {
                    httpOnly: true,

                    secure:
                        process.env
                            .COOKIE_SECURE ===
                        "true",

                    sameSite: "lax",

                    path: "/",
                }
            );

            return res
                .status(200)
                .json({
                    success: true,
                    message:
                        "Password reset successfully. Please sign in with your new password.",
                });
        } catch (error) {
            if (connection) {
                try {
                    await connection.rollback();
                } catch {
                    // ignore
                }

                connection.release();
            }

            console.error(
                "Reset password error:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Unable to reset your password right now.",
                });
        }
    };

// ==========================================
// AUTH - GOOGLE LOGIN
// ==========================================

export const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required.",
            });
        }

        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error(
                "GOOGLE_CLIENT_ID is not configured."
            );

            return res.status(500).json({
                success: false,
                message:
                    "Google Sign-In is not configured.",
            });
        }

        // ----------------------------------
        // Verify Google ID token
        // ----------------------------------

        const ticket =
            await googleClient.verifyIdToken({
                idToken: credential,
                audience:
                    process.env.GOOGLE_CLIENT_ID,
            });

        const payload =
            ticket.getPayload();

        if (!payload) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid Google credential.",
            });
        }

        const googleSub =
            String(payload.sub || "").trim();

        const cleanEmail =
            String(payload.email || "")
                .trim()
                .toLowerCase();

        const emailVerified =
            Boolean(payload.email_verified);

        const firstName =
            String(
                payload.given_name || ""
            ).trim() || "Google";

        const lastName =
            String(
                payload.family_name || ""
            ).trim() || "User";

        if (
            !googleSub ||
            !cleanEmail ||
            !emailVerified
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Unable to verify your Google account.",
            });
        }

        // ----------------------------------
        // First: find existing Google account
        // ----------------------------------

        const [googleUsers] =
            await db.execute(
                `
                SELECT
                    id,
                    first_name,
                    last_name,
                    email,
                    google_sub,
                    email_verified_at,
                    status
                FROM users
                WHERE google_sub = ?
                LIMIT 1
                `,
                [googleSub]
            );

        let user = null;

        if (googleUsers.length > 0) {
            user = googleUsers[0];
        } else {
            // ----------------------------------
            // Check same email
            // ----------------------------------

            const [emailUsers] =
                await db.execute(
                    `
                    SELECT
                        id,
                        first_name,
                        last_name,
                        email,
                        google_sub,
                        password_hash,
                        email_verified_at,
                        status
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [cleanEmail]
                );

            if (emailUsers.length > 0) {
                const existingUser =
                    emailUsers[0];

                // ==================================
                // SAME EMAIL + NO GOOGLE LINK YET
                // ==================================
                //
                // Google ID token already verified
                // and email_verified === true.
                //
                // Link Google to the EXISTING user.
                // Password remains untouched, so the
                // user can use BOTH login methods.
                // ==================================

                if (!existingUser.google_sub) {
                    await db.execute(
                        `
            UPDATE users
            SET
                google_sub = ?,
                email_verified_at =
                    COALESCE(
                        email_verified_at,
                        CURRENT_TIMESTAMP
                    ),
                updated_at =
                    CURRENT_TIMESTAMP
            WHERE id = ?
            `,
                        [
                            googleSub,
                            existingUser.id,
                        ]
                    );

                    existingUser.google_sub =
                        googleSub;

                    if (
                        !existingUser
                            .email_verified_at
                    ) {
                        existingUser
                            .email_verified_at =
                            new Date();
                    }
                }

                // ==================================
                // SAFETY CHECK
                // ==================================
                //
                // Same email must never silently
                // replace a different Google account.
                // ==================================

                if (
                    existingUser.google_sub !==
                    googleSub
                ) {
                    return res
                        .status(409)
                        .json({
                            success: false,
                            message:
                                "This email is already connected to another Google account.",
                        });
                }

                user = existingUser;
            } else {
                // ----------------------------------
                // Create new Google user
                // ----------------------------------

                const [result] =
                    await db.execute(
                        `
                        INSERT INTO users
                        (
                            first_name,
                            last_name,
                            email,
                            password_hash,
                            google_sub,
                            email_verified_at,
                            status
                        )
                        VALUES
                        (
                            ?,
                            ?,
                            ?,
                            NULL,
                            ?,
                            CURRENT_TIMESTAMP,
                            'active'
                        )
                        `,
                        [
                            firstName,
                            lastName,
                            cleanEmail,
                            googleSub,
                        ]
                    );

                user = {
                    id: result.insertId,
                    first_name: firstName,
                    last_name: lastName,
                    email: cleanEmail,
                    google_sub: googleSub,
                    email_verified_at:
                        new Date(),
                    status: "active",
                };
            }
        }

        // ----------------------------------
        // Block disabled users
        // ----------------------------------

        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message:
                    "This account is currently unavailable.",
            });
        }

        // ----------------------------------
        // Create our own secure session
        // ----------------------------------

        const sessionToken =
            randomBytes(32).toString("hex");

        const tokenHash =
            hashSessionToken(
                sessionToken
            );

        const expiresAt =
            new Date(
                Date.now() +
                SESSION_DAYS *
                24 *
                60 *
                60 *
                1000
            );

        await db.execute(
            `
            INSERT INTO auth_sessions
            (
                user_id,
                token_hash,
                ip_address,
                user_agent,
                expires_at,
                last_seen_at
            )
            VALUES (?, ?, ?, ?, ?, NOW())
            `,
            [
                user.id,
                tokenHash,
                req.ip || null,
                req.get("user-agent") ||
                null,
                expiresAt,
            ]
        );

        // ----------------------------------
        // Update login info
        // ----------------------------------

        await db.execute(
            `
            UPDATE users
            SET
                last_login_at =
                    CURRENT_TIMESTAMP,
                failed_login_attempts = 0,
                locked_until = NULL
            WHERE id = ?
            `,
            [user.id]
        );

        // ----------------------------------
        // Set secure auth cookie
        // ----------------------------------

        res.cookie(
            SESSION_COOKIE_NAME,
            sessionToken,
            getSessionCookieOptions()
        );

        return res.status(200).json({
            success: true,
            message:
                "Signed in with Google successfully.",

            user: {
                id: user.id,
                firstName:
                    user.first_name,
                lastName:
                    user.last_name,
                email:
                    user.email,
            },
        });
    } catch (error) {
        console.error(
            "Google login error:",
            error
        );

        return res.status(401).json({
            success: false,
            message:
                "Google Sign-In failed. Please try again.",
        });
    }
};

// ==========================================
// AUTH - UPLOAD PROFILE IMAGE
// ==========================================

export const uploadProfileImage =
    async (req, res) => {
        let newFilePath = null;

        try {
            if (!req.file) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Please select a profile image.",
                    });
            }

            const userId =
                req.auth?.userId;

            if (!userId) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        message:
                            "Authentication required.",
                    });
            }

            newFilePath =
                path.join(
                    USER_PROFILE_DIR,
                    req.file.filename
                );

            const [users] =
                await db.execute(
                    `
                    SELECT
                        id,
                        profile_image
                    FROM users
                    WHERE
                        id = ?
                        AND status = 'active'
                    LIMIT 1
                    `,
                    [userId]
                );

            if (
                users.length === 0
            ) {
                try {
                    await unlink(
                        newFilePath
                    );
                } catch {
                    // ignore cleanup error
                }

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "User account not found.",
                    });
            }

            const oldProfileImage =
                users[0].profile_image;

            const profileImage =
                `/public_assets/user_profile/${req.file.filename}`;

            await db.execute(
                `
                UPDATE users
                SET
                    profile_image = ?,
                    updated_at =
                        CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [
                    profileImage,
                    userId,
                ]
            );

            // Delete old profile image
            if (
                oldProfileImage &&
                oldProfileImage.startsWith(
                    "/public_assets/user_profile/"
                )
            ) {
                const oldFileName =
                    path.basename(
                        oldProfileImage
                    );

                const oldFilePath =
                    path.join(
                        USER_PROFILE_DIR,
                        oldFileName
                    );

                try {
                    await unlink(
                        oldFilePath
                    );
                } catch (error) {
                    if (
                        error.code !==
                        "ENOENT"
                    ) {
                        console.error(
                            "Old profile image delete error:",
                            error
                        );
                    }
                }
            }

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Profile picture updated successfully.",

                    profileImage,
                });
        } catch (error) {
            console.error(
                "Profile image upload error:",
                error
            );

            // DB fail ho to newly uploaded
            // orphan file remove kar dein
            if (newFilePath) {
                try {
                    await unlink(
                        newFilePath
                    );
                } catch {
                    // ignore cleanup error
                }
            }

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Unable to update profile picture.",
                });
        }
    };

// ==========================================
// AUTH - UPDATE PROFILE
// ==========================================

export const updateProfile =
    async (req, res) => {
        let connection;

        try {
            const userId =
                req.auth?.userId;

            const sessionId =
                req.auth?.sessionId;

            if (!userId) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        message:
                            "Authentication required.",
                    });
            }

            const {
                firstName,
                lastName,
                currentPassword,
                newPassword,
                confirmPassword,
            } = req.body;

            // ==================================
            // NAME VALIDATION
            // ==================================

            const cleanFirstName =
                String(
                    firstName || ""
                ).trim();

            const cleanLastName =
                String(
                    lastName || ""
                ).trim();

            if (
                cleanFirstName.length < 2 ||
                cleanFirstName.length > 100
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "First name must be between 2 and 100 characters.",
                    });
            }

            if (
                cleanLastName.length < 2 ||
                cleanLastName.length > 100
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Last name must be between 2 and 100 characters.",
                    });
            }

            // ==================================
            // CHECK IF PASSWORD CHANGE REQUESTED
            // ==================================

            const wantsPasswordChange =
                Boolean(
                    currentPassword ||
                    newPassword ||
                    confirmPassword
                );

            if (
                wantsPasswordChange &&
                (
                    !newPassword ||
                    !confirmPassword
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Please enter and confirm your new password.",
                    });
            }

            if (
                wantsPasswordChange &&
                newPassword !==
                confirmPassword
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "New password and confirm password do not match.",
                    });
            }

            if (
                wantsPasswordChange &&
                (
                    newPassword.length < 8 ||
                    newPassword.length > 128
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Password must be between 8 and 128 characters.",
                    });
            }

            if (
                wantsPasswordChange &&
                !/[A-Za-z]/.test(
                    newPassword
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Password must contain at least one letter.",
                    });
            }

            if (
                wantsPasswordChange &&
                !/[0-9]/.test(
                    newPassword
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Password must contain at least one number.",
                    });
            }

            connection =
                await db.getConnection();

            await connection
                .beginTransaction();

            // ==================================
            // CURRENT USER
            // ==================================

            const [users] =
                await connection.execute(
                    `
                    SELECT
                        id,
                        email,
                        password_hash,
                        status
                    FROM users
                    WHERE id = ?
                    LIMIT 1
                    FOR UPDATE
                    `,
                    [userId]
                );

            if (
                users.length === 0 ||
                users[0].status !==
                "active"
            ) {
                await connection
                    .rollback();

                connection.release();
                connection = null;

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "User account not found.",
                    });
            }

            const user =
                users[0];

            let newPasswordHash =
                null;

            // ==================================
            // PASSWORD CHANGE
            // ==================================

            if (wantsPasswordChange) {

                /*
                 * Existing password account:
                 * current password required.
                 */
                if (
                    user.password_hash
                ) {
                    if (
                        !currentPassword
                    ) {
                        await connection
                            .rollback();

                        connection.release();
                        connection = null;

                        return res
                            .status(400)
                            .json({
                                success:
                                    false,

                                message:
                                    "Please enter your current password.",
                            });
                    }

                    const passwordCorrect =
                        await verifyPassword(
                            currentPassword,
                            user.password_hash
                        );

                    if (
                        !passwordCorrect
                    ) {
                        await connection
                            .rollback();

                        connection.release();
                        connection = null;

                        return res
                            .status(400)
                            .json({
                                success:
                                    false,

                                message:
                                    "Current password is incorrect.",
                            });
                    }
                }

                /*
                 * Google-only account:
                 * password_hash is NULL.
                 *
                 * Logged-in Google session is
                 * enough to create a password.
                 */
                newPasswordHash =
                    await hashPassword(
                        newPassword
                    );
            }

            // ==================================
            // UPDATE NAME
            // ==================================

            await connection.execute(
                `
                UPDATE users
                SET
                    first_name = ?,
                    last_name = ?,
                    updated_at =
                        CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [
                    cleanFirstName,
                    cleanLastName,
                    userId,
                ]
            );

            // ==================================
            // UPDATE PASSWORD IF REQUESTED
            // ==================================

            if (
                wantsPasswordChange
            ) {
                await connection.execute(
                    `
                    UPDATE users
                    SET
                        password_hash = ?,
                        password_changed_at =
                            CURRENT_TIMESTAMP,
                        failed_login_attempts = 0,
                        locked_until = NULL,
                        updated_at =
                            CURRENT_TIMESTAMP
                    WHERE id = ?
                    `,
                    [
                        newPasswordHash,
                        userId,
                    ]
                );

                /*
                 * Revoke other sessions,
                 * but keep current session alive.
                 */
                await connection.execute(
                    `
                    UPDATE auth_sessions
                    SET revoked_at =
                        CURRENT_TIMESTAMP
                    WHERE
                        user_id = ?
                        AND id <> ?
                        AND revoked_at IS NULL
                    `,
                    [
                        userId,
                        sessionId,
                    ]
                );
            }

            await connection.commit();

            connection.release();
            connection = null;

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        wantsPasswordChange
                            ? "Profile and password updated successfully."
                            : "Profile updated successfully.",

                    passwordChanged:
                        wantsPasswordChange,

                    user: {
                        firstName:
                            cleanFirstName,

                        lastName:
                            cleanLastName,

                        email:
                            user.email,
                    },
                });

        } catch (error) {
            if (connection) {
                try {
                    await connection
                        .rollback();
                } catch {
                    // ignore
                }

                connection.release();
            }

            console.error(
                "Update profile error:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Unable to update profile right now.",
                });
        }
    };