import { sendContactEmails } from "../Email/email.js";

export const contactForm = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            subject,
            message,
        } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields.",
            });
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        await sendContactEmails({
            name: name.trim(),
            email: email.trim(),
            phone: phone?.trim() || "",
            subject: subject.trim(),
            message: message.trim(),
        });

        return res.status(200).json({
            success: true,
            message:
                "Your message has been sent successfully.",
        });
    } catch (error) {
        console.error("Contact form error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Unable to send your message. Please try again later.",
        });
    }
};