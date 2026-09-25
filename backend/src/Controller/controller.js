import "dotenv/config";
import { sendContactEmails } from "../Email/email.js";
import db from "../DB/db.js";

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