import "dotenv/config";
import { sendContactEmails } from "../Email/email.js";
import db from "../DB/db.js";
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