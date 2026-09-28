import "dotenv/config";
import {
    sendContactEmails,
    sendVerificationOtp,
} from "../Email/email.js";
import db from "../DB/db.js";
import {
    randomBytes,
    randomInt,
    createHmac,
    timingSafeEqual,
    scrypt as scryptCallback,
} from "node:crypto";

import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const OTP_PURPOSE =
    "email_verification";

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
